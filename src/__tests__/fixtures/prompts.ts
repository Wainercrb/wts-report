/**
 * Sample LLM request/response pairs for testing
 * These represent realistic timesheet and work log prompt scenarios
 */

/**
 * Sample timesheet prompt request to GPT-4o
 * This is sent to the LLM to format git changes into a timesheet
 */
export const TIMESHEET_PROMPT_SAMPLE = `Based on the following git changes, create a structured timesheet summary:

Branch: main
Project: wts-report
Changes: a1b2c3d Fix authentication bug
e4f5g6h Add comprehensive test coverage
i7j8k9l Refactor utility functions

Please format the response as:
- Task Description: <description>
  Time Estimate: <time>
  Status: <status>`;

/**
 * Sample timesheet response from LLM
 * This represents what we expect back from GPT-4o
 */
export const TIMESHEET_RESPONSE_SAMPLE = `Based on your git commits today, here's your timesheet summary:

**Project: wts-report**

- Fix authentication bug
  Time Estimate: 2 hours
  Status: Completed

- Add comprehensive test coverage
  Time Estimate: 3 hours
  Status: Completed

- Refactor utility functions
  Time Estimate: 1.5 hours
  Status: Completed

**Total Time**: 6.5 hours`;

/**
 * Sample work log prompt request
 * This requests JSON-formatted work log data
 */
export const WORK_LOG_PROMPT_SAMPLE = `Convert these git commits into a JSON work log format:

Commits:
- a1b2c3d Fix authentication bug
- e4f5g6h Add comprehensive test coverage

Return JSON with structure: { date: string, tickets: Array<{ id: string, description: string, time: string }> }`;

/**
 * Sample work log response from LLM
 * JSON-formatted response for programmatic processing
 */
export const WORK_LOG_RESPONSE_SAMPLE = JSON.stringify({
  date: '2026-05-19',
  tickets: [
    {
      id: 'TICKET-001',
      description: 'Fix authentication bug',
      time: '2 hours',
    },
    {
      id: 'TICKET-002',
      description: 'Add comprehensive test coverage',
      time: '3 hours',
    },
  ],
});

/**
 * Fallback message when no commits found
 */
export const NO_COMMITS_FALLBACK = `No git commits found for today.`;

/**
 * LLM error response
 */
export const LLM_ERROR_RESPONSE = `Error: Unable to process request. Please try again.`;

/**
 * Multi-project prompt sample
 * When checking multiple repositories
 */
export const MULTI_PROJECT_PROMPT_SAMPLE = `Summarize work across these projects:

Project 1 (wts-report):
  Commits: a1b2c3d, e4f5g6h

Project 2 (frontend):
  Commits: i7j8k9l, m0n1o2p

Project 3 (backend):
  Commits: q1r2s3t

Create a consolidated daily report.`;

/**
 * Multi-project response sample
 */
export const MULTI_PROJECT_RESPONSE_SAMPLE = `## Daily Work Summary

### Project: wts-report
- Fix authentication bug (2h)
- Add comprehensive test coverage (3h)

### Project: frontend
- Refactor utility functions (1.5h)
- Update documentation (0.5h)

### Project: backend
- Deploy database migration (1h)

**Total**: 8 hours across 3 projects`;

/**
 * Empty/null LLM response (model not available)
 */
export const EMPTY_LLM_RESPONSE = '';

/**
 * Sample prompt with formatting instructions
 */
export const FORMATTED_PROMPT_SAMPLE = `Format this data as markdown:

- Branch: main
- Commits: 3
- Time: 6.5 hours
- Status: In Progress

Include: branch name, commit count, estimated time, and status.`;

/**
 * Sample response with markdown formatting
 */
export const FORMATTED_RESPONSE_SAMPLE = `# Daily Report

**Branch**: main
**Commits**: 3
**Time Spent**: 6.5 hours
**Status**: In Progress

---

Tasks completed:
1. Fix authentication bug
2. Add comprehensive test coverage
3. Refactor utility functions`;
