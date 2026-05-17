export type AuditStatus = 'open' | 'fixed';

export type AuditNote = {
  id: string;
  screenKey: string;
  title: string;
  note: string;
  status: AuditStatus;
  screenshotUri: string;
  reportUri: string;
  createdAt: string;
  updatedAt: string;
  reporterId?: string;
};

export type AuditFixture = {
  screenKey: string;
  screenLabel: string;
  reportSlug: string;
  reportTitle: string;
  issue: string;
  observation: string;
  hypothesis: string;
  repair: string;
  reproduction: string[];
  burnInAsset: string;
  noteSeed: string;
};

export type AuditStorage = {
  loadNotes: () => Promise<AuditNote[]>;
  saveNotes: (notes: AuditNote[]) => Promise<void>;
};

export type AuditDeps = {
  captureScreen: () => Promise<string>;
  captureRef: (ref: unknown) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<string>;
  writeFileBinary: (filename: string, base64: string) => Promise<string>;
  shareFile: (uri: string) => Promise<void>;
  storage: AuditStorage;
  currentScreen: string;
  reporterId?: string;
};
