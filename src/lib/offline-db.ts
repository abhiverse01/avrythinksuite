import Dexie, { type Table } from 'dexie';

export interface OfflineFile {
  id: string;
  type: string;
  ownerId: string;
  name: string;
  content: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'failed';
}

export interface SyncQueueItem {
  id?: number;
  fileId: string;
  operation: 'create' | 'update' | 'delete';
  payload: string;
  createdAt: string;
  retries: number;
}

export interface UserPreference {
  key: string;
  value: string;
}

class AvrythinkDB extends Dexie {
  files!: Table<OfflineFile>;
  fileContent!: Table<{ fileId: string; content: string; updatedAt: string }>;
  syncQueue!: Table<SyncQueueItem>;
  userPrefs!: Table<UserPreference>;

  constructor() {
    super('avrythink-offline');
    this.version(1).stores({
      files: 'id, type, ownerId, updatedAt, syncStatus',
      fileContent: 'fileId, content, updatedAt',
      syncQueue: '++id, fileId, operation, payload, createdAt, retries',
      userPrefs: 'key',
    });
  }
}

export const db = new AvrythinkDB();
