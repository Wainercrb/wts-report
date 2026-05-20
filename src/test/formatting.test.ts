import { assert } from '../__tests__/setup';
import {
  getFormattedDate,
  getDateRange,
  formatGitChanges,
} from '../utils/formatting';
import { createGitChange, createGitChangeArray } from '../__tests__/fixtures';

/**
 * Test suite for src/utils/formatting.ts
 * Tests formatting utilities for dates, date ranges, and git changes
 */
suite('utils/formatting.ts', () => {
  /**
   * Test suite for getFormattedDate()
   * Verifies date formatting in GB locale with weekday, day, month, year
   */
  suite('getFormattedDate()', () => {
    test('should format current date in GB locale (e.g., "Mon, 19 May 2026")', () => {
      // Arrange
      const result = getFormattedDate();

      // Act & Assert
      // Verify format: "Day, DD Month YYYY" (e.g., "Mon, 19 May 2026")
      assert.match(result, /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4}$/);
      assert.ok(result.length > 0);
    });

    test('should return a string matching the GB locale format with weekday', () => {
      // Arrange
      const result = getFormattedDate();

      // Act & Assert
      // Ensure it contains a weekday abbreviation (Mon, Tue, Wed, etc.)
      const validWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const hasValidWeekday = validWeekdays.some((day) => result.includes(day));
      assert.ok(hasValidWeekday);
    });

    test('should include day, month, and year components', () => {
      // Arrange
      const result = getFormattedDate();

      // Act & Assert
      // Verify the result contains at least a digit (day), a month name, and a 4-digit year
      assert.match(result, /\d{2}/); // Day: 2 digits
      assert.match(result, /[A-Za-z]{3}/); // Month: 3-letter abbreviation
      assert.match(result, /\d{4}/); // Year: 4 digits
    });

    test('should format today\'s date correctly', () => {
      // Arrange
      const result = getFormattedDate();
      const now = new Date();
      const expectedYear = now.getFullYear().toString();

      // Act & Assert
      // Verify the year in the formatted string matches the current year
      assert.ok(result.includes(expectedYear));
    });

    test('should produce consistent format across multiple calls', () => {
      // Arrange
      const result1 = getFormattedDate();
      const result2 = getFormattedDate();

      // Act & Assert
      // Both results should match the same format pattern
      assert.match(result1, /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4}$/);
      assert.match(result2, /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4}$/);
    });
  });

  /**
   * Test suite for getDateRange()
   * Verifies date range generation for today (midnight to end of day)
   */
  suite('getDateRange()', () => {
    test('should return an object with "since" and "until" properties', () => {
      // Arrange
      const result = getDateRange();

      // Act & Assert
      assert.ok(typeof result.since === 'string');
      assert.ok(typeof result.until === 'string');
    });

    test('should return timestamps in "YYYY-MM-DD HH:mm:ss" format', () => {
      // Arrange
      const result = getDateRange();

      // Act & Assert
      // Verify since and until match the expected timestamp format
      assert.match(result.since, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      assert.match(result.until, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('should set "since" to midnight (00:00:00) of today', () => {
      // Arrange
      const result = getDateRange();

      // Act & Assert
      // Verify since ends with 00:00:00
      assert.ok(result.since.includes(' 00:00:00'));
    });

    test('should set "until" to end of day (23:59:59)', () => {
      // Arrange
      const result = getDateRange();

      // Act & Assert
      // Verify until ends with 23:59:59
      assert.ok(result.until.includes(' 23:59:59'));
    });

    test('should use the same date for both since and until (same day)', () => {
      // Arrange
      const result = getDateRange();

      // Act & Assert
      // Extract the date part (YYYY-MM-DD) from both since and until
      const sinceDatePart = result.since.split(' ')[0];
      const untilDatePart = result.until.split(' ')[0];
      assert.strictEqual(sinceDatePart, untilDatePart);
    });

    test('should use today\'s date in the returned range', () => {
      // Arrange
      const result = getDateRange();
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const expectedDate = `${year}-${month}-${day}`;

      // Act & Assert
      // Verify the returned date matches today
      assert.ok(result.since.includes(expectedDate));
      assert.ok(result.until.includes(expectedDate));
    });

    test('should have since occurring before until chronologically', () => {
      // Arrange
      const result = getDateRange();
      const sinceTime = new Date(`${result.since.replace(' ', 'T')}`).getTime();
      const untilTime = new Date(`${result.until.replace(' ', 'T')}`).getTime();

      // Act & Assert
      assert.ok(sinceTime < untilTime);
    });
  });

  /**
   * Test suite for formatGitChanges()
   * Verifies formatting of GitChange objects into display strings
   */
  suite('formatGitChanges()', () => {
    test('should format an array of GitChange objects with branch, project, and changes', () => {
      // Arrange
      const changes = [
        createGitChange({
          branch: 'main',
          project: 'wts-report',
          changes: 'feat: add formatting utilities',
        }),
      ];

      // Act
      const result = formatGitChanges(changes);

      // Assert
      assert.ok(result.includes('[main]'));
      assert.ok(result.includes('[wts-report]'));
      assert.ok(result.includes('feat: add formatting utilities'));
    });

    test('should separate multiple changes with double newline', () => {
      // Arrange
      const changes = createGitChangeArray(2, { branch: 'develop' });

      // Act
      const result = formatGitChanges(changes);

      // Assert
      // Verify multiple changes are separated by \n\n
      assert.ok(result.includes('\n\n'));
    });

    test('should handle empty array by returning empty string', () => {
      // Arrange
      const changes: ReturnType<typeof createGitChange>[] = [];

      // Act
      const result = formatGitChanges(changes);

      // Assert
      assert.strictEqual(result, '');
    });

    test('should format realistic git changes with detailed commit information', () => {
      // Arrange
      const changes = [
        createGitChange({
          branch: 'feature/add-tests',
          project: 'wts-report',
          changes: 'test: add comprehensive test suite for utilities',
        }),
        createGitChange({
          branch: 'bugfix/fix-date-format',
          project: 'wts-report',
          changes: 'fix: correct date formatting in GB locale',
        }),
      ];

      // Act
      const result = formatGitChanges(changes);

      // Assert
      assert.ok(result.includes('[feature/add-tests]'));
      assert.ok(result.includes('[bugfix/fix-date-format]'));
      assert.ok(result.includes('[wts-report]'));
      assert.ok(result.includes('test: add comprehensive test suite for utilities'));
      assert.ok(result.includes('fix: correct date formatting in GB locale'));
      // Verify both changes are present and separated by \n\n
      assert.ok(result.includes('\n\n'));
    });

    test('should preserve multiline commit messages in formatted output', () => {
      // Arrange
      const multilineMessage =
        'feat: implement date range filtering\n\n- Added getDateRange() utility\n- Integrated with git filtering\n- Added test coverage';
      const changes = [
        createGitChange({
          branch: 'main',
          project: 'wts-report',
          changes: multilineMessage,
        }),
      ];

      // Act
      const result = formatGitChanges(changes);

      // Assert
      assert.ok(result.includes(multilineMessage));
      assert.ok(result.includes('[main][wts-report]'));
    });

    test('should handle special characters in branch names and project names', () => {
      // Arrange
      const changes = [
        createGitChange({
          branch: 'feature/WTS-123-add-utils',
          project: 'wts-report-v2.0',
          changes: 'test: add utilities',
        }),
      ];

      // Act
      const result = formatGitChanges(changes);

      // Assert
      assert.ok(result.includes('[feature/WTS-123-add-utils]'));
      assert.ok(result.includes('[wts-report-v2.0]'));
    });

    test('should format changes consistently regardless of array order', () => {
      // Arrange
      const change1 = createGitChange({
        branch: 'main',
        project: 'project-a',
        changes: 'commit 1',
      });
      const change2 = createGitChange({
        branch: 'develop',
        project: 'project-b',
        changes: 'commit 2',
      });

      // Act
      const result1 = formatGitChanges([change1, change2]);
      const result2 = formatGitChanges([change2, change1]);

      // Assert
      // Each should maintain its order
      assert.ok(result1.includes('[main][project-a]commit 1'));
      assert.ok(result2.includes('[develop][project-b]commit 2'));
      assert.notStrictEqual(result1, result2);
    });
  });
});
