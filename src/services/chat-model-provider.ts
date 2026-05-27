import * as vscode from "vscode";
import { ExtendedModel, ILogger } from "../types";

/**
 * Provides access to VS Code Language Model Chat models, sorted by price.
 * Extracted from LLMService to follow Single Responsibility Principle.
 */
export class ChatModelProvider {
  private selectedModelId: string | undefined;

  constructor(private logger: ILogger) {}

  /**
   * Store the user's selected model ID for subsequent queries.
   */
  setSelectedModelId(modelId: string): void {
    this.selectedModelId = modelId;
    this.logger.info(`User selected model: ${modelId}`);
  }

  /**
   * Get all available chat models, sorted by price ascending.
   */
  async getModels(): Promise<ExtendedModel[]> {
    const models = await vscode.lm.selectChatModels({});
    
    const parsedModels: ExtendedModel[] = models.map((model) => {
      const price = this.getPricingValue(model);
      const isFree = price === 0;
      return { ...model, price, isFree };
    });

    const sortedModels: ExtendedModel[] = parsedModels.sort((a, b) => {
      if (a.price === b.price) {
        return 0;
      }
      return a.price - b.price;
    });
 
    return sortedModels;
  }

  /**
   * Get the model to use for queries: user's stored choice or the cheapest fallback.
   */
  async getSelectedModel(): Promise<vscode.LanguageModelChat> {
    const allModels = await this.getModels();
    if (!allModels.length) {
      throw new Error("No chat models available");
    }

    if (this.selectedModelId) {
      const match = allModels.find(m => m.id === this.selectedModelId);
      if (match) {
        return match;
      }
      this.logger.warn(`Previously selected model "${this.selectedModelId}" not found, falling back to cheapest`);
    }

    return allModels[0];
  }

  /**
   * Extract the numeric pricing value from a model's metadata.
   */
  private getPricingValue(model: vscode.LanguageModelChat): number {
    const metadata = model as { pricing?: string };
    const pricing = metadata.pricing || "";
    const match = pricing.match(/^([\d.]+)x$/);
    return match ? parseFloat(match[1]) : Infinity;
  }
}
