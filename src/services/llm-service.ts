import * as vscode from "vscode";
import { ILLMService, GitChange, StoredItem } from "../types";
import { getFormattedDate, formatGitChanges } from "../utils/formatting";
import { getTimesheetPrompt, getWorkLogPrompt } from "../prompts";
import { ChatModelProvider } from "./chat-model-provider";
import { Logger } from "./logger-service";

/**
 * Service for interacting with LLM (Language Model) APIs
 * Delegates model selection to ChatModelProvider and communicates results
 * via a callback to decouple from webview concerns.
 */
export class LLMService implements ILLMService {
  private static readonly EMPTY_RESPONSE_MSG = "(empty response from LLM)";

  constructor(
    private chatModelProvider: ChatModelProvider,
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

    let fullPrompt = `${prompt}\n\nGIT COMMITS:\n${formattedChanges}`;

    if (storedItems && storedItems.length > 0) {
      const itemsText = storedItems
        .map((i) => `[${i.tsType}] ${i.tsText}`)
        .join("\n");
      fullPrompt += `\n\nWORK LOG ITEMS:\n${itemsText}`;
    }

    const result = await this.executeQuery([
      vscode.LanguageModelChatMessage.User(fullPrompt),
    ]);

    return result;
  }

  /**
   * Delegate model info queries to ChatModelProvider.
   */
  async getAvailableModelsInfo(): Promise<
    Array<{
      id: string;
      name: string;
      pricing: string;
      isFree: boolean;
      vendor: string;
      maxTokens: number;
    }>
  > {
    return this.chatModelProvider.getAvailableModelsInfo();
  }

  /**
   * Delegate selected model info queries to ChatModelProvider.
   */
  async getSelectedModelInfo(): Promise<{
    selectedModel: {
      id: string;
      name: string;
      pricing: string;
      isFree: boolean;
      vendor: string;
      maxTokens: number;
    } | null;
    availableModels: Array<{
      id: string;
      name: string;
      pricing: string;
      isFree: boolean;
      vendor: string;
      maxTokens: number;
    }>;
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
  ): Promise<string> {
    const chatModel = await this.chatModelProvider.getAvailableChatModel();
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

    // this.debugLog([`executeQuery: ${chunkCount} chunk(s), result length: ${result.length}`]);

    //  if (response && typeof response.markdown === 'function') {
    //   response.markdown(fullText);
    // }

    return result || LLMService.EMPTY_RESPONSE_MSG;
  }
}
