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
    .filter(change => change.changes.trim().length > 0)
    .map((change) => {
      const lines = change.changes.trim().split('\n').filter(l => l.trim().length > 0);
      const count = lines.length;
      const header = `[${change.branch}][${change.project}] (${count} commit${count !== 1 ? 's' : ''}):`;
      const bullets = lines.map(l => `  - ${l.trim()}`).join('\n');
      return `${header}\n${bullets}`;
    })
    .join('\n\n');
}