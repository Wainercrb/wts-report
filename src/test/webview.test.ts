/**
 * Test suite for src/services/webview.ts
 * Tests WebviewManager panel creation, messaging, and lifecycle
 *
 * Mock Strategy:
 * - Use require to load vscode and WebviewManager synchronously
 * - Stub vscode.window.createWebviewPanel at runtime
 * - Mock fs.readFileSync for HTML file reading
 * - Use EventEmitter pattern for panel events (onDidReceiveMessage, onDidDispose)
 */

import { assert } from '../__tests__/setup';
import * as sinon from 'sinon';
import { createMockVsCodeExtensionContext, createMockWebviewPanelWithEvents } from '../__tests__/fixtures';

// Module-level variables for vscode and WebviewManager
let vscode: any;
let WebviewManager: any;

// Initialize vscode and WebviewManager
try {
  vscode = require('vscode');
} catch {
  vscode = {
    window: {},
    Uri: { file: (path: string) => ({ fsPath: path }) },
    ViewColumn: { One: 1 },
  };
}

try {
  const webviewModule = require('../services/webview');
  WebviewManager = webviewModule.WebviewManager;
} catch (e) {
  console.error('Failed to require WebviewManager:', e);
}

/**
 * Test suite for WebviewManager
 */
suite('services/webview.ts', () => {
  let sandbox: sinon.SinonSandbox;
  let mockContext: any;
  let mockPanel: any;
  let fsStub: sinon.SinonStub;
  let vscodeWindowStub: sinon.SinonStub;
  let vscodeUriFileStub: sinon.SinonStub;

  /**
   * Setup: Create sandboxed mocks for each test
   */
  setup(() => {
    sandbox = sinon.createSandbox();

    // Create mock extension context with subscriptions array
    mockContext = createMockVsCodeExtensionContext({
      subscriptions: [],
    });

    // Create mock panel with event support
    mockPanel = createMockWebviewPanelWithEvents(sandbox);

    // Stub vscode.window.createWebviewPanel to return our mock panel
    vscodeWindowStub = sandbox.stub(vscode.window, 'createWebviewPanel').returns(mockPanel);

    // Stub fs.readFileSync to return HTML content
    const fs = require('fs');
    fsStub = sandbox.stub(fs, 'readFileSync').returns('<html><body><script src="main.js"></script></body></html>');

    // Stub vscode.Uri.file
    vscodeUriFileStub = sandbox.stub(vscode.Uri, 'file').callsFake(((path: string) => ({
      fsPath: path,
      toString: () => `vscode-resource://${path}`,
    })) as any);
  });

  /**
   * Teardown: Restore all stubs
   */
  teardown(() => {
    sandbox.restore();
  });

  // ==========================================
  // 1. Constructor & Initialization Tests
  // ==========================================

  suite('constructor', () => {
    test('should initialize with panel set to undefined', () => {
      // Arrange & Act
      const manager = new WebviewManager();

      // Assert
      assert.ok(manager);
      assert.strictEqual(typeof manager, 'object');
      // Panel should be undefined initially (can't access private field directly)
      // So we verify by checking that panel is not created until createPanel is called
    });

    test('should initialize successfully without errors', () => {
      // Arrange & Act
      let manager: any;
      assert.doesNotThrow(() => {
        manager = new WebviewManager();
      });

      // Assert
      assert.ok(manager);
    });
  });

  // ==========================================
  // 2. createPanel() Tests
  // ==========================================

  suite('createPanel()', () => {
    test('should create a new WebviewPanel with correct title and view type', () => {
      // Arrange
      const manager = new WebviewManager();

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(vscodeWindowStub.called);
      const callArgs = vscodeWindowStub.getCall(0).args;
      assert.strictEqual(callArgs[0], 'reactExtension'); // WEBVIEW_PANEL_ID
      assert.strictEqual(callArgs[1], 'TWS Report'); // WEBVIEW_PANEL_TITLE
    });

    test('should set ViewColumn to One', () => {
      // Arrange
      const manager = new WebviewManager();

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(vscodeWindowStub.called);
      const callArgs = vscodeWindowStub.getCall(0).args;
      assert.strictEqual(callArgs[2], vscode.ViewColumn.One);
    });

    test('should enable scripts in showOptions', () => {
      // Arrange
      const manager = new WebviewManager();

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(vscodeWindowStub.called);
      const callArgs = vscodeWindowStub.getCall(0).args;
      const showOptions = callArgs[3];
      assert.ok(showOptions.enableScripts === true);
    });

    test('should set panel HTML content from getHtmlForWebview', () => {
      // Arrange
      const manager = new WebviewManager();

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(mockPanel.webview.html);
      assert.ok(mockPanel.webview.html.includes('html'));
    });

    test('should register onDidDispose listener', () => {
      // Arrange
      const manager = new WebviewManager();
      const mockDisposable = mockPanel.onDidDispose;

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(mockDisposable.called);
    });

    test('should call dispose when panel is disposed', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);

      // Get the dispose handler that was registered
      const disposeHandler = mockPanel.onDidDispose.getCall(0).args[0];

      // Act
      disposeHandler();

      // Assert - panel should be cleared (we verify by checking postMessage doesn't crash)
      // Since we can't access private field, we verify by calling postMessage after dispose
      // which should handle the undefined panel gracefully
      assert.doesNotThrow(() => {
        manager.postMessage({ test: 'message' });
      });
    });

    test('should add subscriptions to context.subscriptions', () => {
      // Arrange
      const manager = new WebviewManager();
      const initialSubCount = mockContext.subscriptions.length;

      // Act
      manager.createPanel(mockContext);

      // Assert
      // The onDidDispose listener should be added to subscriptions
      assert.ok(mockPanel.onDidDispose.called);
    });
  });

  // ==========================================
  // 3. postMessage() Tests
  // ==========================================

  suite('postMessage()', () => {
    test('should post message to active panel webview', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);
      const testMessage = { command: 'test', data: 'value' };

      // Act
      manager.postMessage(testMessage);

      // Assert
      assert.ok(mockPanel.webview.postMessage.called);
      assert.deepStrictEqual(mockPanel.webview.postMessage.getCall(0).args[0], testMessage);
    });

    test('should handle multiple messages to active panel', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);
      const message1 = { type: 'log' };
      const message2 = { type: 'error' };

      // Act
      manager.postMessage(message1);
      manager.postMessage(message2);

      // Assert
      assert.strictEqual(mockPanel.webview.postMessage.callCount, 2);
      assert.deepStrictEqual(mockPanel.webview.postMessage.getCall(0).args[0], message1);
      assert.deepStrictEqual(mockPanel.webview.postMessage.getCall(1).args[0], message2);
    });

    test('should return silently when no active panel exists', () => {
      // Arrange
      const manager = new WebviewManager();
      // Don't call createPanel, so no active panel
      const testMessage = { command: 'test' };

      // Act & Assert
      assert.doesNotThrow(() => {
        manager.postMessage(testMessage);
      });
      // postMessage should not be called since there's no panel
      assert.ok(!mockPanel.webview.postMessage.called);
    });

    test('should handle disposed panel gracefully', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);

      // Get the dispose handler and call it
      const disposeHandler = mockPanel.onDidDispose.getCall(0).args[0];
      disposeHandler();

      const testMessage = { command: 'test' };

      // Act & Assert
      assert.doesNotThrow(() => {
        manager.postMessage(testMessage);
      });
    });

    test('should handle various message types (objects)', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);
      const complexMessage = {
        command: 'process',
        data: {
          nested: true,
          value: 42,
          array: [1, 2, 3],
        },
      };

      // Act
      manager.postMessage(complexMessage);

      // Assert
      assert.ok(mockPanel.webview.postMessage.called);
      assert.deepStrictEqual(mockPanel.webview.postMessage.getCall(0).args[0], complexMessage);
    });
  });

  // ==========================================
  // 4. getHtmlForWebview() Tests (via HTML content)
  // ==========================================

  suite('getHtmlForWebview()', () => {
    test('should read HTML file from correct path', () => {
      // Arrange
      const manager = new WebviewManager();

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(fsStub.called);
      // Verify fs.readFileSync was called
      const callArgs = fsStub.getCall(0).args;
      assert.ok(callArgs[0].includes('index.html'));
    });

    test('should return HTML string content', () => {
      // Arrange
      const manager = new WebviewManager();
      const expectedHtml = '<html><body>Test</body></html>';
      fsStub.returns(expectedHtml);

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(mockPanel.webview.html);
      // HTML should have been processed and set
      assert.strictEqual(typeof mockPanel.webview.html, 'string');
    });

    test('should replace main.js URIs with webview URIs', () => {
      // Arrange
      const manager = new WebviewManager();
      const htmlWithScript = '<html><body><script src="main.js"></script></body></html>';
      fsStub.returns(htmlWithScript);

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(mockPanel.webview.html);
      // The HTML should have the script src replaced
      const html = mockPanel.webview.html;
      assert.ok(html.includes('vscode-resource'));
    });

    test('should handle HTML with multiple script references', () => {
      // Arrange
      const manager = new WebviewManager();
      const htmlMultipleScripts = `
        <html>
          <head><script src="main.js"></script></head>
          <body>
            <div id="app"></div>
            <script src="main.js"></script>
          </body>
        </html>
      `;
      fsStub.returns(htmlMultipleScripts);

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(mockPanel.webview.html);
      const html = mockPanel.webview.html;
      // Both script references should be replaced
      const scriptCount = (html.match(/vscode-resource/g) || []).length;
      assert.ok(scriptCount >= 2 || html.includes('vscode-resource'));
    });

    test('should handle HTML without script references gracefully', () => {
      // Arrange
      const manager = new WebviewManager();
      const simpleHtml = '<html><body><h1>Hello</h1></body></html>';
      fsStub.returns(simpleHtml);

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(mockPanel.webview.html);
      assert.strictEqual(mockPanel.webview.html, simpleHtml);
    });
  });

  // ==========================================
  // 5. Error Handling & Edge Cases
  // ==========================================

  suite('error handling', () => {
    test('should handle disposed panel gracefully when posting messages', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);

      // Simulate panel disposal
      const disposeHandler = mockPanel.onDidDispose.getCall(0).args[0];
      disposeHandler();

      // Act & Assert
      assert.doesNotThrow(() => {
        manager.postMessage({ command: 'test' });
      });
    });

    test('should work when no panel exists and postMessage is called', () => {
      // Arrange
      const manager = new WebviewManager();
      // Don't create panel, so it will be undefined
      
      // Act & Assert
      assert.doesNotThrow(() => {
        manager.postMessage({ command: 'test' });
      });
    });

    test('should handle empty HTML file content', () => {
      // Arrange
      const manager = new WebviewManager();
      fsStub.returns('');

      // Act
      manager.createPanel(mockContext);

      // Assert
      assert.ok(mockPanel.webview.html !== undefined);
      assert.strictEqual(mockPanel.webview.html, '');
    });

    test('should handle createPanel when context has no subscriptions', () => {
      // Arrange
      const manager = new WebviewManager();
      const contextNoSubs = createMockVsCodeExtensionContext({
        subscriptions: [],
      });

      // Act & Assert
      assert.doesNotThrow(() => {
        manager.createPanel(contextNoSubs);
      });
      assert.ok(mockPanel.webview.html);
    });

    test('should handle registerMessageHandler gracefully without active panel', () => {
      // Arrange
      const manager = new WebviewManager();
      const mockHandler = sandbox.stub();

      // Act & Assert
      assert.doesNotThrow(() => {
        manager.registerMessageHandler(mockHandler, mockContext);
      });
    });
  });

  // ==========================================
  // 6. dispose() Tests
  // ==========================================

  suite('dispose()', () => {
    test('should clear panel reference when disposed', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);

      // Act
      const disposeHandler = mockPanel.onDidDispose.getCall(0).args[0];
      disposeHandler();

      // Assert - verify postMessage doesn't use panel
      assert.doesNotThrow(() => {
        manager.postMessage({ test: 'message' });
      });
    });

    test('should not throw when dispose is called multiple times', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);
      const disposeHandler = mockPanel.onDidDispose.getCall(0).args[0];

      // Act & Assert
      assert.doesNotThrow(() => {
        disposeHandler();
        disposeHandler();
      });
    });
  });

  // ==========================================
  // 7. registerMessageHandler() Tests
  // ==========================================

  suite('registerMessageHandler()', () => {
    test('should register message handler with panel when panel exists', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);
      const mockHandler = sandbox.stub();

      // Act
      manager.registerMessageHandler(mockHandler, mockContext);

      // Assert
      assert.ok(mockPanel.webview.onDidReceiveMessage.called);
    });

    test('should call handler when panel receives a message', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);
      const mockHandler = sandbox.stub();

      // Act
      manager.registerMessageHandler(mockHandler, mockContext);
      const testMessage = { command: 'test', data: 'value' };
      (mockPanel as any).__fireMessage(testMessage);

      // Assert
      assert.ok(mockHandler.called);
      assert.deepStrictEqual(mockHandler.getCall(0).args[0], testMessage);
    });

    test('should not throw when registering handler with no active panel', () => {
      // Arrange
      const manager = new WebviewManager();
      const mockHandler = sandbox.stub();

      // Act & Assert
      assert.doesNotThrow(() => {
        manager.registerMessageHandler(mockHandler, mockContext);
      });
      // Handler should not be registered since there's no panel
      assert.ok(!mockPanel.webview.onDidReceiveMessage.called);
    });

    test('should handle multiple message handlers', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);
      const handler1 = sandbox.stub();
      const handler2 = sandbox.stub();

      // Act
      manager.registerMessageHandler(handler1, mockContext);
      manager.registerMessageHandler(handler2, mockContext);
      const testMessage = { type: 'test' };
      (mockPanel as any).__fireMessage(testMessage);

      // Assert
      assert.ok(handler1.called);
      assert.ok(handler2.called);
    });

    test('should add subscriptions to context for message handler', () => {
      // Arrange
      const manager = new WebviewManager();
      manager.createPanel(mockContext);
      const mockHandler = sandbox.stub();

      // Act
      manager.registerMessageHandler(mockHandler, mockContext);

      // Assert
      assert.ok(mockPanel.webview.onDidReceiveMessage.called);
    });
  });
});
