import * as vscode from 'vscode';

/**
 * Result type for operations that may fail
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Message sent from webview to extension
 * Discriminated union for type-safe command handling
 */
export type WebviewMessage =
  | { command: 'showInformationMessage'; text: string }
  | { command: 'getDirectoryInfo' }
  | { command: 'checkGitHistory'; urls: Array<{ id: string; url: string }>; storedItems?: StoredItem[] }
  | { command: 'formValues'; values: Record<string, unknown> }
  | { command: 'getModelInfo' };

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
 * Logger service interface
 */
export interface ILogger {
  log(lines: string[]): void;
}

/**
 * Webview panel management interface
 */
export interface IWebviewManager {
  createPanel(context: vscode.ExtensionContext): void;
  postMessage(message: Record<string, unknown>): void;
  dispose(): void;
}

/**
 * Information about an available language model
 */
export interface ModelInfo {
  id: string;
  name: string;
  pricing: string;
  isFree: boolean;
  vendor: string;
  maxTokens: number;
}

/**
 * LLM service interface
 */
export interface ILLMService {
  runQuery(query: string, response?: { markdown?: (text: string) => void }, token?: vscode.CancellationToken): Promise<void>;
  formatGitChangesAsTimesheet(gitChanges: GitChange[], storedItems?: StoredItem[]): Promise<string>;
  getAvailableModelsInfo(): Promise<ModelInfo[]>;
  getSelectedModelInfo(): Promise<{
    selectedModel: ModelInfo | null;
    availableModels: ModelInfo[];
    isFreeModel: boolean;
    freeModelNotFound: boolean;
  }>;
}