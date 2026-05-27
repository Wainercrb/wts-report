import * as vscode from 'vscode';
import { ILogger } from '../types';
import { ENV_VALUES, ENV_VARS } from '../constants/env';

/**
 * Logger implementation using VS Code output channel with level prefixes
 */
export class Logger implements ILogger {
  private readonly showDebug: boolean;

  constructor(private outputChannel: vscode.OutputChannel) {
    this.showDebug =
      String(process.env[ENV_VARS.DEBUG]).toLowerCase() === ENV_VALUES.TRUE;
  }

  debug(message: string): void {
    if (this.showDebug) {
      this.outputChannel.appendLine(`[DEBUG] ${message}`);
    }
  }

  info(message: string): void {
    this.outputChannel.appendLine(`[INFO] ${message}`);
  }

  warn(message: string): void {
    this.outputChannel.appendLine(`[WARN] ${message}`);
    this.outputChannel.show(true);
  }

  error(message: string): void {
    this.outputChannel.appendLine(`[ERROR] ${message}`);
    this.outputChannel.show(true);
  }
}
