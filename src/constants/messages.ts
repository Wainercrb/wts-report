export const MESSAGES = {
  ERROR: {
    NO_URLS_DATA_RECEIVED: 'No URLs data received',
    FAILED_TO_GENERATE_TIMESHEET: 'Failed to generate timesheet: ',
    FAILED_TO_PROCESS_FORM: 'Failed to process form: ',
    ERROR_GETTING_MODEL_INFO: 'Error getting model info: ',
    FAILED_TO_RETRIEVE_MODEL_INFORMATION: 'Failed to retrieve model information',
    ERROR_LOADING_HTML: 'Error loading HTML: ',
    NO_MODEL_FOR_QUERY_EXECUTION: 'No model available for query execution',
    NO_SUITABLE_LLM_MODEL:
      'No suitable LLM model available. Please ensure VS Code has an LLM extension installed.',
  },
  INFO: {
    NO_GIT_CHANGES_FOUND_TODAY: 'No git changes found for today',
    EMPTY_LLM_RESPONSE: '(empty response from LLM)',
  },
  SUCCESS: {
    FORM_PROCESSED_SUCCESSFULLY:
      'Form processed successfully! Check the output for results.',
  },
  LOADING: {
    PROCESSING_FORM_SUBMISSION: 'Processing form submission...',
  },
} as const;
