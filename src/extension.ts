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

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  const logger = new Logger(outputChannel);

  const webviewManager = new WebviewManager();
  const llmService = new LLMService((lines: string[]) => logger.log(lines), webviewManager);
  const messageHandler = new MessageHandler(webviewManager, llmService, logger);

  context.subscriptions.push(outputChannel);

  const startCommand = vscode.commands.registerCommand(START_COMMAND_NAME, () => {
    webviewManager.createPanel(context);
    webviewManager.registerMessageHandler(
      (message: unknown) => {
        messageHandler.handle(message).catch(err => {
          logger.log([`Error handling message: ${err}`]);
        });
      },
      context
    );
  });
  context.subscriptions.push(startCommand);

  const llmCheckingCommand = vscode.commands.registerCommand(
    LLM_CHECKING_COMMAND,
    async (prompt: string) => {
      await llmService.runQuery(String(prompt));
    }
  );
  context.subscriptions.push(llmCheckingCommand);

  if (vscode.chat?.createChatParticipant) {
    const chatParticipant = vscode.chat.createChatParticipant(
      'llm-checking',
      async (request, ctx, response, token) => {
        await llmService.runQuery(request.prompt, response, token);
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