/**
 * Sample git command outputs for testing
 * These are realistic outputs from common git commands
 */

/**
 * Sample git branch listing output
 * Output from: git branch -a
 */
export const GIT_BRANCH_OUTPUT = `  main
* feature-branch
  develop`;

/**
 * Single branch name output
 * Output from: git rev-parse --abbrev-ref HEAD
 */
export const GIT_BRANCH_MAIN = 'main';

/**
 * Feature branch name
 */
export const GIT_BRANCH_FEATURE = 'feature/add-tests';

/**
 * Sample git log output (--oneline format)
 * This represents commits from today
 */
export const GIT_LOG_OUTPUT = `a1b2c3d Fix authentication bug
e4f5g6h Add comprehensive test coverage
i7j8k9l Refactor utility functions
m0n1o2p Update documentation`;

/**
 * Git log output with single commit
 */
export const GIT_LOG_SINGLE_COMMIT = `a1b2c3d Fix authentication bug`;

/**
 * Empty git log (no commits today)
 */
export const GIT_LOG_EMPTY = '';

/**
 * Git log output with multiline commit messages
 */
export const GIT_LOG_MULTILINE = `a1b2c3d Implement feature X
  - Add UI components
  - Add backend logic
e4f5g6h Fix bug in user service`;

/**
 * Sample git history output with commit hashes
 * This represents git log with hash and URL pattern detection
 */
export const GIT_HISTORY_OUTPUT = `a1b2c3d abc123def456 (HEAD -> main) Commit message 1
e4f5g6h https://github.com/user/repo/commit/e4f5g6h Commit message 2
i7j8k9l JIRA-123 Commit message 3`;

/**
 * Git error outputs for various failure scenarios
 */
export const GIT_ERROR_OUTPUTS = {
  NOT_A_REPO: 'fatal: not a git repository (or any of the parent directories): .git',
  NO_COMMITS: 'fatal: No commits yet',
  SPAWN_ERROR: 'error: git not found on PATH',
  INVALID_REF: "fatal: ambiguous argument 'unknown-branch': unknown revision or path not in the working tree.",
};

/**
 * Windows directory listing output
 * Output from: dir command
 */
export const DIR_LISTING_WIN = `Directory of C:\\projects\\wts-report

05/19/2026  10:30    <DIR>          .
05/19/2026  10:30    <DIR>          ..
05/19/2026  10:30    <DIR>          src
05/19/2026  10:30    <DIR>          ui
05/19/2026  10:30        2,045 package.json
05/19/2026  10:30          892 README.md`;

/**
 * Unix directory listing output
 * Output from: ls -la command
 */
export const DIR_LISTING_UNIX = `total 42
drwxr-xr-x  user  group  4096 May 19 10:30 .
drwxr-xr-x  user  group  4096 May 19 10:25 ..
drwxr-xr-x  user  group  4096 May 19 10:30 src
drwxr-xr-x  user  group  4096 May 19 10:30 ui
-rw-r--r--  user  group  2045 May 19 10:30 package.json
-rw-r--r--  user  group   892 May 19 10:30 README.md`;

/**
 * URL output with Windows path separators
 */
export const SAMPLE_URLS_WINDOWS = [
  'C:\\projects\\wts-report',
  'C:\\projects\\frontend',
  'D:\\work\\backend',
];

/**
 * URL output with Unix path separators
 */
export const SAMPLE_URLS_UNIX = [
  '/home/user/projects/wts-report',
  '/home/user/projects/frontend',
  '/var/work/backend',
];

/**
 * Git configuration output
 * Output from: git config --list
 */
export const GIT_CONFIG_OUTPUT = `user.name=Test User
user.email=test@example.com
core.repositoryformatversion=0
core.filemode=true
core.bare=false
core.logallrefupdates=true
core.symref=HEAD
core.sshCommand=ssh -i ~/.ssh/id_rsa
remote.origin.url=https://github.com/user/repo.git
remote.origin.fetch=+refs/heads/*:refs/remotes/origin/*
branch.main.remote=origin
branch.main.merge=refs/heads/main`;
