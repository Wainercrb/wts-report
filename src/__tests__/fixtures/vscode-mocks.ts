import * as vscode from 'vscode';
import * as sinon from 'sinon';

/**
 * Create a mock VSCode ExtensionContext
 * @param overrides Optional properties to override defaults
 * @returns Mock ExtensionContext object
 *
 * @example
 * const mockContext = createMockVsCodeExtensionContext();
 * extension.activate(mockContext);
 */
export function createMockVsCodeExtensionContext(
  overrides?: Partial<vscode.ExtensionContext>
): Partial<vscode.ExtensionContext> {
  return {
    extensionUri: vscode.Uri.file('/mock/extension'),
    globalState: {
      get: sinon.stub().returns(undefined),
      update: sinon.stub().resolves(undefined),
      setKeysForSync: sinon.stub(),
      keys: () => [],
    } as any,
    workspaceState: {
      get: sinon.stub().returns(undefined),
      update: sinon.stub().resolves(undefined),
      setKeysForSync: sinon.stub(),
      keys: () => [],
    } as any,
    extensionPath: '/mock/extension',
    storagePath: '/mock/storage',
    globalStoragePath: '/mock/global-storage',
    logPath: '/mock/logs',
    subscriptions: [],
    ...overrides,
  };
}

/**
 * Create a mock WebviewPanel
 * @param overrides Optional properties to override defaults
 * @returns Mock WebviewPanel object
 *
 * @example
 * const mockPanel = createMockWebviewPanel();
 * expect(mockPanel.webview.onDidReceiveMessage).to.be.called;
 */
export function createMockWebviewPanel(
  overrides?: Partial<vscode.WebviewPanel>
): Partial<vscode.WebviewPanel> {
  const mockDisposable = { dispose: sinon.stub() };

  return {
    viewType: 'test-view',
    title: 'Test Panel',
    iconPath: vscode.Uri.file('/mock/icon.svg'),
    webview: {
      asWebviewUri: (uri: vscode.Uri) => uri,
      cspSource: 'https://mock.webview.com',
      html: '<html></html>',
      onDidReceiveMessage: sinon.stub().returns(mockDisposable),
      postMessage: sinon.stub().resolves(true),
    } as any,
    viewColumn: vscode.ViewColumn.One,
    visible: true,
    active: true,
    onDidChangeViewState: sinon.stub().returns(mockDisposable),
    onDidDispose: sinon.stub().returns(mockDisposable),
    reveal: sinon.stub(),
    dispose: sinon.stub(),
    ...overrides,
  };
}

/**
 * Create a mock LanguageModel for vscode.lm testing
 * @param responseText Text to return from mock LLM
 * @returns Mock ChatModel object
 *
 * @example
 * const mockModel = createMockLanguageModel('LLM response');
 * const models = [mockModel];
 * sandbox.stub(vscode.lm, 'selectChatModels').resolves(models);
 */
export function createMockLanguageModel(
  responseText: string = 'Mock LLM response'
): Partial<vscode.LanguageModelChat> {
  const mockAsyncIterable = async function* () {
    yield { index: 0, part: responseText };
  };

  return {
    id: 'gpt-4o',
    family: 'gpt-4o' as any,
    vendor: 'openai',
    version: '2024-05-13',
    maxInputTokens: 128000,
    sendRequest: sinon.stub().resolves({
      text: mockAsyncIterable(),
    } as any),
  };
}

/**
 * Create a mock OutputChannel for logging
 * @returns Mock OutputChannel object
 *
 * @example
 * const mockChannel = createMockOutputChannel();
 * mockChannel.appendLine('test log');
 * expect(mockChannel.appendLine).to.be.called;
 */
export function createMockOutputChannel(): Partial<vscode.OutputChannel> {
  return {
    name: 'test-output',
    append: sinon.stub(),
    appendLine: sinon.stub(),
    clear: sinon.stub(),
    show: sinon.stub() as any,
    hide: sinon.stub(),
    dispose: sinon.stub(),
    replace: sinon.stub(),
  };
}

/**
 * Create a mock WebviewPanel with custom event handlers
 * Useful for testing event flow
 *
 * @param sandbox Sinon sandbox for stub cleanup
 * @returns Mock WebviewPanel with registered message handler
 *
 * @example
 * const mockPanel = createMockWebviewPanelWithEvents(sandbox);
 * const handler = mockPanel.webview.onDidReceiveMessage.getCall(0).args[0];
 * handler({ command: 'test' });
 */
export function createMockWebviewPanelWithEvents(
  sandbox: sinon.SinonSandbox
): Partial<vscode.WebviewPanel> {
  const messageHandlers: Array<(msg: any) => void> = [];

  return {
    viewType: 'test-view-events',
    title: 'Test Panel with Events',
    webview: {
      asWebviewUri: (uri: vscode.Uri) => uri,
      cspSource: 'https://mock.webview.com',
      html: '<html></html>',
      onDidReceiveMessage: sandbox.stub().callsFake((handler: any) => {
        messageHandlers.push(handler);
        return { dispose: () => {} };
      }),
      postMessage: sandbox.stub().resolves(true),
    } as any,
    visible: true,
    active: true,
    onDidDispose: sandbox.stub().returns({ dispose: () => {} }),
    reveal: sandbox.stub(),
    dispose: sandbox.stub(),
    // Helper to fire messages for testing
    __fireMessage: (msg: any) => {
      messageHandlers.forEach((handler) => handler(msg));
    },
  } as any;
}
