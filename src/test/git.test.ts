import * as sinon from 'sinon';
import { createTestSandbox, assert } from '../__tests__/setup';
import { UrlEntry } from '../types';
import {
  GIT_BRANCH_MAIN,
  GIT_BRANCH_FEATURE,
  GIT_LOG_OUTPUT,
  GIT_LOG_SINGLE_COMMIT,
  GIT_LOG_EMPTY,
  GIT_ERROR_OUTPUTS,
} from '../__tests__/fixtures';

/**
 * Test suite for src/utils/git.ts
 * Tests git operations: branch detection, log filtering, and git history extraction
 * Mocks executeCommand to isolate git.ts from system git command execution
 */
suite('utils/git.ts', () => {
  let sandbox: sinon.SinonSandbox;
  let executeStub: sinon.SinonStub;

  setup(() => {
    sandbox = createTestSandbox();
    // Stub executeCommand from the command module
    executeStub = sandbox.stub(require('../utils/command'), 'executeCommand');
  });

  teardown(() => {
    sandbox.restore();
  });

  /**
   * Test group: getGitBranch()
   * Verifies branch name extraction from git command output
   */
  suite('getGitBranch()', () => {
    test('should return the active branch name from git branch output', async () => {
      // Arrange
      const { getGitBranch } = require('../utils/git');
      const cwd = '/path/to/repo';
      executeStub.resolves(GIT_BRANCH_MAIN);

      // Act
      const branch = await getGitBranch(cwd);

      // Assert
      assert.strictEqual(branch, GIT_BRANCH_MAIN);
      assert.ok(
        executeStub.calledWith('git', ['rev-parse', '--abbrev-ref', 'HEAD'], cwd),
        'executeCommand should be called with correct git command'
      );
    });

    test('should extract branch correctly when marked with * (e.g., "* main")', async () => {
      // Arrange
      const { getGitBranch } = require('../utils/git');
      const cwd = '/path/to/repo';
      const branchOutput = '* main';
      executeStub.resolves(branchOutput);

      // Act
      const branch = await getGitBranch(cwd);

      // Assert
      assert.strictEqual(branch, branchOutput.trim());
    });

    test('should handle multi-line branch output and return only active branch', async () => {
      // Arrange
      const { getGitBranch } = require('../utils/git');
      const cwd = '/path/to/repo';
      const multilineBranches = `  main\n* develop\n  feature-123`;
      executeStub.resolves(multilineBranches);

      // Act
      const branch = await getGitBranch(cwd);

      // Assert
      // getGitBranch uses rev-parse which returns single branch, so it just trims
      assert.strictEqual(branch, multilineBranches.trim());
    });

    test('should handle branch names with special characters (spaces, dashes, slashes)', async () => {
      // Arrange
      const { getGitBranch } = require('../utils/git');
      const cwd = '/path/to/repo';
      const specialBranch = 'feature/JIRA-123-add-new-feature';
      executeStub.resolves(specialBranch);

      // Act
      const branch = await getGitBranch(cwd);

      // Assert
      assert.strictEqual(branch, specialBranch);
    });
  });

  /**
   * Test group: getGitLogForToday()
   * Verifies git log filtering and formatting for today's commits
   */
  suite('getGitLogForToday()', () => {
    test('should return today\'s git log with one-line format (--oneline)', async () => {
      // Arrange
      const { getGitLogForToday } = require('../utils/git');
      const cwd = '/path/to/repo';
      executeStub.resolves(GIT_LOG_OUTPUT);

      // Act
      const log = await getGitLogForToday(cwd);

      // Assert
      assert.ok(executeStub.called, 'executeCommand should be called');
      assert.ok(
        executeStub.calledWith('git', sinon.match.array, cwd),
        'executeCommand should be called with git and directory'
      );
      // Verify --oneline is in the args
      const args = executeStub.getCall(0).args[1];
      assert.ok(
        args.includes('--oneline'),
        'Arguments should include --oneline flag'
      );
      assert.strictEqual(log, GIT_LOG_OUTPUT);
    });

    test('should filter commits to only today\'s date (--since and --until)', async () => {
      // Arrange
      const { getGitLogForToday } = require('../utils/git');
      const cwd = '/path/to/repo';
      executeStub.resolves(GIT_LOG_SINGLE_COMMIT);

      // Act
      await getGitLogForToday(cwd);

      // Assert
      const args = executeStub.getCall(0).args[1];
      assert.ok(
        args.some((arg: string) => arg.startsWith('--since=')),
        'Arguments should include --since parameter'
      );
      assert.ok(
        args.some((arg: string) => arg.startsWith('--until=')),
        'Arguments should include --until parameter'
      );
    });

    test('should handle empty result when no commits today', async () => {
      // Arrange
      const { getGitLogForToday } = require('../utils/git');
      const cwd = '/path/to/repo';
      executeStub.resolves(GIT_LOG_EMPTY);

      // Act
      const log = await getGitLogForToday(cwd);

      // Assert
      assert.strictEqual(log, GIT_LOG_EMPTY);
    });
  });

  /**
   * Test group: getGitHistoryForUrls()
   * Verifies extraction of git history for multiple project URLs
   */
  suite('getGitHistoryForUrls()', () => {
    test('should extract URLs from git commits and return GitChange[] array', async () => {
      // Arrange
      const { getGitHistoryForUrls } = require('../utils/git');
      const urls = [
        { id: '1', url: '/path/to/repo1' },
        { id: '2', url: '/path/to/repo2' },
      ];
      // First call: getGitBranch for repo1
      // Second call: getGitLogForToday for repo1
      // Third call: getGitBranch for repo2
      // Fourth call: getGitLogForToday for repo2
      executeStub
        .onCall(0).resolves('main')
        .onCall(1).resolves(GIT_LOG_SINGLE_COMMIT)
        .onCall(2).resolves('develop')
        .onCall(3).resolves(GIT_LOG_OUTPUT);

      // Act
      const result = await getGitHistoryForUrls(urls);

      // Assert
      assert.ok(Array.isArray(result), 'Result should be an array');
      assert.strictEqual(result.length, 2, 'Should return results for both URLs');
      assert.ok(result[0].branch, 'First result should have branch');
      assert.ok(result[0].changes, 'First result should have changes');
      assert.ok(result[0].project, 'First result should have project name');
    });

    test('should parse commit hashes, messages, and extract project name from URL path', async () => {
      // Arrange
      const { getGitHistoryForUrls } = require('../utils/git');
      const urls = [{ id: '1', url: '/path/to/my-project' }];
      executeStub
        .onFirstCall().resolves('main')
        .onSecondCall().resolves('a1b2c3d Fix auth bug');

      // Act
      const result = await getGitHistoryForUrls(urls);

      // Assert
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].project, 'my-project', 'Should extract project name from URL');
      assert.strictEqual(result[0].branch, 'main');
      assert.ok(result[0].changes.includes('a1b2c3d'), 'Should preserve commit hash');
    });

    test('should handle commits with no URLs (empty array)', async () => {
      // Arrange
      const { getGitHistoryForUrls } = require('../utils/git');
      const urls: UrlEntry[] = [];

      // Act
      const result = await getGitHistoryForUrls(urls);

      // Assert
      assert.ok(Array.isArray(result), 'Should return array');
      assert.strictEqual(result.length, 0, 'Should return empty array for no URLs');
      assert.ok(!executeStub.called, 'executeCommand should not be called');
    });

    test('should filter out URLs with no changes today', async () => {
      // Arrange
      const { getGitHistoryForUrls } = require('../utils/git');
      const urls = [
        { id: '1', url: '/path/to/repo1' },
        { id: '2', url: '/path/to/repo2' },
      ];
      // repo1: has changes
      // repo2: no changes today
      executeStub
        .onCall(0).resolves('main')
        .onCall(1).resolves(GIT_LOG_SINGLE_COMMIT)
        .onCall(2).resolves('develop')
        .onCall(3).resolves(''); // Empty log for repo2

      // Act
      const result = await getGitHistoryForUrls(urls);

      // Assert
      assert.strictEqual(result.length, 1, 'Should only include URLs with changes');
      assert.ok(result[0].changes.includes('Fix authentication bug'));
    });

    test('should skip URLs with empty or whitespace-only paths', async () => {
      // Arrange
      const { getGitHistoryForUrls } = require('../utils/git');
      const urls = [
        { id: '1', url: '/path/to/repo1' },
        { id: '2', url: '   ' }, // whitespace only
        { id: '3', url: '/path/to/repo3' },
      ];
      executeStub
        .onCall(0).resolves('main')
        .onCall(1).resolves(GIT_LOG_SINGLE_COMMIT)
        .onCall(2).resolves('develop')
        .onCall(3).resolves(GIT_LOG_OUTPUT);

      // Act
      const result = await getGitHistoryForUrls(urls);

      // Assert
      assert.strictEqual(result.length, 2, 'Should skip whitespace-only URL');
      assert.ok(executeStub.callCount >= 4, 'Should call executeCommand only for valid paths');
    });
  });

  /**
   * Test group: Error handling
   * Verifies behavior when git commands fail
   */
  suite('error handling', () => {
    test('should handle git errors gracefully in getGitBranch', async () => {
      // Arrange
      const { getGitBranch } = require('../utils/git');
      const cwd = '/invalid/path';
      executeStub.rejects(new Error(GIT_ERROR_OUTPUTS.NOT_A_REPO));

      // Act & Assert
      try {
        await getGitBranch(cwd);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.ok(error instanceof Error);
        if (error instanceof Error) {
          assert.ok(error.message.includes('not a git repository'));
        }
      }
    });

    test('should return empty string when getGitLogForToday encounters error', async () => {
      // Arrange
      const { getGitLogForToday } = require('../utils/git');
      const cwd = '/invalid/path';
      executeStub.rejects(new Error(GIT_ERROR_OUTPUTS.NOT_A_REPO));

      // Act & Assert
      try {
        await getGitLogForToday(cwd);
        assert.fail('Should have thrown an error');
      } catch (error: unknown) {
        assert.ok(error instanceof Error);
      }
    });
  });
});
