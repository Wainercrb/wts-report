import { OUTPUT_CHANNEL_NAME } from "../../consts";
import { ILogger } from "../types";
import * as vscode from "vscode";

/**
 * Simple logger implementation using VS Code output channel
 */
export class Logger implements ILogger {
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
    // context.subscriptions.push(outputChannel);
  }

  log(lines: string[]): void {
    for (const line of lines) {
      this.outputChannel.appendLine(line);
    }
    if (String(process.env.DEBUG).toLowerCase() === "true") {
      this.outputChannel.show(true);
    }
  }
}
