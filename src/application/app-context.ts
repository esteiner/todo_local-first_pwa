/**
 * Application Layer: Application Context
 *
 * Main application context that initializes and provides access
 * to all application services and infrastructure components.
 */

import { CrdtTaskStore } from './crdt-store';
import { TaskService } from './task-service';
import { LocalPersistence } from '@infrastructure/indexeddb-persistence';
import { SolidPodSync } from '@infrastructure/solid-sync';

export class AppContext {
  private static instance: AppContext | null = null;

  public readonly taskStore: CrdtTaskStore;
  public readonly taskService: TaskService;
  public readonly persistence: LocalPersistence;
  public readonly solidSync: SolidPodSync;

  private constructor() {
    // Initialize CRDT store
    this.taskStore = new CrdtTaskStore();

    // Initialize application service
    this.taskService = new TaskService(this.taskStore);

    // Initialize infrastructure
    this.persistence = new LocalPersistence();
    this.solidSync = new SolidPodSync(this.taskStore);
  }

  /**
   * Initialize the application context
   */
  async initialize(): Promise<void> {
    // Initialize local persistence
    await this.persistence.initialize(this.taskStore.getYDoc());

    // Initialize Solid authentication
    await this.solidSync.initialize();

    console.log('Application context initialized');
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): AppContext {
    if (!AppContext.instance) {
      AppContext.instance = new AppContext();
    }
    return AppContext.instance;
  }

  /**
   * Destroy the application context
   */
  destroy(): void {
    this.persistence.destroy();
    this.taskStore.destroy();
    AppContext.instance = null;
  }
}
