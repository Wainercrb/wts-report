/**
 * Test suite for src/prompts/*.ts
 * Tests prompt generation functions
 */

import { assert } from '../__tests__/setup';

// Module-level variable for getTimesheetPrompt
let getTimesheetPrompt: (today: string) => string;

// Load the prompts module
try {
  const promptsModule = require('../prompts');
  getTimesheetPrompt = promptsModule.getTimesheetPrompt;
} catch (e) {
  console.error('Failed to require prompts:', e);
}

// Test suite
suite('prompts/timesheet.ts', () => {
  test('should generate prompt with date placeholder', () => {
    const result = getTimesheetPrompt('Thu, 22 May 2026');
    assert.ok(result.includes('Thu, 22 May 2026'));
  });

  test('should generate prompt with timesheet rules', () => {
    const result = getTimesheetPrompt('test-date');
    assert.ok(result.includes('RULES:'));
    assert.ok(result.includes('[TICKET-XXX][ProjectName]'));
  });

  test('should include stored-item merge instruction when stored items present', () => {
    const result = getTimesheetPrompt('test-date');
    assert.ok(
      result.includes('work log items'),
      'Prompt should reference work log items'
    );
    assert.ok(
      result.includes('[meeting]') || result.includes('SECTION 1 — Meetings'),
      'Prompt should instruct LLM to handle meeting items'
    );
    assert.ok(
      result.includes('[meeting]') || result.includes('[tasks]'),
      'Prompt should reference stored item type prefixes'
    );
  });
});
