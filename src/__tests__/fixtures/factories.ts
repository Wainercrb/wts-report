import { GitChange, UrlEntry, WebviewMessage, ILogger } from '../../types';
import * as sinon from 'sinon';

/**
 * Factory function to create a GitChange object with defaults
 * Useful for testing git history features
 *
 * @param overrides Optional properties to override defaults
 * @returns GitChange object with sensible defaults
 *
 * @example
 * const change = createGitChange({ branch: 'develop' });
 * expect(change.project).to.equal('wts-report');
 * expect(change.branch).to.equal('develop');
 */
export function createGitChange(
  overrides?: Partial<GitChange>
): GitChange {
  return {
    branch: 'main',
    project: 'wts-report',
    changes: 'Sample commit message',
    ...overrides,
  };
}

/**
 * Factory function to create an array of GitChange objects
 * Useful for testing batch operations
 *
 * @param count Number of GitChange objects to create
 * @param baseOverrides Overrides applied to all objects
 * @returns Array of GitChange objects
 *
 * @example
 * const changes = createGitChangeArray(3, { branch: 'develop' });
 * expect(changes).to.have.length(3);
 * expect(changes[0].branch).to.equal('develop');
 */
export function createGitChangeArray(
  count: number,
  baseOverrides?: Partial<GitChange>
): GitChange[] {
  return Array.from({ length: count }, (_, i) =>
    createGitChange({
      project: `project-${i}`,
      branch: `branch-${i}`,
      ...baseOverrides,
    })
  );
}

/**
 * Factory function to create a WebviewMessage object
 * Used for testing message routing between extension and UI
 *
 * @param command Command identifier (e.g., 'showInformationMessage')
 * @param data Optional additional data properties
 * @returns WebviewMessage object
 *
 * @example
 * const msg = createWebviewMessage('getDirectoryInfo', { path: '/home/user' });
 * expect(msg.command).to.equal('getDirectoryInfo');
 * expect(msg.path).to.equal('/home/user');
 */
export function createWebviewMessage(
  command: string,
  data?: Record<string, unknown>
): Record<string, unknown> {
  return { command, ...data };
}

/**
 * Factory function to create a URL item object
 * Used for testing URL extraction and git history checking
 *
 * @param id Project identifier
 * @param url Project URL (filesystem path or git URL)
 * @returns URL item object
 *
 * @example
 * const urlItem = createUrlItem('proj1', 'C:\\projects\\repo');
 * expect(urlItem.id).to.equal('proj1');
 */
export function createUrlItem(
  id: string = 'proj1',
  url: string = 'C:\\projects\\repo1'
): { id: string; url: string } {
  return { id, url };
}

/**
 * Factory function to create an array of URL items
 * Useful for testing batch URL processing
 *
 * @param count Number of items to create
 * @param baseOverrides Overrides applied to all items
 * @returns Array of URL items
 *
 * @example
 * const urls = createUrlItemArray(3);
 * expect(urls).to.have.length(3);
 * expect(urls[0].id).to.equal('proj1');
 */
export function createUrlItemArray(
  count: number,
  baseOverrides?: Partial<UrlEntry>
): UrlEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `proj${i}`,
    url: `C:\\projects\\repo${i}`,
    ...baseOverrides,
  }));
}

/**
 * Factory function to create a mock Logger object
 * Useful for testing logging behavior without side effects
 *
 * @param sandbox Optional Sinon sandbox for spy/stub creation
 * @returns Partial ILogger object with stubbed methods
 *
 * @example
 * const logger = createMockLogger(sandbox);
 * handler.log(['message1', 'message2']);
 * expect(logger.log).to.be.called;
 */
export function createMockLogger(
  sandbox?: sinon.SinonSandbox
): Partial<ILogger> {
  const log = sandbox ? sandbox.stub() : sinon.stub();

  return {
    log,
  };
}

/**
 * Factory function to create a WebviewMessage with form values (manual entry)
 * Used for testing form submission flow
 *
 * @param values Form data values
 * @returns WebviewMessage with command 'manualTimesheetReport'
 *
 * @example
 * const msg = createFormValuesMessage({ project: 'wts-report' });
 * expect(msg.command).to.equal('manualTimesheetReport');
 * expect(msg.values).to.deep.equal({ project: 'wts-report' });
 */
export function createFormValuesMessage(
  values: Record<string, unknown>
): WebviewMessage {
  return {
    command: 'manualTimesheetReport',
    values,
  };
}

/**
 * Factory function to create a WebviewMessage for auto (git) history check
 * Used for testing git history feature from the UI
 *
 * @param urls Array of URL items with id and url
 * @returns WebviewMessage with command 'automaticTimesheetReport'
 *
 * @example
 * const urls = [{ id: 'proj1', url: 'C:\\projects\\repo1' }];
 * const msg = createCheckGitHistoryMessage(urls);
 * expect(msg.command).to.equal('automaticTimesheetReport');
 * expect(msg.urls).to.deep.equal([{ id: 'proj1', url: 'C:\\projects\\repo1' }]);
 */
export function createCheckGitHistoryMessage(
  urls: UrlEntry[]
): WebviewMessage {
  return {
    command: 'automaticTimesheetReport',
    urls,
  };
}

/**
 * Factory function to create an info alert message (show info)
 * Used for testing notification flow
 *
 * @param text Message text to display
 * @returns WebviewMessage with command 'infoAlert'
 *
 * @example
 * const msg = createShowInfoMessage('Operation completed successfully');
 * expect(msg.text).to.equal('Operation completed successfully');
 */
export function createShowInfoMessage(text: string): WebviewMessage {
  return {
    command: 'infoAlert',
    text,
  };
}
