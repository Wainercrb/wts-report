/**
 * Generate the LLM prompt for formatting git commits as professional timesheet entries
 * @param today - Formatted date string to inject into the prompt
 * @returns The complete prompt template
 */
export function getTimesheetPrompt(today: string): string {
  return `You are an expert technical timesheet writer. I will provide git commits grouped by ticket and project. Transform each group into ONE professional timesheet entry. Date: ${today}.

RULES:
- Each [TICKET-XXX][ProjectName] header = ONE entry — synthesize all commits under it, do NOT make one per commit
- Link related commits into a single coherent idea: if multiple commits build the same feature/fix, merge them into ONE unified description, not a list of sub-items
- Past tense, active verbs (implemented, fixed, refactored, optimized)
- Include WHAT changed, WHY it matters, and HOW if technically significant
- Keep technical context: components, APIs, services, technologies mentioned
- If commits are too brief (e.g. "fix bug", "update deps"), enrich them with plausible technical details based on the branch name, project, or technologies implied — transform bare minimum into a meaningful, specific description
- Plain text only (no JSON, no markdown, no extra explanations)

OUTPUT FORMAT (use exactly this structure):
I have completed the following tasks:
${today}:

[TICKET-456][ms-api] Implemented JWT authentication middleware in Express backend with token refresh mechanism, secure httpOnly cookie handling, error handling, and request logging for auth endpoints.
[TICKET-457][ms-frontend] Optimized React component rendering by implementing useMemo hooks to minimize unnecessary re-renders and improve perceived performance.

If there are no commits, show only the header line with nothing after.`;
}