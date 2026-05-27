import { executeCommand } from './command';
import { GitChange, UrlEntry } from '../types';
import { getFormattedDate, getDateRange } from './formatting';

export async function getGitBranch(cwd: string): Promise<string> {
  if (!cwd) {
    throw new Error('Repository path is required');
  }

  const commandResult = await executeCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  return commandResult.trim();
}

export async function getCurrentGitUser(cwd: string): Promise<string> {
  if (!cwd) {
    throw new Error('Repository path is required');
  }

  const commandResult = await executeCommand('git', ['config', 'user.email'], cwd);
  return commandResult.trim();
}

export async function getGitLogForToday(cwd: string): Promise<string[]> {
  if (!cwd) {
    throw new Error('Repository path is required');
  }

  const authorEmail = await getCurrentGitUser(cwd);
  const { since, until } = getDateRange();
  const args = ['log', '--oneline', `--since=${since}`, `--until=${until}`, `--author=${authorEmail}`];
  const commandResult = await executeCommand('git', args, cwd);
  return commandResult
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
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
      const gitLog = await getGitLogForToday(trimmed);

      if (gitLog.length > 0) {
        results.push({
          branch,
          changes: gitLog.join('\n'),
          project: extractProjectName(trimmed)
        });
      }
    } catch {
      // Skip URLs with git errors, continue processing others
    }
  }

  return results;
}