/**
 * Generate the LLM prompt for formatting git commits as professional timesheet entries
 * @param today - Formatted date string to inject into the prompt
 * @returns The complete prompt template
 */
export function getTimesheetPrompt(today: string): string {
  return `
Format git commits into professional timesheet entries. Today: ${today}.

RULES:
- Each [TICKET-XXX][ProjectName] group = ONE timesheet entry — synthesize all commits under the same header into a single entry
- Past tense, active verbs (implemented, fixed, refactored, optimized, integrated)
- Include WHAT changed, WHY it matters, and HOW (if technically significant)
- Keep technical context: components, APIs, services, technologies
- Plain text only (no JSON, no markdown, no explanations)
- If no items, show only "I have completed the following tasks:" with nothing after

OUTPUT FORMAT:
I have completed the following tasks:
${today}:

[TICKET-456][ms-api] Implemented JWT authentication middleware in Express backend with token refresh mechanism and secure httpOnly cookie handling. Added comprehensive error handling and request logging for auth endpoints.
[TICKET-457][ms-frontend] Optimized React component rendering by implementing useMemo hooks, reducing unnecessary re-renders and improving perceived performance.
`;
}