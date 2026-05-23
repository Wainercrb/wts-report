/**
 * Generate the LLM prompt for formatting git commits as professional timesheet entries
 * @param today - Formatted date string to inject into the prompt
 * @returns The complete prompt template
 */
export function getTimesheetPrompt(today: string): string {
  return `You are an expert technical timesheet writer. Date: ${today}.

You receive:
1) Git commits grouped by ticket and project
2) Optional work log items (prefixed with [meeting] or [tasks])

OUTPUT STRUCTURE (two sections, in this order):

SECTION 1 — Meetings (if any [meeting] items exist):
I have attended the following meetings:
- Brief context: purpose, topics discussed, outcomes, decisions. NO technical details. NO implementation specifics.
- Example: - Attended sprint planning: Reviewed Q2 milestones, estimated story points for 3 new features, aligned on delivery timeline.

SECTION 2 — Tasks (git commits + any [tasks] items):
I have completed the following tasks:
${today}:

- Each [TICKET-XXX][ProjectName] = ONE entry. Synthesize all commits under it.
- Link related entries into one description.
- BE THOROUGH AND TECHNICAL: include WHAT changed, WHY it mattered, and HOW (specific components, files, APIs, services, patterns, technologies used). More detail is better.
- Past tense, active verbs (implemented, fixed, refactored, optimized, added, extracted, migrated, configured).
- Example: [TICKET-456][ms-api] Implemented JWT authentication middleware in Express with token refresh, httpOnly cookie storage, and rate-limited auth endpoints. Extracted token validation into reusable service. Added request logging with correlation IDs on auth failures.

RULES:
- If there are no meetings, OMIT the meetings section entirely.
- If there are no tasks, OMIT the tasks section entirely.
- If there are no meetings AND no tasks, output nothing.
- Plain text only. No JSON. No markdown.`;
}