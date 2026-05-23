import { Result } from '../types';

/**
 * Format an unknown error into a human-readable string.
 */
export function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Execute an async function and wrap success/error in a Result type.
 * All errors are logged via the provided log function.
 *
 * @param fn - The async function to execute
 * @param log - Log function (typically logger.log)
 * @param label - Label for error messages in logs
 * @returns Result with value on success, error string on failure
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  log: (lines: string[]) => void,
  label: string
): Promise<Result<T, string>> {
  try {
    return { ok: true, value: await fn() };
  } catch (err) {
    const msg = formatError(err);
    log([`Error ${label}: ${msg}`]);
    return { ok: false, error: msg };
  }
}
