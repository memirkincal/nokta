import * as FileSystem from 'expo-file-system/legacy';
import type { AuditNote } from '../mobile-audit/src';

const FILE_NAME = 'nokta-audit-notes.json';

function getNotesPath() {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  return `${base}${FILE_NAME}`;
}

export async function loadAuditNotes(): Promise<AuditNote[]> {
  const path = getNotesPath();
  const info = await FileSystem.getInfoAsync(path);

  if (!info.exists) {
    return [];
  }

  try {
    const raw = await FileSystem.readAsStringAsync(path);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AuditNote[]) : [];
  } catch {
    return [];
  }
}

export async function saveAuditNotes(notes: AuditNote[]): Promise<void> {
  const path = getNotesPath();
  await FileSystem.writeAsStringAsync(path, JSON.stringify(notes, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
}
