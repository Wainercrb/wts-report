import * as vscode from 'vscode';
import { WebviewMessage, UrlEntry, StoredItem, IWebviewManager, ILLMService, ILogger } from '../types';
import { getGitHistoryForUrls } from '../utils/git';
import { tryCatch } from '../utils/errors';
import { COMMANDS, CONFIG } from '../consts';

/**
 * Handles messages from the webview and routes them to appropriate handlers
 */
export class MessageHandler {
  constructor(
    private webviewManager: IWebviewManager,
    private llmService: ILLMService,
    private logger: ILogger
  ) {}

  async handle(message: unknown): Promise<void> {
    if (!this.isWebviewMessage(message)) {
      return;
    }

    const webMessage = message as WebviewMessage;

    switch (webMessage.command) {
      case CONFIG.INFO_ALERT:
        this.handleShowInfo(webMessage);
        break;
      case COMMANDS.AUTOMATIC_TIMESHEET_REPORT:
        await this.handleCheckGitHistory(webMessage as { command: typeof COMMANDS.AUTOMATIC_TIMESHEET_REPORT; urls: UrlEntry[]; storedItems?: StoredItem[] });
        break;
      case COMMANDS.MANUAL_TIMESHEET_REPORT:
        await this.llmService.runManualTimeSheetReport(JSON.stringify(webMessage.values));
        break;
      case COMMANDS.GET_AVAILABLE_MODELS:
        await this.handleGetModelInfo();
        break;
      default:
        this.logger.log([`Unknown command: ${(webMessage as Record<string, unknown>).command}`]);
    }
  }

  private handleShowInfo(message: { command: typeof CONFIG.INFO_ALERT; text: string }): void {
    if (message.text) {
      vscode.window.showInformationMessage(message.text);
    }
  }

  private async handleCheckGitHistory(message: { command: typeof COMMANDS.AUTOMATIC_TIMESHEET_REPORT; urls: UrlEntry[]; storedItems?: StoredItem[] }): Promise<void> {
    const urls = this.extractUrls(message.urls);
    if (!urls) {
      vscode.window.showErrorMessage('No URLs data received');
      return;
    }

    const gitChangesResult = await tryCatch(
      () => getGitHistoryForUrls(urls),
      (lines: string[]) => this.logger.log(lines),
      'getting git history'
    );
    if (!gitChangesResult.ok) {
      this.webviewManager.postMessage({
        command: 'gitHistoryResult',
        result: `Error: ${gitChangesResult.error}`
      });
      return;
    }

    const storedItems = Array.isArray(message.storedItems) ? message.storedItems : undefined;
    this.logger.log([`Processing ${gitChangesResult.value.length} git change(s)`]);
    if (storedItems && storedItems.length > 0) {
      this.logger.log([`Including ${storedItems.length} stored item(s)`]);
    }
    const timesheet = await this.llmService.runAutomaticTimeSheetReport(gitChangesResult.value, storedItems);
    this.webviewManager.postMessage({
      command: 'gitHistoryResult',
      result: timesheet
    });
  }

  private async handleGetModelInfo(): Promise<void> {
    const result = await this.llmService.getSelectedModelInfo();
    // this.webviewManager.postMessage({
    //   command: 'modelInfo',
    //   modelInfo: result ?? []
    // }); 
  }

  private isWebviewMessage(obj: unknown): obj is WebviewMessage {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof (obj as Record<string, unknown>).command === 'string'
    );
  }

  private extractUrls(data: unknown): UrlEntry[] | null {
    if (!Array.isArray(data)) {
      return null;
    }
    if (!data.every(
      (el): el is { id: string; url: string } =>
        typeof el === 'object' &&
        el !== null &&
        typeof (el as Record<string, unknown>).id === 'string' &&
        typeof (el as Record<string, unknown>).url === 'string'
    )) {
      return null;
    }
    return data;
  }
}