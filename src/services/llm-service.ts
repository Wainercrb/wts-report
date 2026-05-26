import * as vscode from "vscode";
import { ILLMService, GitChange, StoredItem, ModelInfo } from "../types";
import { getFormattedDate, formatGitChanges } from "../utils/formatting";
import { getTimesheetPrompt, getWorkLogPrompt } from "../prompts";
import { Logger } from "./logger-service";

/**
 * Service for interacting with LLM (Language Model) APIs
 * Delegates model selection to ChatModelProvider and communicates results
 * via a callback to decouple from webview concerns.
 */
export class LLMService implements ILLMService {
  private modelCache: vscode.LanguageModelChat[] | null = null;
  private static readonly EMPTY_RESPONSE_MSG = "(empty response from LLM)";

  constructor(
    private logger: Logger,
  ) {}

  /**
   * Run a user query through the LLM and return the response.
   */
  async runManualTimeSheetReport(userQuery: string): Promise<string> {
    const today = getFormattedDate();
    const prompt = getWorkLogPrompt(today);

    const result = await this.executeQuery([
      vscode.LanguageModelChatMessage.User(prompt),
      vscode.LanguageModelChatMessage.User(`json array: ${userQuery}`),
    ]);

    return result;
  }

  /**
   * Format git changes as a timesheet using the LLM.
   */
  async runAutomaticTimeSheetReport(
    gitChanges: GitChange[],
    storedItems?: StoredItem[],
  ): Promise<string> {
    const formattedChanges = formatGitChanges(gitChanges);
    const today = getFormattedDate();
    const prompt = getTimesheetPrompt(today);

    const result = await this.executeQuery([
      vscode.LanguageModelChatMessage.User(prompt),
      vscode.LanguageModelChatMessage.User(`{stored items: ${JSON.stringify(storedItems ?? [])}} and git changes: ${JSON.stringify(gitChanges)}}`),
    ]);

    return result;
  }

  /**
   * Execute a chat query and accumulate the streaming response.
   */
  private async executeQuery(
    messages: vscode.LanguageModelChatMessage[],
  ): Promise<string> {
    const chatModel = await this.getAvailableChatModel();
    if (!chatModel) {
      throw new Error("No model available for query execution");
    }

    this.logger.log([
      `executeQuery: using model ${chatModel.id} (${chatModel.name}), ${messages.length} message(s)`,
    ]);

    const chatRequest = await chatModel.sendRequest(
      messages,
      undefined,
      undefined,
    );
    let result = "";
    let chunkCount = 0;

    for await (const chunk of chatRequest.text) {
      chunkCount++;
      result += String(chunk);
    }

     return result || LLMService.EMPTY_RESPONSE_MSG;
  }


   /**
   * Get all available chat models, using cached result when available.
   */
  private async getModels(): Promise<vscode.LanguageModelChat[]> {
    if (this.modelCache) {
      return this.modelCache;
    }
    try {
      const models = await vscode.lm.selectChatModels({});
      this.modelCache = models || [];
      return this.modelCache;
    } catch (err) {
      // this.debugLog([`ERROR: getModels - ${err}`]);
      this.modelCache = [];
      return this.modelCache;
    }
  }

  /**
   * Get the best available chat model (prefers free, falls back to cheapest).
   */
  async getAvailableChatModel(): Promise<vscode.LanguageModelChat | undefined> {
    try {
      const freeModel = await this.findFreeModel();
      return freeModel || this.getFallbackModel();
    } catch (err) {
      // this.debugLog([`ERROR: getAvailableChatModel - ${err}`]);
      return undefined;
    }
  }

  /**
   * Get information about all available models.
   */
  async getAvailableModelsInfo(): Promise<ModelInfo[]> {
    try {
      const allModels = await this.getModels();
      if (allModels.length === 0) {
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
      // this.debugLog([`ERROR: getAvailableModelsInfo - ${err}`]);
      return [];
    }
  }

  /**
   * Get information about the selected model and all available models.
   */
  async getSelectedModelInfo(): Promise<{
    selectedModel: ModelInfo | null;
    availableModels: ModelInfo[];
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
      // this.debugLog([`ERROR: getSelectedModelInfo - ${err}`]);
      return {
        selectedModel: null,
        availableModels: [],
        isFreeModel: false,
        freeModelNotFound: true
      };
    }
  }

  /**
   * Clear the cached models. Useful when model availability may have changed.
   */
  clearCache(): void {
    this.modelCache = null;
  }

  /**
   * Find a free model with the highest max input tokens.
   */
  private async findFreeModel(): Promise<vscode.LanguageModelChat | undefined> {
    const allModels = await this.getModels();
    if (allModels.length === 0) {
      return undefined;
    }

    const freeModels = allModels.filter(model => this.getPricingValue(model) === 0);
    if (freeModels.length === 0) {
      return undefined;
    }

    return freeModels.reduce((best, current) =>
      this.getMaxInputTokens(current) > this.getMaxInputTokens(best) ? current : best
    );
  }

  /**
   * Fallback: return the cheapest model (or highest token count among same price).
   */
  private async getFallbackModel(): Promise<vscode.LanguageModelChat | undefined> {
    const allModels = await this.getModels();
    if (allModels.length === 0) {
      return undefined;
    }

    const sorted = allModels.sort((a, b) => {
      const valueA = this.getPricingValue(a);
      const valueB = this.getPricingValue(b);
      return valueA === valueB
        ? this.getMaxInputTokens(b) - this.getMaxInputTokens(a)
        : valueA - valueB;
    });

    return sorted[0];
  }

  /**
   * Extract the numeric pricing value from a model's metadata.
   */
  private getPricingValue(model: vscode.LanguageModelChat): number {
    const metadata = model as { pricing?: string };
    const pricing = metadata.pricing || '';
    const match = pricing.match(/^([\d.]+)x$/);
    return match ? parseFloat(match[1]) : Infinity;
  }

  /**
   * Get the max input tokens for a model.
   */
  private getMaxInputTokens(model: vscode.LanguageModelChat): number {
    const metadata = model as { maxInputTokens?: number };
    return metadata.maxInputTokens || 0;
  }
}
