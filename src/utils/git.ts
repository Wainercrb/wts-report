import { executeCommand } from './command';
import { GitChange, UrlEntry } from '../types';
import { getFormattedDate, getDateRange } from './formatting';

export async function getGitBranch(cwd: string): Promise<string> {
  if (!cwd) {
    throw new Error('Repository path is required');
  }

  const result = await executeCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  return result.trim();
}

export async function getGitLogForToday(cwd: string): Promise<string> {
  if (!cwd) {
    throw new Error('Repository path is required');
  }

  const { since, until } = getDateRange();
  const args = ['log', '--oneline', `--since=${since}`, `--until=${until}`];

  return executeCommand('git', args, cwd);
}

export function extractProjectName(path: string): string {
  return path.split(/[\/\\]/).filter(p => p.length > 0).pop() || 'unknown';
}

export async function getGitHistoryForUrls(
  urls: UrlEntry[]
): Promise<GitChange[]> {
  if (urls.length === 0) {
    return [];
  }

  const results: GitChange[] = [];

  for (const { url } of urls) {
    const trimmed = url.trim();
    if (!trimmed) {
      continue;
    }

    try {
      const branch = await getGitBranch(trimmed);
      const changes = await getGitLogForToday(trimmed);

      if (changes.trim().length > 0) {
        results.push({
          branch,
          changes,
          project: extractProjectName(trimmed)
        });
      }
    } catch {
      // Skip URLs with git errors, continue processing others
      continue;
    }
  }

  return results;
}