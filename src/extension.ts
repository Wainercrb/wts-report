import * as vscode from 'vscode';
import {
  START_COMMAND_NAME,
  LLM_CHECKING_COMMAND,
  OUTPUT_CHANNEL_NAME
} from './config';
import { WebviewMessage, ILogger } from './types';
import { LLMService } from './services/llm-service';
import { WebviewManager } from './services/webview';
import { MessageHandler } from './handlers/message-handler';

/**
 * Simple logger implementation using VS Code output channel
 */
class Logger implements ILogger {
  constructor(private outputChannel: vscode.OutputChannel) {}

  log(lines: string[]): void {
    for (const line of lines) {
      this.outputChannel.appendLine(line);
    }
    if (String(process.env.DEBUG).toLowerCase() === 'true') {
      this.outputChannel.show(true);
    }
  }
}

/**
 * Main extension state
 */
let outputChannel: vscode.OutputChannel | undefined;
let webviewManager: WebviewManager | undefined;
let messageHandler: MessageHandler | undefined;
let llmService: LLMService | undefined;

/**
 * Extension activation entry point
 */
export function activate(context: vscode.ExtensionContext): void {
  // Initialize services
  outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  const logger = new Logger(outputChannel);

  webviewManager = new WebviewManager();
  llmService = new LLMService((lines: string[]) => logger.log(lines), webviewManager);
  messageHandler = new MessageHandler(webviewManager, llmService, logger);

  // Register subscriptions for cleanup
  context.subscriptions.push(outputChannel);

  // Register start command
  const startCommand = vscode.commands.registerCommand(START_COMMAND_NAME, () => {
    webviewManager!.createPanel(context);
    webviewManager!.registerMessageHandler(
      (message: unknown) => messageHandler!.handle(message),
      context
    );
  });
  context.subscriptions.push(startCommand);

  // Register LLM checking command
  const llmCheckingCommand = vscode.commands.registerCommand(
    LLM_CHECKING_COMMAND,
    async (prompt: string) => {
      await llmService!.runQuery(String(prompt));
    }
  );
  context.subscriptions.push(llmCheckingCommand);

  // Register chat participant
  if (vscode.chat?.createChatParticipant) {
    const chatParticipant = vscode.chat.createChatParticipant(
      'llm-checking',
      async (request, ctx, response, token) => {
        await llmService!.runQuery(request.prompt, response, token);
      }
    );
    context.subscriptions.push(chatParticipant);
  }
}

/**
 * Extension deactivation (cleanup)
 */
export function deactivate(): void {
  // VS Code automatically cleans up subscriptions
}