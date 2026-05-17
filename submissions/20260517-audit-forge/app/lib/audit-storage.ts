import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuditNote, AuditStorage } from './audit-types';

const STORAGE_KEY = 'nokta-forge/audit-notes';

export const auditStorage: AuditStorage = {
  async loadNotes() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as AuditNote[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  async saveNotes(notes: AuditNote[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
};
