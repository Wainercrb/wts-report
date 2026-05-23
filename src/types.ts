import * as vscode from 'vscode';

/**
 * Result type for operations that may fail
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Message sent from webview to extension
 */
export type WebviewMessage = { command: string } & Record<string, unknown>;

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
 * Command executor interface for shell operations
 */
export interface ICommandExecutor {
  runDirCommand(callback: (output: string) => void): void;
  runGitLog(callback: (output: string) => void, cwd?: string): void;
}

/**
 * LLM service interface
 */
export interface ILLMService {
  runQuery(query: string, response?: { markdown?: (text: string) => void }, token?: vscode.CancellationToken): Promise<void>;
  formatGitChangesAsTimesheet(gitChanges: GitChange[]): Promise<string>;
  getAvailableModelsInfo(): Promise<Array<{ id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number }>>;
  getSelectedModelInfo(): Promise<{
    selectedModel: { id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number } | null;
    availableModels: Array<{ id: string; name: string; pricing: string; isFree: boolean; vendor: string; maxTokens: number }>;
    isFreeModel: boolean;
    freeModelNotFound: boolean;
  }>;
}