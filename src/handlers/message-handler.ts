import * as vscode from "vscode";
import {
  WebviewMessage,
  UrlEntry,
  StoredItem,
  IWebviewManager,
  ILLMService,
  ILogger,
} from "../types";
import { getGitHistoryForUrls } from "../utils/git";
import { COMMANDS, CONFIG } from "../consts";

/**
 * Handles messages from the webview and routes them to appropriate handlers
 */
export class MessageHandler {
  constructor(
    private webviewManager: IWebviewManager,
    private llmService: ILLMService,
    private logger: ILogger,
  ) {}

  async handle(message: unknown): Promise<void> {
    console.log("noooooooooooooooooooo");
    if (!this.isWebviewMessage(message)) {
      return;
    }


    const webMessage = message as WebviewMessage;

    console.log("Received message from webview:", webMessage);

    switch (webMessage.command) {
      case CONFIG.INFO_ALERT:
        this.handleShowInfo(webMessage);
        break;
      case COMMANDS.AUTOMATIC_TIMESHEET_REPORT:
        await this.handleCheckGitHistory(
          webMessage as {
            command: typeof COMMANDS.AUTOMATIC_TIMESHEET_REPORT;
            urls: UrlEntry[];
            storedItems?: StoredItem[];
          },
        );
        break;
      case COMMANDS.MANUAL_TIMESHEET_REPORT:
        await this.handleManualTimesheetReport(webMessage as {
          command: typeof COMMANDS.MANUAL_TIMESHEET_REPORT;
          values: Record<string, unknown>;
        });
        break;
      case COMMANDS.GET_AVAILABLE_MODELS:
        await this.handleGetModelInfo();
        break;
      default:
        this.logger.log([
          `Unknown command: ${(webMessage as Record<string, unknown>).command}`,
        ]);
    }
  }


  private async handleManualTimesheetReport(message: {
    command: typeof COMMANDS.MANUAL_TIMESHEET_REPORT;
    values: Record<string, unknown>;
  }): Promise<void> {
    const result = await this.llmService.runManualTimeSheetReport(
      JSON.stringify(message.values),
    );

    this.webviewManager.postMessage({
      command: COMMANDS.AUTOMATIC_TIMESHEET_REPORT,
      result,
    });
  }

  private handleShowInfo(message: {
    command: typeof CONFIG.INFO_ALERT;
    text: string;
  }): void {
    if (message.text) {
      vscode.window.showInformationMessage(message.text);
    }
  }

  private async handleCheckGitHistory(message: {
    command: typeof COMMANDS.AUTOMATIC_TIMESHEET_REPORT;
    urls: UrlEntry[];
    storedItems?: StoredItem[];
  }): Promise<void> {
    const urls = this.extractUrls(message.urls);
    if (!urls) {
      vscode.window.showErrorMessage("No URLs data received");
      return;
    }

    const gitHistory = await getGitHistoryForUrls(urls);

    const storedItems = Array.isArray(message.storedItems)
      ? message.storedItems
      : undefined;
    // this.logger.log([
    //   `Processing ${gitChangesResult.value.length} git change(s)`,
    // ]);
    if (storedItems && storedItems.length > 0) {
      this.logger.log([`Including ${storedItems.length} stored item(s)`]);
    }
    const timesheet = await this.llmService.runAutomaticTimeSheetReport(
      gitHistory,
      storedItems,
    );
    this.webviewManager.postMessage({
      command: COMMANDS.AUTOMATIC_TIMESHEET_REPORT,
      result: timesheet,
    });
  }

  private async handleGetModelInfo(): Promise<void> {
    this.logger.log([`Fetching available models info...`, 'hre hre hre']);
    const result = await this.llmService.getSelectedModelInfo();
    this.webviewManager.postMessage({
      command: COMMANDS.GET_AVAILABLE_MODELS,
      modelInfo: result ?? []
    });
  }

  private isWebviewMessage(obj: unknown): obj is WebviewMessage {
    return (
      typeof obj === "object" &&
      obj !== null &&
      typeof (obj as Record<string, unknown>).command === "string"
    );
  }

  private extractUrls(data: unknown): UrlEntry[] | null {
    if (!Array.isArray(data)) {
      return null;
    }
    if (
      !data.every(
        (el): el is { id: string; url: string } =>
          typeof el === "object" &&
          el !== null &&
          typeof (el as Record<string, unknown>).id === "string" &&
          typeof (el as Record<string, unknown>).url === "string",
      )
    ) {
      return null;
    }
    return data;
  }
}
