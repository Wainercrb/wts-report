import * as vscode from "vscode";
import {
  IWebviewManager,
  ILLMService,
  ILogger,
  IMessageService,
  ISanitizationService,
  ShowInfoMsg,
  AutomaticTimesheetMsg,
  ManualTimesheetMsg,
  SelectModelMsg,
  StoredItem,
  UrlEntry,
} from "../types";
import { COMMANDS, RESPONSE } from "../constants/commands";
import { MESSAGES } from "../constants/messages";
import {
  isStoredItemArray,
  isUrlEntryArray,
  isWebviewMessage,
} from "../utils/type-guards";
import { getErrorMessage } from "../utils/error";
import { getGitHistoryForUrls } from "../utils/git";

export class MessageHandler {
  constructor(
    private webviewManager: IWebviewManager,
    private llmService: ILLMService,
    private logger: ILogger,
    private messageService: IMessageService,
    private sanitizationService: ISanitizationService,
  ) {}

  async handle(message: unknown): Promise<void> {
    if (!isWebviewMessage(message)) {
      return;
    }

    switch (message.command) {
      case COMMANDS.SHOW_INFORMATION:
        this.handleShowInfo(message);
        break;
      case COMMANDS.AUTOMATIC_TIMESHEET:
        await this.handleAutomaticMessage(message);
        break;
      case COMMANDS.MANUAL_TIMESHEET:
        await this.handleManualMessage(message);
        break;
      case COMMANDS.GET_MODEL_INFO:
        await this.handleGetModelInfo();
        break;
      case COMMANDS.SELECT_MODEL:
        this.handleSelectModel(message);
        break;
      default:
        break;
    }
  }

  private handleShowInfo(message: ShowInfoMsg): void {
    if (message.text) vscode.window.showInformationMessage(message.text);
  }

  private async handleAutomaticMessage(
    message: AutomaticTimesheetMsg,
  ): Promise<void> {
    const urls = this.validateUrls(message.urls);
    if (!urls) {
      this.messageService.showError(MESSAGES.ERROR.NO_URLS_DATA_RECEIVED);
      return;
    }

    this.messageService.showProcessing(
      MESSAGES.LOADING.PROCESSING_FORM_SUBMISSION,
    );

    try {
      const gitHistory = await getGitHistoryForUrls(urls);
      const sanitizedGitHistory =
        this.sanitizationService.sanitizeGitHistory(gitHistory);
      const sanitizedStoredItems = this.sanitizationService.sanitizeStoredItems(
        this.resolveStoredItems(message.storedItems),
      );

      const result = await this.llmService.runAutomaticSpreadsheetQuery(
        sanitizedGitHistory,
        sanitizedStoredItems,
      );

      this.webviewManager.postMessage({
        [RESPONSE.GIT_HISTORY_RESULT]: result,
      });

      this.messageService.showSuccess();
    } catch (error) {
      const errorMsg = `${MESSAGES.ERROR.FAILED_TO_GENERATE_TIMESHEET}${getErrorMessage(error)}`;
      this.logger.error(errorMsg);
      this.messageService.showError(errorMsg);
    }
  }

  private async handleManualMessage(
    message: ManualTimesheetMsg,
  ): Promise<void> {
    this.messageService.showProcessing(
      MESSAGES.LOADING.PROCESSING_FORM_SUBMISSION,
    );

    const { query, workLog } = this.resolveManualInput(message.values);

    const payload =
      workLog.trim().length > 0 ? JSON.stringify({ query, workLog }) : query;

    const sanitizedPayload = this.sanitizationService.sanitizePayload(payload);

    try {
      const result =
        await this.llmService.runManualSpreadsheetQuery(sanitizedPayload);

      this.webviewManager.postMessage({
        [RESPONSE.LLM_RESULT]: result,
      });

      this.messageService.showSuccess();
    } catch (error) {
      const errorMsg = `${MESSAGES.ERROR.FAILED_TO_PROCESS_FORM}${getErrorMessage(error)}`;
      this.logger.error(errorMsg);
      this.messageService.showError(errorMsg);
    }
  }

  private async handleGetModelInfo(): Promise<void> {
    try {
      const models = await this.llmService.getModelList();
      this.webviewManager.postMessage({
        [RESPONSE.MODEL_INFO]: { models },
      });
    } catch (error) {
      const errorMsg = `${MESSAGES.ERROR.ERROR_GETTING_MODEL_INFO}${getErrorMessage(error)}`;
      this.logger.error(errorMsg);
      this.messageService.showError(
        MESSAGES.ERROR.FAILED_TO_RETRIEVE_MODEL_INFORMATION,
      );
    }
  }

  private handleSelectModel(message: SelectModelMsg): void {
    this.llmService.setSelectedModelId(message.modelId);
  }

  private resolveManualInput(values: Record<string, unknown>) {
    return {
      query: typeof values.query === 'string' ? values.query : JSON.stringify(values),
      workLog: typeof values.workLog === 'string' ? values.workLog : '',
    };
  }

  private validateUrls(urls: unknown): UrlEntry[] | null {
    return isUrlEntryArray(urls) ? urls : null;
  }

  private resolveStoredItems(storedItems: unknown): StoredItem[] | undefined {
    return isStoredItemArray(storedItems) ? storedItems : undefined;
  }
}
