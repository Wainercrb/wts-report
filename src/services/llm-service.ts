import * as vscode from 'vscode';
import { ILLMService, GitChange, StoredItem } from '../types';
import { getFormattedDate, formatGitChanges } from '../utils/formatting';
import { getTimesheetPrompt, getWorkLogPrompt } from '../prompts';
import { ChatModelProvider } from './chat-model-provider';
import { tryCatch } from '../utils/errors';

/**
 * Service for interacting with LLM (Language Model) APIs
 * Delegates model selection to ChatModelProvider and communicates results
 * via a callback to decouple from webview concerns.
 */
export class LLMService implements ILLMService {
  private static readonly NO_CHANGES_MSG = 'No git changes found for today';
  private static readonly EMPTY_RESPONSE_MSG = '(empty response from LLM)';
  private static readonly NO_MODEL_MSG = 'No suitable LLM model available. Please ensure VS Code has an LLM extension installed.';

  constructor(
    private chatModelProvider: ChatModelProvider,
    private debugLog: (lines: string[]) => void = () => {},
    private onResult?: (command: string, result: string) => void
  ) {}

  /**
   * Format git changes as a timesheet, optionally using LLM for formatting.
   */
  async formatGitChangesAsTimesheet(
    gitChanges: GitChange[],
    storedItems?: StoredItem[]
  ): Promise<string> {
    if (gitChanges.length === 0) {
      return LLMService.NO_CHANGES_MSG;
    }

    const formattedChanges = formatGitChanges(gitChanges);

    const outcome = await tryCatch(
      async (): Promise<string> => {
        const today = getFormattedDate();
        const prompt = getTimesheetPrompt(today);
        const chatModel = await this.chatModelProvider.getAvailableChatModel();

        if (!chatModel) {
          return formattedChanges;
        }

        const messages = [
          vscode.LanguageModelChatMessage.User(prompt),
          vscode.LanguageModelChatMessage.User(`Git commits by ticket:\n${formattedChanges}`)
        ];

        if (storedItems && storedItems.length > 0) {
          const itemsText = storedItems
            .map(i => `[${i.tsType}] ${i.tsText}`)
            .join('\n');
          messages.push(vscode.LanguageModelChatMessage.User(
            `Below are manually entered work log items. Merge them into the appropriate sections of the timesheet:\n${itemsText}`
          ));
        }

        const result = await this.executeQuery(messages);
        this.debugLog([`formatGitChangesAsTimesheet: LLM completed successfully`]);
        return result;
      },
      (lines: string[]) => this.debugLog(lines),
      'formatting timesheet'
    );

    this.onResult?.('gitHistoryResult', outcome.ok ? outcome.value : `Error: ${outcome.error}`);
    return outcome.ok ? outcome.value : 'Error formatting timesheet';
  }

  /**
   * Run a user query through the LLM and stream the response.
   */
  async runQuery(
    userQuery: string,
    response?: { markdown?: (text: string) => void },
    token?: vscode.CancellationToken
  ): Promise<void> {
    this.debugLog(['=== LLM checking (command) received query ===', userQuery]);

    const outcome = await tryCatch(
      async (): Promise<string> => {
        const chatModel = await this.chatModelProvider.getAvailableChatModel();
        if (!chatModel) {
          throw new Error(LLMService.NO_MODEL_MSG);
        }

        const today = getFormattedDate();
        const prompt = getWorkLogPrompt(today);
        const messages = [
          vscode.LanguageModelChatMessage.User(prompt),
          vscode.LanguageModelChatMessage.User(`json array: ${userQuery}`),
        ];

        const result = await this.executeQuery(messages, token);
        this.debugLog([result]);

        if (response?.markdown) {
          response.markdown(result);
        }
        return result;
      },
      (lines: string[]) => this.debugLog(lines),
      'runQuery'
    );

    if (outcome.ok) {
      this.onResult?.('llmResult', outcome.value);
    } else {
      this.debugLog([`ERROR: ${outcome.error}`]);
      this.onResult?.('llmResult', `Error: ${outcome.error}`);
    }
  }

  /**
   * Delegate model info queries to ChatModelProvider.
   */
  async getAvailableModelsInfo(): Promise<
    Array<{ id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number }>
  > {
    return this.chatModelProvider.getAvailableModelsInfo();
  }

  /**
   * Delegate selected model info queries to ChatModelProvider.
   */
  async getSelectedModelInfo(): Promise<{
    selectedModel: { id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number } | null;
    availableModels: Array<{ id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number }>;
    isFreeModel: boolean;
    freeModelNotFound: boolean;
  }> {
    return this.chatModelProvider.getSelectedModelInfo();
  }

  /**
   * Execute a chat query and accumulate the streaming response.
   */
  private async executeQuery(
    messages: vscode.LanguageModelChatMessage[],
    token?: vscode.CancellationToken
  ): Promise<string> {
    const chatModel = await this.chatModelProvider.getAvailableChatModel();
    if (!chatModel) {
      throw new Error('No model available for query execution');
    }

    const chatRequest = await chatModel.sendRequest(messages, undefined, token);
    let result = '';
    
    for await (const chunk of chatRequest.text) {
      result += String(chunk);
    }
    
    return result || LLMService.EMPTY_RESPONSE_MSG;
  }
}
