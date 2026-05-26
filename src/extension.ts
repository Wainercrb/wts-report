import * as vscode from "vscode";
import { START_COMMAND_NAME } from "./consts";
import { LLMService } from "./services/llm-service";
import { WebviewManager } from "./services/webview";
import { MessageHandler } from "./handlers/message-handler";
import { Logger } from "./services/logger-service";

export function activate(context: vscode.ExtensionContext): void {
  const logger = new Logger();
  const webviewManager = new WebviewManager();
  const llmService = new LLMService(logger);
  const messageHandler = new MessageHandler(webviewManager, llmService, logger);

  const startCommand = vscode.commands.registerCommand(
    START_COMMAND_NAME,
    () => {
      webviewManager.createPanel(context);
      webviewManager.registerMessageHandler(messageHandler.handle, context);
    },
  );
  context.subscriptions.push(startCommand);
}

/**
 * Extension deactivation (cleanup)
 */
export function deactivate(): void {
  // VS Code automatically cleans up subscriptions
}
