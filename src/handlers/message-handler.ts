import * as vscode from 'vscode';
import { WebviewMessage, UrlEntry, IWebviewManager, ILLMService, ILogger, ShowInfoMsg, AutomaticTimesheetMsg, ManualTimesheetMsg, SelectModelMsg } from '../types';
import { getGitHistoryForUrls } from '../utils/git';
import { COMMANDS, RESPONSE } from '../consts';

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

    switch (message.command) {
      case COMMANDS.SHOW_INFORMATION:
        this.handleShowInfo(message);
        break;
      case COMMANDS.AUTOMATIC_TIMESHEET:
        await this.automaticTimeSheetReport(message);
        break;
      case COMMANDS.MANUAL_TIMESHEET:
        await this.manualTimeSheetReport(message);
        break;
      case COMMANDS.GET_MODEL_INFO:
        await this.handleGetModelInfo();
        break;
      case COMMANDS.SELECT_MODEL:
        this.handleSelectModel(message);
        break;
      default:
        this.logger.warn(`Unknown command: ${(message as Record<string, unknown>).command}`);
    }
  }

  private handleShowInfo(message: ShowInfoMsg): void {
    if (message.text) {
      vscode.window.showInformationMessage(message.text);
    }
  }

  private async automaticTimeSheetReport(message: AutomaticTimesheetMsg): Promise<void> {
    const urls = this.extractUrls(message.urls);
    if (!urls) {
      vscode.window.showErrorMessage('No URLs data received');
      return;
    }

    try {
      const gitChanges = await getGitHistoryForUrls(urls);
      const storedItems = Array.isArray(message.storedItems) ? message.storedItems : undefined;
    
      const result = await this.llmService.runAutomaticSpreadsheetQuery(gitChanges, storedItems);
    
      this.webviewManager.postMessage({
        [RESPONSE.GIT_HISTORY_RESULT]: result 
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to generate timesheet: ${errMsg}`);
      vscode.window.showErrorMessage('Failed to generate timesheet: ' + errMsg);
    }
  }

  private async manualTimeSheetReport(message: ManualTimesheetMsg): Promise<void> {
    const vals = message.values;
    
    try {
      vscode.window.showInformationMessage('Processing form submission...');
 
      const result = await this.llmService.runManualSpreadsheetQuery(JSON.stringify(vals));

      this.webviewManager.postMessage({
        [RESPONSE.LLM_RESULT]: result
      });

      vscode.window.showInformationMessage('Form processed successfully! Check the output for results.');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to process form: ${errMsg}`);
      vscode.window.showErrorMessage('Failed to process form: ' + errMsg);
    }
  }

  private async handleGetModelInfo(): Promise<void> {
    try {
      const models = await this.llmService.getModelList();

      this.webviewManager.postMessage({
        [RESPONSE.MODEL_INFO]: { models }
      });
    } catch (err) {
      this.logger.error(`Error getting model info: ${err instanceof Error ? err.message : String(err)}`);
      vscode.window.showErrorMessage('Failed to retrieve model information');
    }
  }

  private handleSelectModel(message: SelectModelMsg): void {
    this.llmService.setSelectedModelId(message.modelId);
    this.logger.info(`Model selection updated: ${message.modelId}`);
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