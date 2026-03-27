import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

// Constants
const START_COMMAND_NAME = 'extension.startExtension';
const WEBVIEW_PANEL_TITLE = 'TWS Report';
const WEBVIEW_PANEL_ID = 'reactExtension';
const OUTPUT_CHANNEL_NAME = 'ReactForm';
const REACT_HTML_FILENAME = 'index.html';
const MAIN_SCRIPT_FILENAME = 'main.js';

// Interfaces
interface ILogger {
  log(...lines: string[]): void;
}

interface IWebviewManager {
  createPanel(context: vscode.ExtensionContext): void;
  postMessage(message: Record<string, unknown>): void;
  dispose(): void;
}

interface ICommandExecutor {
  runDirCommand(callback: (output: string) => void): void;
  runGitLog(callback: (output: string) => void, cwd?: string): void;
}

interface ILLMService {
  runQuery(query: string, response?: { markdown?: (text: string) => void }, token?: vscode.CancellationToken): Promise<void>;
}

// Logger implementation
class OutputChannelLogger implements ILogger {
  constructor(private outputChannel: vscode.OutputChannel) {}

  log(...lines: string[]): void {
    for (const line of lines) {
      this.outputChannel.appendLine(line);
    }
    if (this.isDebugEnabled()) {
      this.outputChannel.show(true);
    }
  }

  private isDebugEnabled(): boolean {
    return String(process.env.DEBUG).toLowerCase() === 'true';
  }
}

// Webview Manager
class WebviewPanelManager implements IWebviewManager {
  private panel: vscode.WebviewPanel | undefined;

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

  postMessage(message: Record<string, unknown>): void {
    try {
      if (this.panel?.webview) {
        this.panel.webview.postMessage(message);
      }
    } catch (error) {
      console.error('Error posting message to webview:', error);
    }
  }

  dispose(): void {
    this.panel = undefined;
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    try {
      const htmlPath = path.join(__dirname, REACT_HTML_FILENAME);
      const html = fs.readFileSync(htmlPath, 'utf8');
      const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, MAIN_SCRIPT_FILENAME)));
      return html.replace(/src=("|')main\.js\1/g, `src="${scriptUri.toString()}"`);
    } catch (error) {
      return `Error loading HTML: ${error}`;
    }
  }
}

// Command Executor
class CommandExecutor implements ICommandExecutor {
  runDirCommand(callback: (output: string) => void): void {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? (process.env.comspec || 'cmd.exe') : 'ls';
    const args = isWindows ? ['/c', 'dir'] : ['-la'];

    const childProcess = spawn(cmd, args, { windowsHide: true });
    let output = '';

    childProcess.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    childProcess.on('close', () => callback(output));
    childProcess.on('error', () => callback(''));
  }

  runGitLog(callback: (output: string) => void, cwd?: string): void {
    const args = ['log', '--oneline', '-n', '100'];
    const childProcess = spawn('git', args, { cwd, windowsHide: true });
    let output = '';

    childProcess.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      output += data.toString();
    });

    childProcess.on('close', () => callback(output));
    childProcess.on('error', (error) => callback(error.message));
  }
}

// LLM Service
class LLMService implements ILLMService {
  private readonly PROMPT_TEMPLATE = `
You are an expert timesheet writer. I will provide a JSON array containing work log items. Your task is to transform this input into a clear, professional, and well-structured plain-text report.

IMPORTANT:
- ALWAYS use this date: {today}
- IGNORE any "tsDate" values from the input

Instructions:

1. Preserve intent
- Analyze each item and maintain its original meaning.
- Do not invent unrelated work. I am a software engineer.

2. Improve descriptions
- Correct grammar, spelling, and clarity.
- Expand short or vague entries into complete, professional sentences.
- Only infer additional details when absolutely necessary.
- Do NOT include assumption explanations unless required.
- Keep descriptions concise and professional.
- Do NOT include unnecessary parentheses.

3. Categorization
- Classify each item into:
  - Meetings
  - Tasks

4. Formatting requirements
- Output must be plain text only (no JSON, no explanations).
- Use the following exact structure:

I have attended the following meetings:
{today}:

<meeting descriptions>

I have completed the following tasks:
{today}:

<task descriptions>

5. Additional rules
- Use consistent past tense.
- Expand abbreviations where appropriate (e.g., "1:1" → "one-on-one meeting").
- If a category has no items, include the header but leave it empty.
`;

  async runQuery(userQuery: string, response?: { markdown?: (text: string) => void }, token?: vscode.CancellationToken): Promise<void> {
    try {
      const chatModels = await vscode.lm.selectChatModels({ family: 'gpt-4o' });
      if (!chatModels || chatModels.length === 0) {
        throw new Error('No suitable chat model available');
      }

      const today = this.getFormattedDate();
      const prompt = this.PROMPT_TEMPLATE.replace(/{today}/g, today);

      const messages = [
        vscode.LanguageModelChatMessage.User(prompt),
        vscode.LanguageModelChatMessage.User(`json array: ${userQuery}`),
      ];

      const chatRequest = await chatModels[0].sendRequest(messages, undefined, token);

      let fullText = '';
      for await (const chunk of chatRequest.text) {
        fullText += chunk;
      }

      if (response?.markdown) {
        response.markdown(fullText);
      }

      // Send result back to webview if available
      // Note: This creates a dependency on the webview manager, but for simplicity, we'll handle it here
      // In a more SOLID design, this could be injected
      try {
        // Assuming we have access to the webview manager, but since it's not injected, we'll skip for now
        // webviewManager.postMessage({ command: 'llmResult', result: fullText });
      } catch (error) {
        console.error('Error posting LLM result to webview:', error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('LLM query error:', message);
      throw error;
    }
  }

  private getFormattedDate(): string {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  }
}

// Message Handler
class MessageHandler {
  constructor(
    private webviewManager: IWebviewManager,
    private commandExecutor: ICommandExecutor,
    private llmService: ILLMService,
    private logger: ILogger
  ) {}

  handle(message: WebviewMessage): void {
    switch (message.command) {
      case 'showInformationMessage':
        this.handleShowInfo(message);
        break;
      case 'getDirectoryInfo':
        this.handleGetDirectoryInfo();
        break;
      case 'checkGitHistory':
        this.handleCheckGitHistory();
        break;
      case 'formValues':
        this.handleFormValues(message);
        break;
      default:
        this.logger.log(`Unknown command: ${message.command}`);
    }
  }

  private handleShowInfo(message: WebviewMessage): void {
    const text = message.text as string;
    if (text) {
      vscode.window.showInformationMessage(text);
    }
  }

  private handleGetDirectoryInfo(): void {
    this.commandExecutor.runDirCommand((result) =>
      this.webviewManager.postMessage({ command: 'getDirectoryInfo', directoryInfo: result })
    );
  }

  private handleCheckGitHistory(): void {
    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    this.commandExecutor.runGitLog((result) =>
      this.webviewManager.postMessage({ command: 'gitHistoryResult', result })
    , cwd);
  }

  private async handleFormValues(message: WebviewMessage): Promise<void> {
    const values = message.values;
    vscode.window.showInformationMessage('Form submitted');

    try {
      this.logger.log('Form values received from webview:');
      this.logger.log(JSON.stringify(values, null, 2));
    } catch {
      this.logger.log(String(values));
    }

    try {
      await vscode.commands.executeCommand('llm-checking', JSON.stringify(values));
    } catch (error) {
      this.logger.log('Failed to execute llm-checking:', String(error));
    }
  }
}

// Type for webview messages
type WebviewMessage = { command: string } & Record<string, unknown>;

// Extension class
class Extension {
  private outputChannel: vscode.OutputChannel;
  private webviewManager: IWebviewManager;
  private messageHandler: MessageHandler;
  private llmService: ILLMService;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
    const logger = new OutputChannelLogger(this.outputChannel);
    this.webviewManager = new WebviewPanelManager();
    const commandExecutor = new CommandExecutor();
    this.llmService = new LLMService();
    this.messageHandler = new MessageHandler(this.webviewManager, commandExecutor, this.llmService, logger);
  }

  activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(this.outputChannel);

    const startCommand = vscode.commands.registerCommand(START_COMMAND_NAME, () => this.handleStartCommand(context));
    context.subscriptions.push(startCommand);

    const llmCheckingCommand = vscode.commands.registerCommand('llm-checking', async (prompt: string) => {
      await this.llmService.runQuery(prompt);
    });
    context.subscriptions.push(llmCheckingCommand);

    if (vscode.chat?.createChatParticipant) {
      vscode.chat.createChatParticipant('llm-checking', async (request, ctx, response, token) => {
        await this.llmService.runQuery(request.prompt, response, token);
      });
    }
  }

  private handleStartCommand(context: vscode.ExtensionContext): void {
    this.webviewManager.createPanel(context);
    // Set up message handling
    if (this.webviewManager instanceof WebviewPanelManager) {
      const panel = (this.webviewManager as any).panel; // Access private panel for message handling
      if (panel) {
        panel.webview.onDidReceiveMessage(
          (message: unknown) => this.handleMessage(message),
          undefined,
          context.subscriptions
        );
      }
    }
  }

  private handleMessage(message: unknown): void {
    if (this.isWebviewMessage(message)) {
      this.messageHandler.handle(message);
    }
  }

  private isWebviewMessage(obj: unknown): obj is WebviewMessage {
    return typeof obj === 'object' && obj !== null && typeof (obj as any).command === 'string';
  }
}

// Activate function
export function activate(context: vscode.ExtensionContext) {
  const extension = new Extension();
  extension.activate(context);
}