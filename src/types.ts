import * as vscode from 'vscode';
import { COMMANDS, CONFIG } from './consts'
/**
 * Result type for operations that may fail
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Message sent from webview to extension
 * Discriminated union for type-safe command handling
 * 
 * NOTE: string literals used here, not CONFIG/COMMANDS values — 
 * TypeScript treats CONFIG.INFO_ALERT as a namespace in type positions.
 */
export type WebviewMessage =
  | { command: 'infoAlert'; text: string }
  | { command: 'automaticTimesheetReport'; urls: UrlEntry[]; storedItems?: StoredItem[] }
  | { command: 'manualTimesheetReport'; values: Record<string, unknown> }
  | { command: 'getAvailableModels' };

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
  runManualTimeSheetReport(userQuery: string): Promise<string>;
  runAutomaticTimeSheetReport(gitChanges: GitChange[], storedItems?: StoredItem[]): Promise<string>;
  getAvailableModelsInfo(): Promise<ModelInfo[]>;
  getSelectedModelInfo(): Promise<{
    selectedModel: ModelInfo | null;
    availableModels: ModelInfo[];
    isFreeModel: boolean;
    freeModelNotFound: boolean;
  }>;
}