import { GitChange, StoredItem } from '../types';

export class SanitizationService {
  private readonly MAX_PAYLOAD_LENGTH = 50000;

  sanitizeGitHistory(gitHistory: GitChange[]): GitChange[] {
    return gitHistory.map(change => ({
      ...change,
      branch: change.branch?.trim() ?? '',
      changes: change.changes?.trim() ?? '',
      project: change.project?.trim() ?? '',
    }));
  }

  sanitizeStoredItems(storedItems: StoredItem[] | undefined): StoredItem[] | undefined {
    if (!storedItems) return undefined;
    return storedItems.map(item => ({
      tsType: item.tsType?.trim() ?? '',
      tsText: item.tsText?.trim() ?? '',
    }));
  }

  sanitizePayload(payload: string): string {
    if (!payload || typeof payload !== 'string') return '';
    const trimmed = payload.trim();
    return trimmed.length > this.MAX_PAYLOAD_LENGTH
      ? trimmed.substring(0, this.MAX_PAYLOAD_LENGTH)
      : trimmed;
  }
}
