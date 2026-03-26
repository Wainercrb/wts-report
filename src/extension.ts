import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const startCommandName = 'extension.startExtension';
const webViewPanelTitle = 'React extension';
const webViewPanelId = 'reactExtension';

let webViewPanel : vscode.WebviewPanel;
let outputChannel: vscode.OutputChannel;

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

  panel.webview.html = getHtmlForWebview();
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

function onPanelDidReceiveMessage(message: any) {
  switch (message.command) {
    case 'showInformationMessage':
      vscode.window.showInformationMessage(message.text);
      return;

    case 'getDirectoryInfo':
      runDirCommand((result : string) => webViewPanel.webview.postMessage({ command: 'getDirectoryInfo', directoryInfo: result }));
      return;

    case 'formValues':
      // Show a brief info message and write to the extension output
      console.log('Form message from webview:', message);
      const vals = message.values || {};
      vscode.window.showInformationMessage(`Form submitted: ${vals.username || ''}`);
      console.log('Form values received from webview:', vals);
      if (outputChannel) {
        outputChannel.appendLine('Form values received from webview:');
        outputChannel.appendLine(JSON.stringify(vals, null, 2));
        outputChannel.show(true);
      }

      vscode.commands.executeCommand('llm-checking', JSON.stringify(message.values));
      return;
  }
}

function runDirCommand(callback : Function) {
  var spawn = require('child_process').spawn;
  var cp = spawn(process.env.comspec, ['/c', 'dir']);
  
  cp.stdout.on("data", function(data : any) {
    const dataString = data.toString();

    callback(dataString);
  });
  
  cp.stderr.on("data", function(data : any) {
    // No op
  });
}


async function runLLMQuery(userQuery: string, response?: any, token?: any) {
  try {
    if (outputChannel) {
      outputChannel.appendLine('=== LLM checking (command) received query ===');
      outputChannel.appendLine(String(userQuery));
      outputChannel.show(true);
    }

    const allChatModels = await vscode.lm.selectChatModels();
    if (!allChatModels || allChatModels.length === 0) {
      if (outputChannel) outputChannel.appendLine('No chat models available');
      return;
    }

    const chatModel = await vscode.lm.selectChatModels({ family: 'gpt-4o' });
    if (!chatModel || chatModel.length === 0) {
      if (outputChannel) outputChannel.appendLine('No gpt-4o family chat model available');
      return;
    }

    const query = `
    You are an expert time-sheet writer. I will send a JSON array with today's items. Your job:

    1. Analyze each item and preserve its original meaning.
    2. Always improve grammar, clarity, and descriptions. If an item lacks enough information, infer reasonable, professional details to make the description useful — do not change the item's intent. If you must infer, include the assumption in parentheses as part of the description.
    3. Classify items into "meetings" and "tasks".
    4. Group results by date and present them exactly as plain text with this structure:
    I have attended the following meetings:
    Day DD Mon YYYY:

    <Improved meeting description>
    I have completed the following tasks:
    Day DD Mon YYYY:

    <Improved task description>
    Rules:

    Input is a JSON array; items may include an optional tsDate (ISO YYYY-MM-DD). If absent, assume today's date.
    Preserve the original order of items within each date.
    Use date format: "Wed 26 Mar 2026".
    Improve short labels into full sentences (fix typos, expand abbreviations, normalize tense).
    If no meetings or no tasks exist, include the section header with no bullets.
    Output only the plain text report (no JSON, no extra commentary).
    Input example:
    [
      {
      "tsType": "task",
      "tsText": "ticket 102",
      "tsDate": "2026-03-26"
      },
      {
      "tsType": "meeting",
      "tsText": "1:1",
      "tsDate": "2026-03-26"
      }
    ]

    Example output:

    I have attended the following meetings:
    Wed 26 Mar 2026:

    1:1 meeting with my manager (assumed it was a one-on-one with manager)
    I have completed the following tasks:
    Wed 26 Mar 2026:

    Worked on ticket 102 -> this is a bit short, so I will infer that it involved development work to resolve the ticket, and expand it to "Worked on ticket 102, performing development tasks to resolve the issue (inferred development work based on typical ticket resolution activities)"
    
    `

    const messages = [
      vscode.LanguageModelChatMessage.User(query),
      vscode.LanguageModelChatMessage.User('data:'),
      vscode.LanguageModelChatMessage.User(userQuery)
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
    if (outputChannel) outputChannel.appendLine(fullText);
    // Send the full LLM result back to the webview UI if available
    try {
      if (typeof webViewPanel !== 'undefined' && webViewPanel && webViewPanel.webview) {
        webViewPanel.webview.postMessage({ command: 'llmResult', result: fullText });
      }
    }
    catch (e: any) {
      if (outputChannel) outputChannel.appendLine('Error posting result to webview: ' + (e && e.message ? e.message : String(e)));
    }
  }
  catch (e: any) {
    if (outputChannel) outputChannel.appendLine('runLLMQuery error: ' + (e && e.message ? e.message : String(e)));
  }
}

function getHtmlForWebview(): string {
  try {
    const reactApplicationHtmlFilename = 'index.html';
    const htmlPath = path.join(__dirname, reactApplicationHtmlFilename);
    const html = fs.readFileSync(htmlPath).toString();

    return html;
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


  vscode.chat.createChatParticipant('llm-checking', async (request, context, response, token) => {
    await runLLMQuery(request.prompt, response, token);
  });
}