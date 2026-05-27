import * as vscode from "vscode";
import { START_COMMAND_NAME, OUTPUT_CHANNEL_NAME } from "./constants/config";
import { Logger } from "./services/logger";
import { ChatModelProvider } from "./services/chat-model-provider";
import { LLMService } from "./services/llm-service";
import { WebviewManager } from "./services/webview";
import { MessageService } from "./services/message-service";
import { SanitizationService } from "./services/sanitization-service";
import { MessageHandler } from "./handlers/message-handler";
import { getErrorMessage } from "./utils/error";

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  
  const webviewManager = new WebviewManager();
  const messageService = new MessageService();
  const sanitizationService = new SanitizationService();
  const logger = new Logger(outputChannel);
  const chatModelProvider = new ChatModelProvider(logger);
  const llmService = new LLMService(chatModelProvider, logger);
  const messageHandler = new MessageHandler(
    webviewManager,
    llmService,
    logger,
    messageService,
    sanitizationService,
  );

  context.subscriptions.push(outputChannel);

  const startCommand = vscode.commands.registerCommand(
    START_COMMAND_NAME,
    () => {
      webviewManager.createPanel(context);
      webviewManager.registerMessageHandler((message: unknown) => {
        messageHandler.handle(message).catch((err) => {
          logger.error(`Error handling message: ${getErrorMessage(err)}`);
        });
      }, context);
    },
  );
  context.subscriptions.push(startCommand);
}

export function deactivate(): void {}
