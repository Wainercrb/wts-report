/**
 * Central export point for all test fixtures
 * Organize imports by category for easy discovery and reuse
 */

// Mock factories for VSCode API
export {
  createMockVsCodeExtensionContext,
  createMockWebviewPanel,
  createMockLanguageModel,
  createMockOutputChannel,
  createMockWebviewPanelWithEvents,
} from './vscode-mocks';

// Git command outputs and error messages
export {
  GIT_BRANCH_OUTPUT,
  GIT_BRANCH_MAIN,
  GIT_BRANCH_FEATURE,
  GIT_LOG_OUTPUT,
  GIT_LOG_SINGLE_COMMIT,
  GIT_LOG_EMPTY,
  GIT_LOG_MULTILINE,
  GIT_HISTORY_OUTPUT,
  GIT_ERROR_OUTPUTS,
  DIR_LISTING_WIN,
  DIR_LISTING_UNIX,
  SAMPLE_URLS_WINDOWS,
  SAMPLE_URLS_UNIX,
  GIT_CONFIG_OUTPUT,
} from './git-test-data';

// Object factories for domain types
export {
  createGitChange,
  createGitChangeArray,
  createWebviewMessage,
  createUrlItem,
  createUrlItemArray,
  createMockLogger,
  createFormValuesMessage,
  createCheckGitHistoryMessage,
  createShowInfoMessage,
} from './factories';

// LLM prompt samples and responses
export {
  TIMESHEET_PROMPT_SAMPLE,
  TIMESHEET_RESPONSE_SAMPLE,
  WORK_LOG_PROMPT_SAMPLE,
  WORK_LOG_RESPONSE_SAMPLE,
  NO_COMMITS_FALLBACK,
  LLM_ERROR_RESPONSE,
  MULTI_PROJECT_PROMPT_SAMPLE,
  MULTI_PROJECT_RESPONSE_SAMPLE,
  EMPTY_LLM_RESPONSE,
  FORMATTED_PROMPT_SAMPLE,
  FORMATTED_RESPONSE_SAMPLE,
} from './prompts';
