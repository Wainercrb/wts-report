import * as vscode from "vscode";
import {
  ILLMService,
  ILogger,
  GitChange,
  StoredItem,
  ExtendedModel,
} from "../types";
import { getFormattedDate, formatGitChanges } from "../utils/formatting";
import { getTimesheetPrompt, getWorkLogPrompt } from "../prompts";
import { ChatModelProvider } from "./chat-model-provider";

/**
 * Service for interacting with LLM (Language Model) APIs
 * Delegates model selection to ChatModelProvider and communicates results
 * via a callback to decouple from webview concerns.
 */
export class LLMService implements ILLMService {
  private static readonly NO_CHANGES_MSG = "No git changes found for today";
  private static readonly EMPTY_RESPONSE_MSG = "(empty response from LLM)";
  private static readonly NO_MODEL_MSG =
    "No suitable LLM model available. Please ensure VS Code has an LLM extension installed.";

  constructor(
    private chatModelProvider: ChatModelProvider,
    private logger: ILogger,
  ) {}
  /**
   * Format git changes as a timesheet via LLM (automatic / git-driven).
   */
  async runAutomaticSpreadsheetQuery(
    gitChanges: GitChange[],
    storedItems?: StoredItem[],
  ): Promise<string> {
    if (gitChanges.length === 0) {
      return LLMService.NO_CHANGES_MSG;
    }

    const formattedChanges = formatGitChanges(gitChanges);
    const today = getFormattedDate();
    const prompt = getTimesheetPrompt(today);

    const messages = [
      vscode.LanguageModelChatMessage.User(prompt),
      vscode.LanguageModelChatMessage.User(
        `Git commits by ticket:\n${formattedChanges}`,
      ),
    ];

    if (storedItems && storedItems.length > 0) {
      const itemsText = storedItems
        .map((i) => `[${i.tsType}] ${i.tsText}`)
        .join("\n");
      messages.push(
        vscode.LanguageModelChatMessage.User(
          `Below are manually entered work log items. Merge them into the appropriate sections of the timesheet:\n${itemsText}`,
        ),
      );
    }

    return this.executeQuery(messages);
  }

  /**
   * Run a manual work-log query through the LLM (manual / form-driven).
   */
  async runManualSpreadsheetQuery(userQuery: string): Promise<string> {
    this.logger.info("=== Manual spreadsheet query received ===");
    this.logger.debug(userQuery);

    const today = getFormattedDate();
    const prompt = getWorkLogPrompt(today);
    const messages = [
      vscode.LanguageModelChatMessage.User(prompt),
      vscode.LanguageModelChatMessage.User(`json array: ${userQuery}`),
    ];

    this.logger.debug(`prompt: ${prompt}`);

    return this.executeQuery(messages);
  }

  /**
   * Execute a chat query and accumulate the streaming response.
   */
  private async executeQuery(
    messages: vscode.LanguageModelChatMessage[],
  ): Promise<string> {
    const model = await this.chatModelProvider.getSelectedModel();
    if (!model) {
      throw new Error("No model available for query execution");
    }

    this.logger.info(`Using model: ${model.name} (${model.id}) ${model.family})`);

    const tokenSource = new vscode.CancellationTokenSource();
    const responseStream = await model.sendRequest(
      messages,
      {},
      tokenSource.token,
    );
    tokenSource.dispose();

    const result = [];
    for await (const fragment of responseStream.text) {
      result.push(String(fragment));
    }

    return result.join("") || LLMService.EMPTY_RESPONSE_MSG;
  }

  async getModelList(): Promise<ExtendedModel[]> {
    return this.chatModelProvider.getModels();
  }

  setSelectedModelId(modelId: string): void {
    this.chatModelProvider.setSelectedModelId(modelId);
  }
}
