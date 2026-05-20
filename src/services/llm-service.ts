import * as vscode from 'vscode';
import { ILLMService, GitChange, IWebviewManager } from '../types';
import { getFormattedDate } from '../utils/formatting';
import { getTimesheetPrompt, getWorkLogPrompt } from '../prompts';

/**
 * Service for interacting with LLM (Language Model) APIs
 */
export class LLMService implements ILLMService {
  private debugLog: (lines: string[]) => void = () => {};
  private webviewManager: IWebviewManager | undefined;

  constructor(debugLogFn?: (lines: string[]) => void, webviewManager?: IWebviewManager) {
    if (debugLogFn) {
      this.debugLog = debugLogFn;
    }
    if (webviewManager) {
      this.webviewManager = webviewManager;
    }
  }

  /**
   * Format git changes into a professional timesheet
   */
  async formatGitChangesAsTimesheet(gitChanges: GitChange[]): Promise<string> {
    if (gitChanges.length === 0) {
      return 'No git changes found for today';
    }

    try {
      // Format changes for display
      const formattedChanges = gitChanges
        .map((change) => `[${change.branch}][${change.project}]${change.changes}`)
        .join('\n\n');

      const today = getFormattedDate();
      const PROMPT = getTimesheetPrompt(today);

      const chatModel = await vscode.lm.selectChatModels({ family: 'gpt-4o' });
      if (!chatModel || chatModel.length === 0) {
        this.debugLog(['formatGitChangesAsTimesheet: No gpt-4o model available']);
        return formattedChanges;
      }

      const messages = [
        vscode.LanguageModelChatMessage.User(PROMPT),
        vscode.LanguageModelChatMessage.User(`Git commits by ticket:\n${formattedChanges}`)
      ];

      const chatRequest = await chatModel[0].sendRequest(messages, undefined, undefined);

      let fullText = '';
      for await (const chunk of chatRequest.text) {
        fullText += String(chunk);
      }

      this.debugLog(['formatGitChangesAsTimesheet: LLM completed successfully']);
      return fullText;
    } catch (err) {
      this.debugLog([`formatGitChangesAsTimesheet error: ${err}`]);
      return 'Error formatting timesheet';
    }
  }

  /**
   * Run a query against the LLM
   */
  async runQuery(
    userQuery: string,
    response?: { markdown?: (text: string) => void },
    token?: vscode.CancellationToken
  ): Promise<void> {
    try {
      this.debugLog(['=== LLM checking (command) received query ===', String(userQuery)]);

      const chatModel = await vscode.lm.selectChatModels({ family: 'gpt-4o' });
      if (!chatModel || chatModel.length === 0) {
        this.debugLog(['No gpt-4o family chat model available']);
        return;
      }

      const today = getFormattedDate();
      const PROMPT = getWorkLogPrompt(today);

      const messages = [
        vscode.LanguageModelChatMessage.User(PROMPT),
        vscode.LanguageModelChatMessage.User(`json array: ${userQuery}`),
      ];

      const chatRequest = await chatModel[0].sendRequest(messages, undefined, token);

      let fullText = '';
      for await (const chunk of chatRequest.text) {
        fullText += String(chunk);
      }

      if (response && typeof response.markdown === 'function') {
        response.markdown(fullText);
      }
      this.debugLog([fullText]);
      
      // Send result back to webview if available
      if (this.webviewManager) {
        this.webviewManager.postMessage({
          command: 'llmResult',
          result: fullText
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.debugLog(['runQuery error: ' + msg]);
    }
  }
}