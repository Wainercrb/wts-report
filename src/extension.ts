import * as vscode from "vscode";
import { COMMANDS, START_COMMAND_NAME } from "./consts";
import { ChatModelProvider } from "./services/chat-model-provider";
import { LLMService } from "./services/llm-service";
import { WebviewManager } from "./services/webview";
import { MessageHandler } from "./handlers/message-handler";
import { Logger } from "./services/logger-service";

export function activate(context: vscode.ExtensionContext): void {
  const logger = new Logger();
  const webviewManager = new WebviewManager();
  const chatModelProvider = new ChatModelProvider();
  const llmService = new LLMService(chatModelProvider, logger);
  const messageHandler = new MessageHandler(webviewManager, llmService, logger);

  const startCommand = vscode.commands.registerCommand(
    START_COMMAND_NAME,
    () => {
      webviewManager.createPanel(context);
      webviewManager.registerMessageHandler(messageHandler.handle, context);
    },
  );
  context.subscriptions.push(startCommand);

  // const manualTimesheetReportCommand = vscode.commands.registerCommand(
  //   COMMANDS.MANUAL_TIMESHEET_REPORT,
  //   () => {
  //     webviewManager.createPanel(context);
  //     webviewManager.registerMessageHandler(messageHandler.handle, context);
  //   },
  // );
  // context.subscriptions.push(manualTimesheetReportCommand);

  //   if (vscode.chat?.createChatParticipant) {
  //     const chatParticipant = vscode.chat.createChatParticipant(
  //       'llm-checking',
  //       async (request, ctx, response, token) => {
  //         await llmService.runManualTimeSheetReport(request.prompt, response, token);
  //       }
  //     );
  //     context.subscriptions.push(chatParticipant);
  //   }
}

/**
 * Extension deactivation (cleanup)
 */
export function deactivate(): void {
  // VS Code automatically cleans up subscriptions
}
