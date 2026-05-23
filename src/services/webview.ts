import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IWebviewManager } from '../types';
import { WEBVIEW_PANEL_ID, WEBVIEW_PANEL_TITLE, HTML_FILENAME, SCRIPT_FILENAME } from '../config';

/**
 * Manages webview panel creation, messaging, and lifecycle
 */
export class WebviewManager implements IWebviewManager {
  private panel: vscode.WebviewPanel | undefined;

  /**
   * Create and display a webview panel
   */
  createPanel(context: vscode.ExtensionContext): void {
    const showOptions = { enableScripts: true };

    this.panel = vscode.window.createWebviewPanel(
      WEBVIEW_PANEL_ID,
      WEBVIEW_PANEL_TITLE,
      vscode.ViewColumn.One,
      showOptions
    );

    this.panel.webview.html = this.getHtmlForWebview(this.panel.webview);
    this.panel.onDidDispose(() => this.dispose(), null, context.subscriptions);
  }

  /**
   * Post a message to the webview
   */
  postMessage(message: Record<string, unknown>): void {
    if (this.panel?.webview) {
      try {
        this.panel.webview.postMessage(message);
      } catch {
        // Panel may have been disposed; fail silently
      }
    }
  }

  /**
   * Clean up panel resources
   */
  dispose(): void {
    this.panel = undefined;
  }

  /**
   * Get the HTML content for the webview
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    try {
      const htmlPath = path.join(__dirname, '..', HTML_FILENAME);
      const html = fs.readFileSync(htmlPath, 'utf8');

      const scriptUri = webview.asWebviewUri(
        vscode.Uri.file(path.join(__dirname, '..', SCRIPT_FILENAME))
      );

      return html.replace(/src=("|')main\.js\1/g, `src="${scriptUri.toString()}"`);
    } catch (error) {
      return `Error loading HTML: ${error}`;
    }
  }

  /**
   * Register message handler for the webview
   */
  registerMessageHandler(
    handler: (message: unknown) => void,
    context: vscode.ExtensionContext
  ): void {
    if (this.panel) {
      this.panel.webview.onDidReceiveMessage(handler, undefined, context.subscriptions);
    }
  }
}