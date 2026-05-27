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
import { MESSAGES } from "../constants/messages";
import { getErrorMessage } from "../utils/error";

/**
 * Service for interacting with LLM (Language Model) APIs
 * Delegates model selection to ChatModelProvider and communicates results
 * via a callback to decouple from webview concerns.
 */
export class LLMService implements ILLMService {
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
      return MESSAGES.INFO.NO_GIT_CHANGES_FOUND_TODAY;
    }

    try {
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
        this.logger.info(`Manual stored items included: count=${storedItems.length}`);
      }

      this.logger.info(`Automatic git groups processed: ${gitChanges.length}`);
      return await this.executeQuery(messages);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Run a manual work-log query through the LLM (manual / form-driven).
   */
  async runManualSpreadsheetQuery(userQuery: string): Promise<string> {
    try {
      this.logger.info("Manual spreadsheet query received");
      this.logger.debug(`Manual payload length: ${userQuery.length}`);

      const today = getFormattedDate();
      const prompt = getWorkLogPrompt(today);
      const messages = [
        vscode.LanguageModelChatMessage.User(prompt),
        vscode.LanguageModelChatMessage.User(`json array: ${userQuery}`),
      ];

      this.logger.info("Manual prompt prepared");
      return await this.executeQuery(messages);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Execute a chat query and accumulate the streaming response.
   */
  private async executeQuery(
    messages: vscode.LanguageModelChatMessage[],
  ): Promise<string> {
    const model = await this.chatModelProvider.getSelectedModel();

    this.logger.info(`Using model: ${model.name} (${model.id}) ${model.family})`);

    const tokenSource = new vscode.CancellationTokenSource();
    try {
      const responseStream = await model.sendRequest(
        messages,
        {},
        tokenSource.token,
      );

      const result = [];
      for await (const fragment of responseStream.text) {
        result.push(String(fragment));
      }

      const responseText = result.join("") || MESSAGES.INFO.EMPTY_LLM_RESPONSE;
      this.logger.info(`LLM response characters: ${responseText.length}`);
      return responseText;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      tokenSource.dispose();
    }
  }

  async getModelList(): Promise<ExtendedModel[]> {
    return this.chatModelProvider.getModels();
  }

  setSelectedModelId(modelId: string): void {
    this.chatModelProvider.setSelectedModelId(modelId);
  }
}
