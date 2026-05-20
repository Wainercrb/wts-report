/**
 * Test suite for src/services/llm-service.ts
 * Tests LLM Service with VSCode Language Model API integration
 * 
 * Mock Strategy:
 * - Use require to load vscode and LLMService synchronously
 * - Stub vscode.lm methods at runtime
 * - Mock streaming responses with async generators
 */

import { assert } from '../__tests__/setup';
import * as sinon from 'sinon';
import {
  createGitChange,
  createGitChangeArray,
} from '../__tests__/fixtures';
import {
  TIMESHEET_RESPONSE_SAMPLE,
} from '../__tests__/fixtures/prompts';

// Helper: Create mock async generator for streaming
async function* createMockStreamResponse(text: string): AsyncGenerator<string, void, unknown> {
  for (const char of text.split('')) {
    yield char;
  }
}

// Module-level variables for vscode and LLMService
let vscode: any;
let LLMService: any;

// Initialize vscode and LLMService
try {
  vscode = require('vscode');
} catch {
  vscode = {
    lm: {},
    LanguageModelChatMessage: {},
    window: {},
  };
}

try {
  const llmModule = require('../services/llm-service');
  LLMService = llmModule.LLMService;
} catch (e) {
  console.error('Failed to require LLMService:', e);
}

// Test suite
suite('services/llm-service.ts', () => {
  let sandbox: sinon.SinonSandbox;
  let mockDebugLog: sinon.SinonStub;
  let mockWebviewManager: any;

  /**
   * Setup: Create sandboxed mocks for each test
   */
  setup(() => {
    sandbox = sinon.createSandbox();

    // Create test helpers
    mockDebugLog = sandbox.stub();
    mockWebviewManager = {
      postMessage: sandbox.stub(),
    };

    // Stub vscode.LanguageModelChatMessage.User
    sandbox.stub(vscode.LanguageModelChatMessage, 'User').callsFake(((text: string) => ({
      role: 'user',
      text,
    })) as any);

    // Stub vscode.lm.selectChatModels
    sandbox.stub(vscode.lm, 'selectChatModels');
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
    test('should initialize without arguments', () => {
      const svc = new LLMService();
      assert.ok(svc);
      assert.strictEqual(typeof svc, 'object');
    });

    test('should accept debugLogFn', () => {
      const svc = new LLMService(mockDebugLog);
      assert.ok(svc);
    });

    test('should accept webviewManager', () => {
      const svc = new LLMService(undefined, mockWebviewManager);
      assert.ok(svc);
    });

    test('should accept both debugLogFn and webviewManager', () => {
      const svc = new LLMService(mockDebugLog, mockWebviewManager);
      assert.ok(svc);
    });
  });

  // ==========================================
  // 2. formatGitChangesAsTimesheet Tests
  // ==========================================

  suite('formatGitChangesAsTimesheet', () => {
    test('should return fallback message when gitChanges array is empty', async () => {
      const service = new LLMService(mockDebugLog);
      const result = await service.formatGitChangesAsTimesheet([]);
      assert.strictEqual(result, 'No git changes found for today');
    });

    test('should format git changes when model available', async () => {
      const gitChanges = [
        createGitChange({
          branch: 'feature/test',
          project: 'wts-report',
          changes: 'commit: add tests',
        }),
      ];

      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse(TIMESHEET_RESPONSE_SAMPLE),
        }),
      };

      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);
      const result = await service.formatGitChangesAsTimesheet(gitChanges);

      assert.ok(result);
      assert.ok(result.length > 0);
    });

    test('should call vscode.lm.selectChatModels with gpt-4o filter', async () => {
      const gitChanges = createGitChangeArray(1);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges);

      assert.ok(vscode.lm.selectChatModels.calledOnce);
      const callArgs = vscode.lm.selectChatModels.getCall(0).args[0];
      assert.strictEqual(callArgs.family, 'gpt-4o');
    });

    test('should accumulate streamed text chunks', async () => {
      const gitChanges = createGitChangeArray(1);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('chunk1chunk2chunk3'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      const result = await service.formatGitChangesAsTimesheet(gitChanges);
      assert.strictEqual(result, 'chunk1chunk2chunk3');
    });

    test('should return formatted changes when no model available', async () => {
      const gitChanges = [
        createGitChange({
          branch: 'main',
          project: 'frontend',
          changes: 'commit message',
        }),
      ];
      vscode.lm.selectChatModels.resolves([]);
      const service = new LLMService(mockDebugLog);

      const result = await service.formatGitChangesAsTimesheet(gitChanges);

      assert.ok(result.includes('[main]'));
      assert.ok(result.includes('[frontend]'));
      assert.ok(result.includes('commit message'));
    });

    test('should return error message when selectChatModels rejects', async () => {
      const gitChanges = createGitChangeArray(1);
      vscode.lm.selectChatModels.rejects(new Error('Model selection failed'));
      const service = new LLMService(mockDebugLog);

      const result = await service.formatGitChangesAsTimesheet(gitChanges);
      assert.strictEqual(result, 'Error formatting timesheet');
    });

    test('should log error when exception occurs', async () => {
      const gitChanges = createGitChangeArray(1);
      vscode.lm.selectChatModels.rejects(new Error('LLM error'));
      const service = new LLMService(mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges);
      assert.ok(mockDebugLog.calledWithMatch(['formatGitChangesAsTimesheet error: Error: LLM error']));
    });

    test('should create User messages with prompts', async () => {
      const gitChanges = createGitChangeArray(1);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges);

      assert.ok(vscode.LanguageModelChatMessage.User.calledTwice);
      const firstCall = vscode.LanguageModelChatMessage.User.getCall(0);
      assert.ok(firstCall.args[0].includes('format'));
    });

    test('should handle multiline commit messages', async () => {
      const gitChanges = [
        createGitChange({
          branch: 'feature/complex',
          project: 'wts-report',
          changes: 'commit: Fix bug\n\nLong description',
        }),
      ];
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      const result = await service.formatGitChangesAsTimesheet(gitChanges);
      assert.ok(result);
    });

    test('should handle multiple git changes', async () => {
      const gitChanges = createGitChangeArray(3);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges);
      assert.ok(mockModel.sendRequest.calledOnce);
    });

    test('should log success message after LLM completes', async () => {
      const gitChanges = createGitChangeArray(1);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('success'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges);
      assert.ok(mockDebugLog.calledWithMatch(['formatGitChangesAsTimesheet: LLM completed successfully']));
    });
  });

  // ==========================================
  // 3. runQuery Tests
  // ==========================================

  suite('runQuery', () => {
    test('should log received query', async () => {
      const userQuery = 'test query data';
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.runQuery(userQuery);

      assert.ok(mockDebugLog.calledWithMatch(['=== LLM checking (command) received query ===', userQuery]));
    });

    test('should call vscode.lm.selectChatModels', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.runQuery('test query');
      assert.ok(vscode.lm.selectChatModels.calledOnce);
    });

    test('should create User messages with prompt and query', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.runQuery('{"test": "data"}');

      assert.ok(vscode.LanguageModelChatMessage.User.calledTwice);
      const secondCall = vscode.LanguageModelChatMessage.User.getCall(1);
      assert.ok(secondCall.args[0].includes('{"test": "data"}'));
    });

    test('should call chatModel.sendRequest with token', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);
      const mockToken = { isCancellationRequested: false };

      await service.runQuery('test', undefined, mockToken as any);

      assert.ok(mockModel.sendRequest.calledOnce);
      const callArgs = mockModel.sendRequest.getCall(0).args;
      assert.strictEqual(callArgs[2], mockToken);
    });

    test('should accumulate text chunks', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response_part1response_part2'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.runQuery('test');

      assert.ok(mockDebugLog.calledWithMatch(['response_part1response_part2']));
    });

    test('should call response.markdown if provided', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('formatted response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);
      const mockResponse = { markdown: sandbox.stub() };

      await service.runQuery('test', mockResponse);

      assert.ok(mockResponse.markdown.calledOnce);
      assert.ok(mockResponse.markdown.calledWith('formatted response'));
    });

    test('should not throw if response parameter missing', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      assert.doesNotThrow(async () => {
        await service.runQuery('test', undefined);
      });
    });

    test('should post message to webviewManager if available', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('llm result'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog, mockWebviewManager);

      await service.runQuery('test');

      assert.ok(mockWebviewManager.postMessage.calledOnce);
      const messageArg = mockWebviewManager.postMessage.getCall(0).args[0];
      assert.strictEqual(messageArg.command, 'llmResult');
      assert.strictEqual(messageArg.result, 'llm result');
    });

    test('should return silently when no model available', async () => {
      vscode.lm.selectChatModels.resolves([]);
      const service = new LLMService(mockDebugLog);

      const result = await service.runQuery('test');

      assert.strictEqual(result, undefined);
      assert.ok(mockDebugLog.calledWithMatch(['No gpt-4o family chat model available']));
    });

    test('should catch and log exceptions', async () => {
      const errorMsg = 'Query failed';
      vscode.lm.selectChatModels.rejects(new Error(errorMsg));
      const service = new LLMService(mockDebugLog);

      await service.runQuery('test');

      assert.ok(mockDebugLog.calledWithMatch(['runQuery error: ' + errorMsg]));
    });

    test('should handle response.markdown undefined', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response text'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);
      const mockResponse = {}; // No markdown function

      assert.doesNotThrow(async () => {
        await service.runQuery('test', mockResponse as any);
      });
    });

    test('should handle large streamed responses', async () => {
      const largeResponse = 'x'.repeat(10000);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse(largeResponse),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      await service.runQuery('test');

      assert.ok(mockDebugLog.calledWithMatch([largeResponse]));
    });
  });

  // ==========================================
  // 4. Integration & Edge Cases
  // ==========================================

  suite('Integration & Edge Cases', () => {
    test('should handle special characters in git changes', async () => {
      const gitChanges = [
        createGitChange({
          branch: 'feature/test',
          project: 'wts-report',
          changes: 'commit: Fix "quoted" & special chars',
        }),
      ];
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      assert.doesNotThrow(async () => {
        await service.formatGitChangesAsTimesheet(gitChanges);
      });
    });

    test('should work without logger provided', async () => {
      const gitChanges = createGitChangeArray(1);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService();

      assert.doesNotThrow(async () => {
        await service.formatGitChangesAsTimesheet(gitChanges);
      });
    });

    test('should work without webviewManager provided', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const service = new LLMService(mockDebugLog);

      assert.doesNotThrow(async () => {
        await service.runQuery('test');
      });
    });
  });
});
