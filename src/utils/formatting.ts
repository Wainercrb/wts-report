import { GitChange } from '../types';

/**
 * Format current date in GB locale
 * @returns Formatted date string (e.g., "Mon, 19 May 2026")
 */
export function getFormattedDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date());
}

/**
 * Get today's date range for git filtering
 * @returns Object with since and until timestamps
 */
export function getDateRange(): { since: string; until: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return {
    since: `${dateStr} 00:00:00`,
    until: `${dateStr} 23:59:59`
  };
}

/**
 * Format git changes into display string
 * @param changes - Array of GitChange objects
 * @returns Formatted string for display
 */
export function formatGitChanges(changes: GitChange[]): string {
  return changes
    .map((change) => `[${change.branch}][${change.project}]
${change.changes}`)
    .join('\n\n');
}