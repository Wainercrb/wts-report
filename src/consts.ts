// ===== Extension Commands (UI → Extension) =====
// These are the command values the webview sends for message routing.
export const COMMANDS = {
    SHOW_INFORMATION: 'showInformationMessage',
    AUTOMATIC_TIMESHEET: 'automaticTimesheet',
    MANUAL_TIMESHEET: 'manualTimesheet',
    GET_MODEL_INFO: 'getModelInfo',
    SELECT_MODEL: 'selectModel',
} as const;

// ===== Response Commands (Extension → UI) =====
// These are the command keys the webview receiver uses to discriminate messages.
export const RESPONSE = {
    GIT_HISTORY_RESULT: 'gitHistoryResult',
    LLM_RESULT: 'llmResult',
    MODEL_INFO: 'modelInfo',
} as const;

// ===== UI Config =====
// UI metadata and channel identifiers
export const CONFIG = {
    INFO_ALERT: 'infoAlert',
} as const;