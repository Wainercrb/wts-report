import * as vscode from 'vscode';
import { ILLMService, GitChange, IWebviewManager } from '../types';
import { getFormattedDate } from '../utils/formatting';
import { getTimesheetPrompt, getWorkLogPrompt } from '../prompts';

/**
 * Service for interacting with LLM (Language Model) APIs
 */
export class LLMService implements ILLMService {
  private static readonly NO_CHANGES_MSG = 'No git changes found for today';
  private static readonly EMPTY_RESPONSE_MSG = '(empty response from LLM)';
  private static readonly NO_MODEL_MSG = 'No suitable LLM model available. Please ensure VS Code has an LLM extension installed.';

  constructor(
    private debugLog: (lines: string[]) => void = () => {},
    private webviewManager?: IWebviewManager
  ) {}

  async formatGitChangesAsTimesheet(gitChanges: GitChange[]): Promise<string> {
    if (gitChanges.length === 0) {
      return LLMService.NO_CHANGES_MSG;
    }

    try {
      const formattedChanges = gitChanges
        .map((change) => `[${change.branch}][${change.project}]${change.changes}`)
        .join('\n\n');

      const today = getFormattedDate();
      const prompt = getTimesheetPrompt(today);
      const chatModel = await this.getAvailableChatModel();

      if (!chatModel) {
        this.postResult('gitHistoryResult', formattedChanges);
        return formattedChanges;
      }

      const messages = [
        vscode.LanguageModelChatMessage.User(prompt),
        vscode.LanguageModelChatMessage.User(`Git commits by ticket:\n${formattedChanges}`)
      ];

      const result = await this.executeQuery(messages);
      this.postResult('gitHistoryResult', result);
      return result;
    } catch (err) {
      const errorMsg = `Error formatting timesheet: ${err instanceof Error ? err.message : String(err)}`;
      this.debugLog([`ERROR: ${errorMsg}`]);
      this.postResult('gitHistoryResult', `Error: ${errorMsg}`);
      return 'Error formatting timesheet';
    }
  }

  async runQuery(
    userQuery: string,
    response?: { markdown?: (text: string) => void },
    token?: vscode.CancellationToken
  ): Promise<void> {
    try {
      const chatModel = await this.getAvailableChatModel();
      if (!chatModel) {
        this.debugLog([`ERROR: ${LLMService.NO_MODEL_MSG}`]);
        this.postResult('llmResult', `Error: ${LLMService.NO_MODEL_MSG}`);
        return;
      }

      const today = getFormattedDate();
      const prompt = getWorkLogPrompt(today);
      const messages = [
        vscode.LanguageModelChatMessage.User(prompt),
        vscode.LanguageModelChatMessage.User(`json array: ${userQuery}`),
      ];

      const result = await this.executeQuery(messages, token);
      if (response?.markdown) {
        response.markdown(result);
      }
      this.postResult('llmResult', result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.debugLog([`ERROR: runQuery - ${errorMsg}`]);
      this.postResult('llmResult', `Error: ${errorMsg}`);
    }
  }

  private async getAvailableChatModel(): Promise<vscode.LanguageModelChat | undefined> {
    try {
      const freeModel = await this.findFreeModel();
      return freeModel || this.getFallbackModel();
    } catch (err) {
      this.debugLog([`ERROR: getAvailableChatModel - ${err}`]);
      return undefined;
    }
  }

  private async findFreeModel(): Promise<vscode.LanguageModelChat | undefined> {
    try {
      const allModels = await vscode.lm.selectChatModels({});
      if (!allModels?.length) {
        return undefined;
      }

      const freeModels = allModels.filter(model => this.getPricingValue(model) === 0);
      if (!freeModels.length) {
        return undefined;
      }

      const bestFreeModel = freeModels.reduce((best, current) =>
        this.getMaxInputTokens(current) > this.getMaxInputTokens(best) ? current : best
      );

      return this.getFreshModelInstance(bestFreeModel);
    } catch (err) {
      this.debugLog([`ERROR: findFreeModel - ${err}`]);
      return undefined;
    }
  }

  private async getFallbackModel(): Promise<vscode.LanguageModelChat | undefined> {
    try {
      const allModels = await vscode.lm.selectChatModels({});
      if (!allModels?.length) {
        return undefined;
      }

      const sorted = allModels.sort((a, b) => {
        const valueA = this.getPricingValue(a);
        const valueB = this.getPricingValue(b);
        return valueA === valueB
          ? this.getMaxInputTokens(b) - this.getMaxInputTokens(a)
          : valueA - valueB;
      });

      return this.getFreshModelInstance(sorted[0]);
    } catch (err) {
      this.debugLog([`ERROR: getFallbackModel - ${err}`]);
      return undefined;
    }
  }

  private async executeQuery(
    messages: vscode.LanguageModelChatMessage[],
    token?: vscode.CancellationToken
  ): Promise<string> {
    const chatModel = await this.getAvailableChatModel();
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

  private postResult(command: string, result: string): void {
    if (this.webviewManager) {
      this.webviewManager.postMessage({ command, result });
    }
  }

  private getPricingValue(model: vscode.LanguageModelChat): number {
    const metadata = model as { pricing?: string };
    const pricing = metadata.pricing || '';
    const match = pricing.match(/^([\d.]+)x$/);
    return match ? parseFloat(match[1]) : Infinity;
  }

  private getMaxInputTokens(model: vscode.LanguageModelChat): number {
    const metadata = model as { maxInputTokens?: number };
    return metadata.maxInputTokens || 0;
  }

  private async getFreshModelInstance(
    model: vscode.LanguageModelChat
  ): Promise<vscode.LanguageModelChat | undefined> {
    try {
      const freshModels = await vscode.lm.selectChatModels({ family: model.family });
      return freshModels?.[0];
    } catch (err) {
      this.debugLog([`ERROR: getFreshModelInstance - ${err}`]);
      return undefined;
    }
  }

  async getAvailableModelsInfo(): Promise<
    Array<{ id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number }>
  > {
    try {
      const allModels = await vscode.lm.selectChatModels({});
      if (!allModels?.length) {
        return [];
      }

      return allModels.map(model => {
        const pricingValue = this.getPricingValue(model);
        const metadata = model as { pricing?: string };
        return {
          id: model.id,
          name: model.name || model.id,
          pricing: metadata.pricing || 'unknown',
          isFree: pricingValue === 0,
          vendor: model.vendor,
          maxTokens: this.getMaxInputTokens(model)
        };
      });
    } catch (err) {
      this.debugLog([`ERROR: getAvailableModelsInfo - ${err}`]);
      return [];
    }
  }

  async getSelectedModelInfo(): Promise<{
    selectedModel: { id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number } | null;
    availableModels: Array<{ id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number }>;
    isFreeModel: boolean;
    freeModelNotFound: boolean;
  }> {
    try {
      const availableModels = await this.getAvailableModelsInfo();
      const selectedModel = await this.getAvailableChatModel();

      if (!selectedModel) {
        return {
          selectedModel: null,
          availableModels,
          isFreeModel: false,
          freeModelNotFound: true
        };
      }

      const selectedModelInfo = availableModels.find(m => m.id === selectedModel.id) || null;
      return {
        selectedModel: selectedModelInfo,
        availableModels,
        isFreeModel: selectedModelInfo?.isFree || false,
        freeModelNotFound: false
      };
    } catch (err) {
      this.debugLog([`ERROR: getSelectedModelInfo - ${err}`]);
      return {
        selectedModel: null,
        availableModels: [],
        isFreeModel: false,
        freeModelNotFound: true
      };
    }
  }
}