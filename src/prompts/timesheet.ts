const TIMESHEET_TEMPLATE = `You are a timesheet writer. Format this manual timesheet for {{today}}.

RULES:
- Classify items as Meetings or Tasks
- Preserve meaning, fix grammar
- Past tense, plain text only
- Add detail to make entries professional, but do not fabricate information.

EXAMPLE:
I have attended the following meetings:
{{today}}:
- Team standup: Discussed sprint progress, blockers on feature X, aligned on priority for Q2.
- 1-on-1 with manager: Reviewed performance feedback, discussed career growth opportunities.

I have completed the following tasks:
{{today}}:
- Fixed bug in checkout flow: Customer payment was failing for certain credit card types. Updated validation logic and added test coverage.
- Code review: Reviewed 3 PRs from team, provided feedback on architecture and test coverage.

OUTPUT:
I have attended the following meetings:
{{today}}:
<meeting items>

I have completed the following tasks:
{{today}}:
<task items>`; 

export function getTimesheetPrompt(today: string): string {
  return TIMESHEET_TEMPLATE.replace(/\{\{today\}\}/g, today);
}