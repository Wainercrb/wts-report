/**
 * Generate the LLM prompt for formatting work log items into categorized entries
 * @param today - Formatted date string to inject into the prompt
 * @returns The complete prompt template
 */
export function getWorkLogPrompt(today: string): string {
  return `
You are an expert timesheet writer. I will provide a JSON array containing work log items. Your task is to transform this input into a clear, professional, and well-structured plain-text report.

IMPORTANT:
- ALWAYS use this date: ${today}
- IGNORE any "tsDate" values from the input

Instructions:

1. Preserve intent
- Analyze each item and maintain its original meaning.
- Do not invent unrelated work. I am a software engineer.

2. Improve descriptions
- Correct grammar, spelling, and clarity.
- Expand short or vague entries into complete, professional sentences.
- Only infer additional details when absolutely necessary.
- Do NOT include assumption explanations unless required.
- Keep descriptions concise and professional.
- Do NOT include unnecessary parentheses.

3. Categorization
- Classify each item into:
  - Meetings
  - Tasks

4. Formatting requirements
- Output must be plain text only (no JSON, no explanations).
- Use the following exact structure:

I have attended the following meetings:
${today}:

<meeting descriptions>

I have completed the following tasks:
${today}:

<task descriptions>

5. Additional rules
- Use consistent past tense.
- Expand abbreviations where appropriate (e.g., "1:1" → "one-on-one meeting").
- If a category has no items, include the header but leave it empty.
`;
}