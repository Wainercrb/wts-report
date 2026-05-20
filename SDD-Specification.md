# SDD Specification for wts-report Refactoring

## File: src/types.ts

### Exports
- `WebviewMessage`: Interface for messages sent between the webview and the extension.
- `GitChange`: Interface representing a Git change.
- `ILogger`: Interface for logging functionality.
- `IWebviewManager`: Interface for managing webview panels.
- `ICommandExecutor`: Interface for executing shell commands.
- `ILLMService`: Interface for interacting with the LLM service.
- `CommandExecutorResult`: Type for the result of a command execution.

### Implementation Notes
- Consolidates all TypeScript types and interfaces in one file.
- Improves type safety and reusability across the codebase.

---

## File: src/config.ts

### Exports
- `START_COMMAND_NAME`: `'startCommand'`
- `LLM_CHECKING_COMMAND`: `'llmCheckingCommand'`
- `WEBVIEW_PANEL_ID`: `'webviewPanel'`
- `WEBVIEW_PANEL_TITLE`: `'Webview Panel'`
- `HTML_FILENAME`: `'index.html'`
- `SCRIPT_FILENAME`: `'main.js'`
- `OUTPUT_CHANNEL_NAME`: `'WTS Report Output'`

### Implementation Notes
- Centralizes all constants to avoid magic strings.
- Ensures consistency and easier updates.

---

## File: src/utils/command.ts

### Exports
- `executeCommand(command: string, args: string[], cwd?: string, timeout?: number): Promise<string>`
  - Wrapper for executing shell commands with error and timeout handling.

### Implementation Notes
- Reduces duplication by providing a reusable command execution utility.
- Handles common errors and ensures consistent behavior.

---

## File: src/utils/formatting.ts

### Exports
- `getFormattedDate(locale?: string): string`
  - Returns a formatted date string.
- `formatGitChanges(changes: GitChange[]): string`
  - Formats Git changes for display.
- `formatDateRange(since: string, until: string): { since: string; until: string }`
  - Formats date ranges for Git filtering.

### Implementation Notes
- Provides reusable formatting utilities.
- Simplifies date and Git change formatting.

---

## File: src/utils/git.ts

### Exports
- `getGitBranch(cwd: string): Promise<string>`
  - Retrieves the current Git branch.
- `getGitLogForToday(cwd: string): Promise<string>`
  - Retrieves the Git log for today.
- `getGitHistoryForUrls(urls: Array<{ id: string; url: string }>): Promise<GitChange[]>`
  - Retrieves Git history for specific URLs.

### Implementation Notes
- Encapsulates Git-related operations.
- Ensures consistent interaction with Git.

---

## File: src/prompts/index.ts

### Exports
- `getTimesheetPrompt(today: string): string`
  - Generates a prompt for timesheet creation.
- `getWorkLogPrompt(today: string): string`
  - Generates a prompt for work log creation.

### Implementation Notes
- Centralizes prompt generation.
- Simplifies interaction with the LLM service.

---

## File: src/services/llm-service.ts

### Exports
- `LLMService`
  - `formatGitChangesAsTimesheet(gitChanges: GitChange[]): Promise<string>`: Formats Git changes as a timesheet.
  - `runQuery(userQuery: string, response?: Record<string, unknown>, token?: CancellationToken): Promise<string>`: Runs a query against the LLM service.

### Implementation Notes
- Provides a service for interacting with the LLM.
- Utilizes prompts from `../prompts/`.

---

## File: src/services/webview.ts

### Exports
- `WebviewManager`
  - `createPanel(context: ExtensionContext): void`: Creates a new webview panel.
  - `postMessage(message: Record<string, unknown>): void`: Posts a message to the webview.
  - `dispose(): void`: Disposes of the webview panel.
  - `getHtmlForWebview(webview: Webview): string`: Generates HTML content for the webview.

### Implementation Notes
- Manages webview panels and communication.
- Simplifies webview lifecycle management.

---

## File: src/handlers/message-handler.ts

### Exports
- `MessageHandler`
  - `handle(message: WebviewMessage): void`: Routes commands based on the message.

### Implementation Notes
- Handles communication between the webview and the extension.
- Depends on `WebviewManager`, `CommandExecutor`, `LLMService`, and `Logger`.

---

## File: src/extension.ts

### Exports
- `activate(context: ExtensionContext): void`
  - Initializes services and handlers.
  - Registers commands and disposes resources.

### Implementation Notes
- Entry point for the extension.
- Orchestrates initialization and cleanup.

---

This specification provides detailed guidance for implementing the refactored wts-report extension. Each file's responsibilities and exports are clearly defined to ensure a smooth development process.