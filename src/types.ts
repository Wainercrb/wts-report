import * as vscode from 'vscode';

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
}