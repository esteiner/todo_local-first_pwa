/**
 * Infrastructure Layer: IndexedDB Persistence
 *
 * Provides local persistence for the CRDT state using IndexedDB.
 * This enables the app to work offline and retain data across sessions.
 */

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

export class LocalPersistence {
  private persistence: IndexeddbPersistence | null = null;
  private synced: boolean = false;

  /**
   * Initialize persistence for a Y.Doc
   */
  async initialize(ydoc: Y.Doc, dbName: string = 'todo-local-first'): Promise<void> {
    return new Promise((resolve) => {
      this.persistence = new IndexeddbPersistence(dbName, ydoc);

      this.persistence.on('synced', () => {
        this.synced = true;
        console.log('IndexedDB persistence synced');
        resolve();
      });

      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (!this.synced) {
          console.warn('IndexedDB sync timeout, continuing anyway');
          resolve();
        }
      }, 5000);
    });
  }

  /**
   * Check if the persistence is synced
   */
  isSynced(): boolean {
    return this.synced;
  }

  /**
   * Clear all local data
   */
  async clearLocalData(): Promise<void> {
    if (this.persistence) {
      await this.persistence.clearData();
      console.log('Local data cleared');
    }
  }

  /**
   * Destroy the persistence
   */
  destroy(): void {
    if (this.persistence) {
      this.persistence.destroy();
      this.persistence = null;
      this.synced = false;
    }
  }
}
