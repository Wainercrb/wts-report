import { COMMANDS } from '../constants/commands';
import { StoredItem, UrlEntry, WebviewMessage } from '../types';

type UnknownRecord = Record<string, unknown>;

const WEBVIEW_COMMANDS = new Set<string>(Object.values(COMMANDS));

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

export function isUrlEntry(value: unknown): value is UrlEntry {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.url === 'string';
}

export function isUrlEntryArray(value: unknown): value is UrlEntry[] {
  return Array.isArray(value) && value.every(isUrlEntry);
}

export function isStoredItem(value: unknown): value is StoredItem {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.tsType === 'string' && typeof value.tsText === 'string';
}

export function isStoredItemArray(value: unknown): value is StoredItem[] {
  return Array.isArray(value) && value.every(isStoredItem);
}

export function isWebviewMessage(value: unknown): value is WebviewMessage {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.command !== 'string') {
    return false;
  }

  return WEBVIEW_COMMANDS.has(value.command);
}
