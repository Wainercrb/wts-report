import * as vscode from 'vscode';
import { WebviewMessage, UrlEntry, StoredItem, IWebviewManager, ILLMService, ILogger } from '../types';
import { listDirectory } from '../utils/command';
import { getGitHistoryForUrls } from '../utils/git';
import { tryCatch } from '../utils/errors';

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
      case 'showInformationMessage':
        this.handleShowInfo(webMessage);
        break;
      case 'getDirectoryInfo':
        await this.handleGetDirectoryInfo();
        break;
      case 'checkGitHistory':
        await this.handleCheckGitHistory(webMessage);
        break;
      case 'formValues':
        await this.handleFormValues(webMessage);
        break;
      case 'getModelInfo':
        await this.handleGetModelInfo();
        break;
      default:
        this.logger.log([`Unknown command: ${(webMessage as Record<string, unknown>).command}`]);
    }
  }

  private handleShowInfo(message: { command: 'showInformationMessage'; text: string }): void {
    if (message.text) {
      vscode.window.showInformationMessage(message.text);
    }
  }

  private async handleGetDirectoryInfo(): Promise<void> {
    const result = await tryCatch(
      () => listDirectory(),
      (lines: string[]) => this.logger.log(lines),
      'getting directory info'
    );
    if (result.ok) {
      this.webviewManager.postMessage({
        command: 'getDirectoryInfo',
        directoryInfo: result.value
      });
    }
  }

  private async handleCheckGitHistory(message: { command: 'checkGitHistory'; urls: UrlEntry[]; storedItems?: StoredItem[] }): Promise<void> {
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
    const timesheet = await this.llmService.formatGitChangesAsTimesheet(gitChangesResult.value, storedItems);
    this.webviewManager.postMessage({
      command: 'gitHistoryResult',
      result: timesheet
    });
  }

  private async handleFormValues(message: { command: 'formValues'; values: Record<string, unknown> }): Promise<void> {
    const vals = message.values;
    vscode.window.showInformationMessage('Processing form submission...');
    this.logger.log(['Form values received from webview:', JSON.stringify(vals, null, 2)]);

    const result = await tryCatch(
      () => this.llmService.runQuery(JSON.stringify(vals)),
      (lines: string[]) => this.logger.log(lines),
      'processing form'
    );

    if (result.ok) {
      vscode.window.showInformationMessage('Form processed successfully! Check the output for results.');
      this.logger.log(['Form processing completed']);
    } else {
      this.logger.log(['Failed to process form: ' + result.error]);
      vscode.window.showErrorMessage('Failed to process form: ' + result.error);
    }
  }

  private async handleGetModelInfo(): Promise<void> {
    const result = await tryCatch(
      () => this.llmService.getSelectedModelInfo(),
      (lines: string[]) => this.logger.log(lines),
      'getting model info'
    );

    if (result.ok) {
      this.webviewManager.postMessage({
        command: 'modelInfo',
        modelInfo: result.value
      });
    } else {
      this.webviewManager.postMessage({
        command: 'modelInfo',
        modelInfo: {
          selectedModel: null,
          availableModels: [],
          isFreeModel: false,
          freeModelNotFound: true
        }
      });
    }
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