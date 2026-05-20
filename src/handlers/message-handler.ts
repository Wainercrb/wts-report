import * as vscode from 'vscode';
import { WebviewMessage, IWebviewManager, ICommandExecutor, ILLMService, ILogger } from '../types';
import { listDirectory } from '../utils/command';
import { getGitHistoryForUrls } from '../utils/git';

/**
 * Handles messages from the webview and routes them to appropriate handlers
 */
export class MessageHandler {
  constructor(
    private webviewManager: IWebviewManager,
    private llmService: ILLMService,
    private logger: ILogger
  ) {}

  /**
   * Main handler for all webview messages
   */
  handle(message: unknown): void {
    if (!this.isWebviewMessage(message)) {
      return;
    }

    const webMessage = message as WebviewMessage;

    switch (webMessage.command) {
      case 'showInformationMessage':
        this.handleShowInfo(webMessage);
        break;
      case 'getDirectoryInfo':
        this.handleGetDirectoryInfo();
        break;
      case 'checkGitHistory':
        this.handleCheckGitHistory(webMessage);
        break;
      case 'formValues':
        this.handleFormValues(webMessage);
        break;
      default:
        this.logger.log([`Unknown command: ${webMessage.command}`]);
    }
  }

  private handleShowInfo(message: WebviewMessage): void {
    const text = message.text as string | undefined;
    if (text) {
      vscode.window.showInformationMessage(text);
    }
  }

  private async handleGetDirectoryInfo(): Promise<void> {
    try {
      const result = await listDirectory();
      this.webviewManager.postMessage({
        command: 'getDirectoryInfo',
        directoryInfo: result
      });
    } catch (error) {
      this.logger.log([`Error getting directory info: ${error}`]);
    }
  }

  private async handleCheckGitHistory(message: WebviewMessage): Promise<void> {
    try {
      const urls = message.urls as unknown;
      if (!Array.isArray(urls)) {
        vscode.window.showErrorMessage('No URLs data received');
        return;
      }

      // Process git history and format with LLM
      const gitChanges = await getGitHistoryForUrls(
        urls as Array<{ id: string; url: string }>
      );
      
      this.logger.log([`Got ${gitChanges.length} git change(s), sending to LLM`]);
      
      const timesheet = await this.llmService.formatGitChangesAsTimesheet(gitChanges);
      
      this.webviewManager.postMessage({
        command: 'gitHistoryResult',
        result: timesheet
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.log([`Error processing git history: ${errorMsg}`]);
      
      this.webviewManager.postMessage({
        command: 'gitHistoryResult',
        result: `Error: ${errorMsg}`
      });
    }
  }

  private async handleFormValues(message: WebviewMessage): Promise<void> {
    const vals = message.values as unknown;
    vscode.window.showInformationMessage('Processing form submission...');

    try {
      this.logger.log(['Form values received from webview:']);
      this.logger.log([JSON.stringify(vals, null, 2)]);
    } catch {
      this.logger.log([String(vals)]);
    }

    try {
      await this.llmService.runQuery(JSON.stringify(vals));
      
      // Show success feedback
      vscode.window.showInformationMessage('Form processed successfully! Check the output for results.');
      this.logger.log(['Form processing completed']);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      this.logger.log(['Failed to process form: ' + errorMsg]);
      vscode.window.showErrorMessage('Failed to process form: ' + errorMsg);
    }
  }

  private isWebviewMessage(obj: unknown): obj is WebviewMessage {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof (obj as Record<string, unknown>).command === 'string'
    );
  }
}