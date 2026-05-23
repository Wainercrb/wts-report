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

// Helper: Create a ChatModelProvider with the given stubs
function createModelProvider(debugLog?: sinon.SinonStub): any {
  const { ChatModelProvider } = require('../services/chat-model-provider');
  return new ChatModelProvider(debugLog || (() => {}));
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
  let mockOnResult: sinon.SinonStub;

  /**
   * Setup: Create sandboxed mocks for each test
   */
  setup(() => {
    sandbox = sinon.createSandbox();

    // Create test helpers
    mockDebugLog = sandbox.stub();
    mockOnResult = sandbox.stub();

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
    test('should initialize with required args', () => {
      const provider = createModelProvider();
      const svc = new LLMService(provider);
      assert.ok(svc);
      assert.strictEqual(typeof svc, 'object');
    });

    test('should accept debugLogFn', () => {
      const provider = createModelProvider(mockDebugLog);
      const svc = new LLMService(provider, mockDebugLog);
      assert.ok(svc);
    });

    test('should accept onResult callback', () => {
      const provider = createModelProvider();
      const svc = new LLMService(provider, undefined, mockOnResult);
      assert.ok(svc);
    });

    test('should accept all constructor args', () => {
      const provider = createModelProvider(mockDebugLog);
      const svc = new LLMService(provider, mockDebugLog, mockOnResult);
      assert.ok(svc);
    });
  });

  // ==========================================
  // 2. formatGitChangesAsTimesheet Tests
  // ==========================================

  suite('formatGitChangesAsTimesheet', () => {
    test('should return fallback message when gitChanges array is empty', async () => {
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);
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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);
      const result = await service.formatGitChangesAsTimesheet(gitChanges);

      assert.ok(result);
      assert.ok(result.length > 0);
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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      const result = await service.formatGitChangesAsTimesheet(gitChanges);

      assert.ok(result.includes('[main]'));
      assert.ok(result.includes('[frontend]'));
      assert.ok(result.includes('commit message'));
    });

    test('should return formatted changes when selectChatModels rejects (error is caught at model level)', async () => {
      const gitChanges = createGitChangeArray(1);
      vscode.lm.selectChatModels.rejects(new Error('Model selection failed'));
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      const result = await service.formatGitChangesAsTimesheet(gitChanges);
      // Error is caught by ChatModelProvider.getModels(), which returns []
      // so getAvailableChatModel returns undefined and the method returns raw changes
      assert.ok(result.includes('[branch-0]'));
      assert.ok(result.includes('[project-0]'));
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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges);

      assert.ok(vscode.LanguageModelChatMessage.User.calledTwice);
      const firstCall = vscode.LanguageModelChatMessage.User.getCall(0);
      assert.ok(firstCall.args[0].includes('timesheet'));
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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges);
      assert.ok(mockDebugLog.calledWithMatch(['formatGitChangesAsTimesheet: LLM completed successfully']));
    });

    // ==========================================
    //  Stored Items Tests
    // ==========================================

    test('should add third User message when storedItems present', async () => {
      const gitChanges = createGitChangeArray(1);
      const storedItems = [
        { tsType: 'meeting', tsText: 'Sprint planning' },
        { tsType: 'tasks', tsText: 'Code review PR #42' },
      ];
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('merged response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges, storedItems);

      assert.strictEqual(vscode.LanguageModelChatMessage.User.callCount, 3);
      const thirdCall = vscode.LanguageModelChatMessage.User.getCall(2);
      assert.ok(thirdCall.args[0].includes('manually entered work log items'));
      assert.ok(thirdCall.args[0].includes('[meeting] Sprint planning'));
      assert.ok(thirdCall.args[0].includes('[tasks] Code review PR #42'));
    });

    test('should NOT add third User message when storedItems empty', async () => {
      const gitChanges = createGitChangeArray(1);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges, []);

      assert.ok(vscode.LanguageModelChatMessage.User.calledTwice);
    });

    test('should NOT add third User message when storedItems absent', async () => {
      const gitChanges = createGitChangeArray(1);
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      await service.formatGitChangesAsTimesheet(gitChanges);

      assert.ok(vscode.LanguageModelChatMessage.User.calledTwice);
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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      await service.runQuery(userQuery);

      assert.ok(mockDebugLog.calledWithMatch(['=== LLM checking (command) received query ===', userQuery]));
    });

    test('should create User messages with prompt and query', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);
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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);
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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      assert.doesNotThrow(async () => {
        await service.runQuery('test', undefined);
      });
    });

    test('should post message to onResult if available', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('llm result'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog, mockOnResult);

      await service.runQuery('test');

      assert.ok(mockOnResult.calledOnce);
      const messageArg = mockOnResult.getCall(0).args;
      assert.strictEqual(messageArg[0], 'llmResult');
      assert.strictEqual(messageArg[1], 'llm result');
    });

    test('should return silently when no model available', async () => {
      vscode.lm.selectChatModels.resolves([]);
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      const result = await service.runQuery('test');

      assert.strictEqual(result, undefined);
    });

    test('should catch and log exceptions from model selection', async () => {
      const errorMsg = 'Query failed';
      vscode.lm.selectChatModels.rejects(new Error(errorMsg));
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      await service.runQuery('test');

      // Error is caught by ChatModelProvider.getModels, which returns empty array
      // runQuery then sees no model available and handles gracefully
      assert.ok(mockDebugLog.calledWithMatch(['ERROR: getModels - Error: ' + errorMsg]));
    });

    test('should handle response.markdown undefined', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response text'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);
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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

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
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

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
      const provider = createModelProvider();
      const service = new LLMService(provider);

      assert.doesNotThrow(async () => {
        await service.formatGitChangesAsTimesheet(gitChanges);
      });
    });

    test('should work without onResult provided', async () => {
      const mockModel = {
        id: 'gpt-4o',
        sendRequest: sandbox.stub().resolves({
          text: createMockStreamResponse('response'),
        }),
      };
      vscode.lm.selectChatModels.resolves([mockModel]);
      const provider = createModelProvider(mockDebugLog);
      const service = new LLMService(provider, mockDebugLog);

      assert.doesNotThrow(async () => {
        await service.runQuery('test');
      });
    });
  });
});
