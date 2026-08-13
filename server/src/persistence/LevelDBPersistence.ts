import { Level } from 'level';
import * as Y from 'yjs';

export class LevelDBPersistence {
  private db: Level<string, Uint8Array>;

  constructor(dbPath: string) {
    this.db = new Level(dbPath, { valueEncoding: 'binary' });
  }

  async save(documentId: string, state: Uint8Array): Promise<void> {
    await this.db.put(`doc:${documentId}`, state);
  }

  async load(documentId: string): Promise<Uint8Array | null> {
    try {
      return await this.db.get(`doc:${documentId}`);
    } catch (error) {
      return null;
    }
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
