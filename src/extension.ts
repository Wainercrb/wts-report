import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

const startCommandName = 'extension.startExtension';
const webViewPanelTitle = 'TWS Report';
const webViewPanelId = 'reactExtension';

let webViewPanel: vscode.WebviewPanel | undefined;
let outputChannel: vscode.OutputChannel | undefined;

function isDebug(): boolean {
  return true;
  return String(process.env.DEBUG).toLowerCase() === 'true';
}

function debugLog(...lines: string[]) {
  if (!outputChannel) return;
  for (const l of lines) outputChannel.appendLine(l);
  if (isDebug()) outputChannel.show(true);
}

function startCommandHandler(context: vscode.ExtensionContext): void {

  const showOptions = {
    enableScripts: true
  };

  const panel = vscode.window.createWebviewPanel(
    webViewPanelId,
    webViewPanelTitle,
    vscode.ViewColumn.One,
    showOptions
  );

  panel.webview.html = getHtmlForWebview(panel.webview);
  panel.webview.onDidReceiveMessage(
    onPanelDidReceiveMessage,
    undefined,
    context.subscriptions
  );

  panel.onDidDispose(onPanelDispose, null, context.subscriptions);

  webViewPanel = panel;
}

function onPanelDispose(): void {
  // Clean up panel here
}

type WebviewMessage = { command: string } & Record<string, unknown>;

function isWebviewMessage(obj: unknown): obj is WebviewMessage {
  return typeof obj === 'object' && obj !== null && typeof (obj as Record<string, unknown>)['command'] === 'string';
}

function onPanelDidReceiveMessage(message: unknown) {
  if (!isWebviewMessage(message)) return;

  switch (message.command) {
    case 'showInformationMessage': {
      const text = (message as Record<string, unknown>)['text'];
      if (typeof text === 'string') vscode.window.showInformationMessage(text);
      return;
    }

    case 'getDirectoryInfo':
      runDirCommand((result: string) => safePostMessage({ command: 'getDirectoryInfo', directoryInfo: result }));
      return;

    case 'checkGitHistory':
      // Run `git log` in workspace root (if available) and send result back
      const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;
      runGitLog((result: string) => safePostMessage({ command: 'gitHistoryResult', result }), cwd);
      return;

    case 'formValues': {
      const vals = (message as Record<string, unknown>)['values'];
      vscode.window.showInformationMessage(`Form submitted`);
      try {
        debugLog('Form values received from webview:');
        debugLog(JSON.stringify(vals, null, 2));
      } catch {
        debugLog(String(vals));
      }

      // Trigger LLM handling (registered command)
      try {
        vscode.commands.executeCommand('llm-checking', JSON.stringify(vals));
      } catch (e) {
        debugLog('Failed to execute llm-checking: ' + String(e));
      }
      return;
    }
  }
}

function runDirCommand(callback: (out: string) => void) {
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? process.env.comspec || 'cmd.exe' : 'ls';
  const args = isWindows ? ['/c', 'dir'] : ['-la'];
  const cp = spawn(cmd, args, { windowsHide: true });

  let out = '';
  cp.stdout.on('data', (data: Buffer) => { out += String(data); });
  cp.on('close', () => callback(out));
  cp.on('error', () => callback(''));
}

function runGitLog(callback: (out: string) => void, cwd?: string) {
  // Limit to last 100 commits for performance
  const args = ['log', '--oneline', '-n', '100'];
  const cp = spawn('git', args, { cwd, windowsHide: true });

  let out = '';
  cp.stdout.on('data', (data: Buffer) => { out += String(data); });
  cp.stderr.on('data', (data: Buffer) => { out += String(data); });
  cp.on('close', () => callback(out));
  cp.on('error', (err) => callback(String(err)));
}


async function runLLMQuery(userQuery: string, response?: { markdown?: (text: string) => void }, token?: vscode.CancellationToken) {
  try {
    debugLog('=== LLM checking (command) received query ===', String(userQuery));

    // const allChatModels = await vscode.lm.selectChatModels();
    
    // if (!allChatModels || allChatModels.length === 0) {
    //   debugLog('No chat models available');
    //   return;
    // }

    const chatModel = await vscode.lm.selectChatModels({ family: 'gpt-4o' });
    if (!chatModel || chatModel.length === 0) {
      debugLog('No gpt-4o family chat model available');
      return;
    }

    const getFormattedDate = () => {
  const now = new Date();

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(now);
};

const today = getFormattedDate();

const PROMPT = `
  You are an expert timesheet writer. I will provide a JSON array containing work log items. Your task is to transform this input into a clear, professional, and well-structured plain-text report.

  IMPORTANT:
  - ALWAYS use this date: ${today}
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
  ${today}:

  <meeting descriptions>

  I have completed the following tasks:
  ${today}:

  <task descriptions>

  5. Additional rules
  - Use consistent past tense.
  - Expand abbreviations where appropriate (e.g., "1:1" → "one-on-one meeting").
  - If a category has no items, include the header but leave it empty.
  `;

    const messages = [
      vscode.LanguageModelChatMessage.User(PROMPT),
      vscode.LanguageModelChatMessage.User(`json array: ${userQuery}`),
    ];

    const chatRequest = await chatModel[0].sendRequest(messages, undefined, token);

    // Buffer streamed text chunks and emit once to avoid fragmented spacing
    let fullText = '';
    for await (const chunk of chatRequest.text) {
      fullText += String(chunk);
    }

    if (response && typeof response.markdown === 'function') {
      response.markdown(fullText);
    }
    debugLog(fullText);
    // Send the full LLM result back to the webview UI if available
    try {
      if (typeof webViewPanel !== 'undefined' && webViewPanel && webViewPanel.webview) {
        webViewPanel.webview.postMessage({ command: 'llmResult', result: fullText });
      }
    }
    catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      debugLog('Error posting result to webview: ' + msg);
    }
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    debugLog('runLLMQuery error: ' + msg);
  }
}

function getHtmlForWebview(webview: vscode.Webview): string {
  try {
    const reactApplicationHtmlFilename = 'index.html';
    const htmlPath = path.join(__dirname, reactApplicationHtmlFilename);
    const html = fs.readFileSync(htmlPath).toString();

    // Replace local script/style references with webview URIs
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'main.js')));
    // Replace occurrences of src="main.js" or src='main.js'
    const updated = html.replace(/src=("|')main\.js\1/g, `src="${scriptUri.toString()}"`);

    return updated;
  }
  catch (e) {
    return `Error getting HTML for web view: ${e}`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('ReactForm');
  context.subscriptions.push(outputChannel);

  const startCommand = vscode.commands.registerCommand(startCommandName, () => startCommandHandler(context));
  context.subscriptions.push(startCommand);

  const llmCheckingCommand = vscode.commands.registerCommand('llm-checking', async (prompt: string) => {
    await runLLMQuery(String(prompt));
  });
  context.subscriptions.push(llmCheckingCommand);

  // Register a chat participant to allow pipeline invocation from chat
  if (vscode.chat && typeof vscode.chat.createChatParticipant === 'function') {
    vscode.chat.createChatParticipant('llm-checking', async (request, ctx, response, token) => {
      await runLLMQuery(request.prompt, response, token);
    });
  }
}

// Safe helper to post messages to the webview if available
function safePostMessage(message: Record<string, unknown>) {
  try {
    if (webViewPanel && webViewPanel.webview) {
      webViewPanel.webview.postMessage(message);
    }
  }
  catch (e: unknown) {
    debugLog('Error posting to webview: ' + (e instanceof Error ? e.message : String(e)));
  }
}