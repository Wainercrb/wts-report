import { executeCommand } from './command';
import { GitChange } from '../types';
import { getFormattedDate, getDateRange } from './formatting';

/**
 * Get the current git branch for a repository
 * @param cwd - Path to the repository
 * @returns Branch name, or 'unknown' if error
 */
export async function getGitBranch(cwd: string): Promise<string> {
  if (!cwd) {
    return 'unknown';
  }
  
  const result = await executeCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  return result.trim() || 'unknown';
}

/**
 * Get git log for today
 * @param cwd - Path to the repository
 * @returns Git log output as string
 */
export async function getGitLogForToday(cwd: string): Promise<string> {
  if (!cwd) {
    return '';
  }
  
  const { since, until } = getDateRange();
  const args = ['log', '--oneline', `--since=${since}`, `--until=${until}`];
  
  return executeCommand('git', args, cwd);
}

/**
 * Get git history for multiple project URLs
 * @param urls - Array of project URLs with id and url
 * @returns Array of GitChange objects
 */
export async function getGitHistoryForUrls(
  urls: Array<{ id: string; url: string }>
): Promise<GitChange[]> {
  if (urls.length === 0) {
    return [];
  }

  const results: GitChange[] = [];

  for (const item of urls) {
    const url = item.url.trim();
    if (!url) {
      continue;
    }

    const branch = await getGitBranch(url);
    const changes = await getGitLogForToday(url);
    
    // Extract project name from the path (last folder name)
    const projectName = url.split(/[\/\\]/).filter(p => p.length > 0).pop() || 'unknown';

    if (changes.trim() !== '') {
      results.push({ branch, changes, project: projectName });
    }
  }

  return results;
}