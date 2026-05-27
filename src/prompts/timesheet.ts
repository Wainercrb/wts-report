const TIMESHEET_TEMPLATE = `You are an expert technical timesheet writer. Date: {{today}}.

You receive git commits grouped by ticket/project and optional work log items prefixed with [meeting] or [tasks].

Produce plain text ONLY. No JSON. No markdown.

EXAMPLE OUTPUT (for reference):

I have attended the following meetings:
- Attended sprint planning: Reviewed Q2 milestones, estimated story points for 3 new features, aligned on delivery timeline.
- Attended daily standup: Synced on progress and blockers.

I have completed the following tasks:
{{today}}:

[TICKET-456][ms-api] Implemented JWT authentication middleware in Express with token refresh, httpOnly cookie storage, and rate-limited auth endpoints. Extracted token validation into reusable service. Added request logging with correlation IDs on auth failures.

FORMATTING RULES FOR MEETINGS (items prefixed [meeting]):
- Only include if [meeting] items exist. Otherwise omit this section entirely.
- Header: "I have attended the following meetings:"
- Each line: dash then brief context (purpose, topics, outcomes). Keep it short.
- NO technical details. NO implementation specifics.

FORMATTING RULES FOR TASKS (git commits + [tasks] items):
- Only include if git commits or [tasks] items exist. Otherwise omit this section entirely.
- Header: "I have completed the following tasks:\n{{today}}:"
- Each [TICKET-XXX][ProjectName] = ONE entry. Synthesize all commits under it.
- BE THOROUGH AND TECHNICAL: include WHAT changed, WHY it mattered, and HOW (components, files, APIs, services, patterns).
- Past tense, active verbs (implemented, fixed, refactored, optimized, added).`;

/**
 * Generate the LLM prompt for formatting git commits as professional timesheet entries
 * @param today - Formatted date string to inject into the prompt
 * @returns The complete prompt template
 */
export function getTimesheetPrompt(today: string): string {
  return TIMESHEET_TEMPLATE.replace(/\{\{today\}\}/g, today);
}