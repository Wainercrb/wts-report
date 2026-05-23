import { GitChange } from '../types';

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function getFormattedDate(): string {
  return formatDate(new Date());
}

export function getDateRange(date: Date = new Date()): { since: string; until: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
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
    .map((change) => `[${change.branch}][${change.project}]${change.changes}`)
    .join('\n\n');
}