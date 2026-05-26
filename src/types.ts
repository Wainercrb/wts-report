import * as vscode from "vscode";

/**
 * Message sent from webview to extension
 * Discriminated union for type-safe command handling
 */
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

// Convenience aliases for message handler signatures
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

/**
 * A URL entry with an identifier, used for tracking selected git URLs from the UI
 */
export interface UrlEntry {
  id: string;
  url: string;
}

/**
 * A manually entered work log item (meeting or task) stored in the UI
 */
export interface StoredItem {
  tsType: string;
  tsText: string;
}

/**
 * Represents a git change/commit record
 */
export interface GitChange {
  branch: string;
  changes: string;
  project: string;
}

/**
 * Logger service interface with level support
 */
export interface ILogger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * Webview panel management interface
 */
export interface IWebviewManager {
  createPanel(context: vscode.ExtensionContext): void;
  postMessage(message: Record<string, unknown>): void;
  dispose(): void;
}

export interface ExtendedModel extends vscode.LanguageModelChat {
  price: number;
  isFree: boolean;
}

/**
 * LLM service interface
 */
export interface ILLMService {
  runManualSpreadsheetQuery(query: string): Promise<string>;
  runAutomaticSpreadsheetQuery(
    gitChanges: GitChange[],
    storedItems?: StoredItem[],
  ): Promise<string>;
  setSelectedModelId(modelId: string): void;
  getModelList(): Promise<ExtendedModel[]>;
}
