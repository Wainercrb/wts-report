import * as sinon from 'sinon';
import * as assert from 'assert';

/**
 * Create a fresh Sinon sandbox for test isolation
 * Usage in beforeEach:
 * ```
 * let sandbox: sinon.SinonSandbox;
 * beforeEach(() => {
 *   sandbox = createTestSandbox();
 * });
 * afterEach(() => {
 *   sandbox.restore();
 * });
 * ```
 */
export function createTestSandbox(): sinon.SinonSandbox {
  return sinon.createSandbox();
}

/**
 * Export assert for easy import in tests
 * Usage: import { assert } from '../setup';
 */
export { assert };

/**
 * Helper to verify a stub was called with specific arguments
 * Usage: assertCalledWith(stub, expectedArg);
 */
export function assertCalledWith(
  stub: sinon.SinonStub | sinon.SinonSpy,
  ...expectedArgs: unknown[]
): void {
  assert.ok(
    stub.calledWith(...expectedArgs),
    `Expected stub to be called with ${JSON.stringify(expectedArgs)}`
  );
}

/**
 * Helper to get all calls made to a stub
 * Usage: const calls = getAllCalls(stub);
 */
export function getAllCalls(
  stub: sinon.SinonStub | sinon.SinonSpy
): sinon.SinonSpyCall[] {
  return stub.getCalls();
}

/**
 * Helper to verify a stub was called exactly N times
 * Usage: assertCallCount(stub, 3);
 */
export function assertCallCount(
  stub: sinon.SinonStub | sinon.SinonSpy,
  count: number
): void {
  assert.strictEqual(
    stub.callCount,
    count,
    `Expected ${count} calls, got ${stub.callCount}`
  );
}

/**
 * Simple expect-like helper for common Sinon assertions
 * This provides a familiar API for test assertions without relying on Chai
 */
export class StubAssertions<T extends sinon.SinonStub | sinon.SinonSpy> {
  constructor(private stub: T) {}

  calledWith(...args: unknown[]): this {
    assertCalledWith(this.stub, ...args);
    return this;
  }

  callCount(expected: number): this {
    assertCallCount(this.stub, expected);
    return this;
  }

  called(): this {
    assert.ok(this.stub.called, 'Expected stub to be called');
    return this;
  }

  notCalled(): this {
    assert.ok(!this.stub.called, 'Expected stub not to be called');
    return this;
  }

  calledOnce(): this {
    assert.strictEqual(this.stub.callCount, 1, 'Expected stub to be called once');
    return this;
  }

  calledTwice(): this {
    assert.strictEqual(this.stub.callCount, 2, 'Expected stub to be called twice');
    return this;
  }
}

export function expectStub<T extends sinon.SinonStub | sinon.SinonSpy>(
  stub: T
): StubAssertions<T> {
  return new StubAssertions(stub);
}

/**
 * Reset all global stubs and mocks
 * Call in afterEach() to ensure clean state
 */
export function resetAllMocks(): void {
  // Placeholder for global mock reset if needed
}
