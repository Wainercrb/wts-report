import * as vscode from "vscode";

export type WebviewMessage =
  | { command: "showInformationMessage"; text: string }
  | {
      command: "automaticTimesheet";
      urls: UrlEntry[];
      storedItems?: StoredItem[];
    }
  | { command: "manualTimesheet"; values: Record<string, unknown> }
  | { command: "getModelInfo" }
  | { command: "selectModel"; modelId: string };

export type ShowInfoMsg = Extract<
  WebviewMessage,
  { command: "showInformationMessage" }
>;
export type AutomaticTimesheetMsg = Extract<
  WebviewMessage,
  { command: "automaticTimesheet" }
>;
export type ManualTimesheetMsg = Extract<
  WebviewMessage,
  { command: "manualTimesheet" }
>;
export type SelectModelMsg = Extract<
  WebviewMessage,
  { command: "selectModel" }
>;

export interface UrlEntry {
  id: string;
  url: string;
}

export interface StoredItem {
  tsType: string;
  tsText: string;
}

export interface GitChange {
  branch: string;
  changes: string;
  project: string;
}

export interface ILogger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface IWebviewManager {
  createPanel(context: vscode.ExtensionContext): void;
  postMessage(message: Record<string, unknown>): void;
  dispose(): void;
}

export interface ExtendedModel extends vscode.LanguageModelChat {
  price: number;
  isFree: boolean;
}

export interface ILLMService {
  runManualSpreadsheetQuery(query: string): Promise<string>;
  runAutomaticSpreadsheetQuery(
    gitChanges: GitChange[],
    storedItems?: StoredItem[],
  ): Promise<string>;
  setSelectedModelId(modelId: string): void;
  getModelList(): Promise<ExtendedModel[]>;
}

export interface IMessageService {
  showProcessing(message?: string): void;
  showSuccess(message?: string): void;
  showError(message: string): void;
}

export interface ISanitizationService {
  sanitizeGitHistory(gitHistory: GitChange[]): GitChange[];
  sanitizeStoredItems(storedItems: StoredItem[] | undefined): StoredItem[] | undefined;
  sanitizePayload(payload: string): string;
}
