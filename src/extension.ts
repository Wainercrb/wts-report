import * as vscode from 'vscode';
import {
  START_COMMAND_NAME,
  OUTPUT_CHANNEL_NAME
} from './config';
import { Logger } from './services/logger';
import { ChatModelProvider } from './services/chat-model-provider';
import { LLMService } from './services/llm-service';
import { WebviewManager } from './services/webview';
import { MessageHandler } from './handlers/message-handler';

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  const logger = new Logger(outputChannel);

  const webviewManager = new WebviewManager();
  const chatModelProvider = new ChatModelProvider(logger);
  const llmService = new LLMService(
    chatModelProvider,
    logger
  );
  const messageHandler = new MessageHandler(webviewManager, llmService, logger);

  context.subscriptions.push(outputChannel);

  const startCommand = vscode.commands.registerCommand(START_COMMAND_NAME, () => {
    webviewManager.createPanel(context);
    webviewManager.registerMessageHandler(
      (message: unknown) => {
        messageHandler.handle(message).catch(err => {
          logger.error(`Error handling message: ${err}`);
        });
      },
      context
    );
  });
  context.subscriptions.push(startCommand);
}

/**
 * Extension deactivation (cleanup)
 */
export function deactivate(): void {
  // VS Code automatically cleans up subscriptions
}
