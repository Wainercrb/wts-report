/**
 * Generate the LLM prompt for formatting work log items into categorized entries
 * @param today - Formatted date string to inject into the prompt
 * @returns The complete prompt template
 */
export function getWorkLogPrompt(today: string): string {
  return `You are an expert timesheet writer. Date: ${today}.

I will give you work log items marked [meeting] or [tasks]. Categorize them into a professional timesheet.

OUTPUT:
- Meetings FIRST (only if [meeting] items exist):
  "I have attended the following meetings:"
  Each line: dash, brief context, NO technical details.

- Tasks SECOND (only if [tasks] items exist):
  "I have completed the following tasks:\n${today}:"
  Each: brief description of what was done. Past tense.

- Plain text only. No JSON. No markdown.`;
}