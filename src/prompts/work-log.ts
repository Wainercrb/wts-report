/**
 * Generate the LLM prompt for formatting work log items into categorized entries
 * @param today - Formatted date string to inject into the prompt
 * @returns The complete prompt template
 */
export function getWorkLogPrompt(today: string): string {
  return `
Categorize these work log items into a timesheet report. Today: ${today}.

RULES:
- Ignore any "tsDate" values from the input — use today's date above
- Preserve original meaning — do NOT invent work (I am a software engineer)
- Correct grammar and clarity; expand abbreviations ("1:1" → "one-on-one meeting")
- Classify each item as: Meetings or Tasks
- Past tense
- Plain text only (no JSON, no explanations)

OUTPUT FORMAT:
I have attended the following meetings:
${today}:

<meeting descriptions>

I have completed the following tasks:
${today}:

<task descriptions>

If a category has no items, include the header but leave it empty.
`;
}