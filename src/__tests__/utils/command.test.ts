import * as sinon from 'sinon';
import { EventEmitter } from 'events';
import { executeCommand } from '../../utils/command';
import { createTestSandbox, assert } from '../setup';

/**
 * Type-safe mock process for testing spawn behavior
 */
interface MockChildProcess {
  stdout: EventEmitter;
  stderr: EventEmitter;
  on: sinon.SinonStub;
}

/**
 * Test suite for src/utils/command.ts
 * Tests command execution, spawn mocking, and process stream handling
 */
describe('utils/command.ts', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = createTestSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('executeCommand()', () => {
    /**
     * Test group: Successful command execution
     * Verifies stdout capture, multi-line output handling, and stderr separation
     */
    describe('successful execution', () => {
      it('should execute a command and resolve with stdout when exit code is 0', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(0));
            } else if (event === 'error') {
              // Will not be called for this test
            }
            return mockProcess;
          }),
        };

        const spawnStub = sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as any);

        // Act
        const result = executeCommand('git', ['branch']);

        // Emit stdout data
        mockProcess.stdout.emit('data', Buffer.from('main'));

        // Assert
        const output = await result;
        assert.strictEqual(output, 'main');
        assert.ok(spawnStub.calledWith('git', ['branch']));
      });

      it('should handle multi-line stdout output correctly', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(0));
            }
            return mockProcess;
          }),
        };

        sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as any);

        // Act
        const result = executeCommand('git', ['log', '--oneline']);

        // Emit multiple lines of stdout
        mockProcess.stdout.emit('data', Buffer.from('abc1234 Fix auth bug\n'));
        mockProcess.stdout.emit('data', Buffer.from('def5678 Add tests\n'));
        mockProcess.stdout.emit('data', Buffer.from('ghi9012 Refactor utils'));

        // Assert
        const output = await result;
        assert.strictEqual(output, 'abc1234 Fix auth bug\ndef5678 Add tests\nghi9012 Refactor utils');
        assert.ok(output.includes('Fix auth bug'));
        assert.ok(output.includes('Add tests'));
        assert.ok(output.includes('Refactor utils'));
      });

      it('should buffer stdout from multiple data events correctly', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(0));
            }
            return mockProcess;
          }),
        };

        sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as any);

        // Act
        const result = executeCommand('dir', []);

        // Emit data in chunks (simulating streaming)
        mockProcess.stdout.emit('data', Buffer.from('Directory of C:\\'));
        mockProcess.stdout.emit('data', Buffer.from('Projects\n'));
        mockProcess.stdout.emit('data', Buffer.from('05/19/2026  10:30    <DIR>          src'));

        // Assert
        const output = await result;
        assert.strictEqual(output, 'Directory of C:\\Projects\n05/19/2026  10:30    <DIR>          src');
        assert.ok(output.length > 0);
      });

      it('should capture stderr separately and not include it in stdout', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(0)); // Success exit code
            }
            return mockProcess;
          }),
        };

        sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as any);

        // Act
        const result = executeCommand('git', ['status']);

        // Emit both stdout and stderr
        mockProcess.stdout.emit('data', Buffer.from('On branch main'));
        mockProcess.stderr.emit('data', Buffer.from('Warning: deprecated option'));

        // Assert
        const output = await result;
        assert.strictEqual(output, 'On branch main');
        assert.ok(!output.includes('Warning'));
        assert.ok(!output.includes('deprecated'));
      });
    });

    /**
     * Test group: Error handling and failure scenarios
     * Verifies stderr resolution on non-zero exit codes and spawn errors
     */
    describe('error handling', () => {
      it('should resolve with error message when exit code is non-zero and stderr exists', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(1)); // Non-zero exit code
            }
            return mockProcess;
          }),
        };

        sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as any);

        // Act
        const result = executeCommand('git', ['invalid-command']);

        // Emit error output
        mockProcess.stderr.emit('data', Buffer.from('fatal: invalid command'));

        // Assert
        const output = await result;
        assert.strictEqual(output, 'fatal: invalid command');
        assert.ok(output.includes('fatal'));
      });

      it('should resolve with stderr when exit code is non-zero', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(127)); // Command not found
            }
            return mockProcess;
          }),
        };

        sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as MockChildProcess);

        // Act
        const result = executeCommand('nonexistent-cmd', []);

        // Emit stderr data
        mockProcess.stderr.emit('data', Buffer.from('command not found'));

        // Assert
        const output = await result;
        assert.strictEqual(output, 'command not found');
      });

      it('should resolve with error message when spawn emits error event', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub(),
        };
        const testError = new Error('ENOENT: no such file or directory');

        mockProcess.on = sandbox.stub().callsFake((event: string, handler: Function) => {
          if (event === 'error') {
            process.nextTick(() => handler(testError));
          }
          return mockProcess;
        });

        sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as any);

        // Act
        const result = executeCommand('bad-command', []);

        // Assert
        const output = await result;
        assert.strictEqual(output, 'ENOENT: no such file or directory');
        assert.ok(output.includes('no such file'));
      });
    });

    /**
     * Test group: Edge cases and special scenarios
     * Verifies empty output, special characters in args, and failure recovery
     */
    describe('edge cases', () => {
      it('should handle empty stdout and resolve with empty string', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(0));
            }
            return mockProcess;
          }),
        };

        sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as MockChildProcess);

        // Act
        const result = executeCommand('echo', []);

        // Emit no data, just close event
        // (mockProcess.stdout as EventEmitter).emit('data', Buffer.from('')); // No data emitted

        // Assert
        const output = await result;
        assert.strictEqual(output, '');
        assert.strictEqual(output.length, 0);
      });

      it('should handle commands with special characters in arguments', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(0));
            }
            return mockProcess;
          }),
        };
        const spawnStub = sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as any);

        // Act
        const specialArgs = ['log', '--grep=fix (bug)', '--author=John Doe'];
        const result = executeCommand('git', specialArgs);

        mockProcess.stdout.emit('data', Buffer.from('commit 123abc'));

        // Assert
        const output = await result;
        assert.strictEqual(output, 'commit 123abc');
        assert.ok(spawnStub.calledWith('git', specialArgs));
      });

      it('should pass correct command and cwd to spawn', async () => {
        // Arrange
        const mockProcess: MockChildProcess = {
          stdout: new EventEmitter(),
          stderr: new EventEmitter(),
          on: sandbox.stub().callsFake((event: string, handler: Function) => {
            if (event === 'close') {
              process.nextTick(() => handler(0));
            }
            return mockProcess;
          }),
        };
        const spawnStub = sandbox.stub(require('child_process'), 'spawn').returns(mockProcess as any);

        // Act
        const cwd = 'C:\\projects\\myrepo';
        const result = executeCommand('git', ['status'], cwd);

        mockProcess.stdout.emit('data', Buffer.from('On branch main'));

        // Assert
        const output = await result;
        assert.strictEqual(output, 'On branch main');
        // Verify spawn was called with correct args including cwd in options
        const spawnCall = spawnStub.getCall(0);
        assert.strictEqual(spawnCall.args[0], 'git');
        assert.deepStrictEqual(spawnCall.args[1], ['status']);
        assert.strictEqual(spawnCall.args[2]?.cwd, cwd);
        assert.strictEqual(spawnCall.args[2]?.windowsHide, true);
      });
    });
  });
});
