import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef, captureScreen } from 'react-native-view-shot';

import { auditStorage } from './audit-storage';
import type { AuditDeps } from './audit-types';

function resolveDocumentRoot() {
  return FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
}

async function ensureParentDir(fileUri: string) {
  const slashIndex = fileUri.lastIndexOf('/');
  if (slashIndex <= 0) {
    return;
  }

  const folder = fileUri.slice(0, slashIndex);
  await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
}

export function createAuditDeps(currentScreen: string, reporterId?: string): AuditDeps {
  return {
    captureScreen: async () => captureScreen({ format: 'png', result: 'tmpfile' }),
    captureRef: async (ref: unknown) => captureRef(ref as any, { format: 'png', result: 'tmpfile' }),
    writeFile: async (filename: string, content: string) => {
      const uri = `${resolveDocumentRoot()}${filename}`;
      await ensureParentDir(uri);
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    },
    writeFileBinary: async (filename: string, base64: string) => {
      const uri = `${resolveDocumentRoot()}${filename}`;
      await ensureParentDir(uri);
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return uri;
    },
    shareFile: async (uri: string) => {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    },
    storage: auditStorage,
    currentScreen,
    reporterId,
  };
}
