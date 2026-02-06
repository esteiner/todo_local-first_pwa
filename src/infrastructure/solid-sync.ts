/**
 * Infrastructure Layer: Solid Pod Synchronization
 *
 * Handles synchronization with a Solid Pod server for backup and
 * cross-device sync. Users remain anonymous until they provide
 * their Solid Pod URL.
 */

import {
  getSolidDataset,
  saveSolidDatasetAt,
  createSolidDataset,
  setThing,
  createThing,
  getStringNoLocale,
  setStringNoLocale,
  getBoolean,
  setBoolean,
  getDatetime,
  setDatetime,
  getThingAll,
} from '@inrupt/solid-client';
import {
  login,
  logout,
  handleIncomingRedirect,
  getDefaultSession,
  Session,
  fetch as solidFetch,
} from '@inrupt/solid-client-authn-browser';
import { Task } from '@domain/task';
import { CrdtTaskStore } from '@application/crdt-store';

export interface SolidConfig {
  podUrl: string;
  datasetUrl?: string;
}

export class SolidPodSync {
  private session: Session;
  private config: SolidConfig | null = null;
  private syncInterval: number | null = null;
  private store: CrdtTaskStore;

  constructor(store: CrdtTaskStore) {
    this.session = getDefaultSession();
    this.store = store;
  }

  /**
   * Initialize Solid authentication
   */
  async initialize(): Promise<void> {
    await handleIncomingRedirect({
      restorePreviousSession: true,
    });
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.session.info.isLoggedIn;
  }

  /**
   * Get the current session info
   */
  getSessionInfo() {
    return this.session.info;
  }

  /**
   * Login to Solid Pod
   */
  async login(issuer: string): Promise<void> {
    await login({
      oidcIssuer: issuer,
      redirectUrl: window.location.href,
      clientName: 'Local-First Todo App',
    });
  }

  /**
   * Logout from Solid Pod
   */
  async logout(): Promise<void> {
    await logout();
    this.stopSync();
    this.config = null;
  }

  /**
   * Configure Solid Pod synchronization
   */
  configureSync(config: SolidConfig): void {
    this.config = config;
  }

  /**
   * Start automatic synchronization
   */
  startSync(intervalMs: number = 30000): void {
    if (this.syncInterval !== null) {
      this.stopSync();
    }

    // Initial sync
    this.syncNow();

    // Periodic sync
    this.syncInterval = window.setInterval(() => {
      this.syncNow();
    }, intervalMs);
  }

  /**
   * Stop automatic synchronization
   */
  stopSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform synchronization now
   */
  async syncNow(): Promise<void> {
    if (!this.config || !this.isLoggedIn()) {
      console.log('Sync skipped: not configured or not logged in');
      return;
    }

    try {
      console.log('Starting Solid Pod sync...');

      // Get dataset URL (default to podUrl + /tasks if not specified)
      const datasetUrl = this.config.datasetUrl || `${this.config.podUrl}/tasks`;

      // Push local state to Solid Pod
      await this.pushToSolid(datasetUrl);

      console.log('Solid Pod sync complete');
    } catch (error) {
      console.error('Error during Solid Pod sync:', error);
    }
  }

  /**
   * Push local CRDT state to Solid Pod
   */
  private async pushToSolid(datasetUrl: string): Promise<void> {
    const tasks = this.store.getAllTasks();

    try {
      // Create a Solid dataset
      let dataset = createSolidDataset();

      // Add each task as a Thing in the dataset
      for (const task of tasks) {
        const taskThing = createThing({ name: task.id });

        let updatedTask = setStringNoLocale(taskThing, 'http://example.org/todo#id', task.id);
        updatedTask = setStringNoLocale(updatedTask, 'http://example.org/todo#title', task.title);
        updatedTask = setBoolean(updatedTask, 'http://example.org/todo#completed', task.completed);
        updatedTask = setDatetime(updatedTask, 'http://purl.org/dc/terms/created', task.created);
        updatedTask = setDatetime(updatedTask, 'http://purl.org/dc/terms/modified', task.modified);

        if (task.completedAt) {
          updatedTask = setDatetime(updatedTask, 'http://example.org/todo#completedAt', task.completedAt);
        }

        dataset = setThing(dataset, updatedTask);
      }

      // Save to Solid Pod
      await saveSolidDatasetAt(datasetUrl, dataset, {
        fetch: solidFetch,
      });

      console.log(`Pushed ${tasks.length} tasks to Solid Pod`);
    } catch (error) {
      console.error('Error pushing to Solid Pod:', error);
      throw error;
    }
  }

  /**
   * Pull state from Solid Pod and merge with local CRDT
   */
  async pullFromSolid(datasetUrl: string): Promise<void> {
    try {
      const dataset = await getSolidDataset(datasetUrl, {
        fetch: solidFetch,
      });

      const things = getThingAll(dataset);

      for (const thing of things) {
        try {
          const id = getStringNoLocale(thing, 'http://example.org/todo#id');
          const title = getStringNoLocale(thing, 'http://example.org/todo#title');
          const completed = getBoolean(thing, 'http://example.org/todo#completed');
          const created = getDatetime(thing, 'http://purl.org/dc/terms/created');
          const modified = getDatetime(thing, 'http://purl.org/dc/terms/modified');
          const completedAt = getDatetime(thing, 'http://example.org/todo#completedAt');

          if (!id || !title || !created || !modified) continue;

          const task: Task = {
            id,
            title,
            completed: completed ?? false,
            created,
            modified,
            completedAt: completedAt ?? undefined,
          };

          // Check if task exists locally
          const existingTask = this.store.getTaskById(id);
          if (!existingTask) {
            // Add new task from Solid Pod
            this.store.addTask(task);
          } else if (task.modified > existingTask.modified) {
            // Update if remote is newer
            this.store.updateTask(task);
          }
        } catch (error) {
          console.error('Error parsing task from Solid Pod:', error);
        }
      }

      console.log(`Pulled tasks from Solid Pod`);
    } catch (error) {
      if ((error as any).statusCode === 404) {
        console.log('No existing dataset in Solid Pod, will create on first push');
      } else {
        console.error('Error pulling from Solid Pod:', error);
        throw error;
      }
    }
  }
}
