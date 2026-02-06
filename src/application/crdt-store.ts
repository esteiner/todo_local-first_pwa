/**
 * Application Layer: CRDT Store
 *
 * Manages the task state using Y.js CRDT for conflict-free replication.
 * This ensures that concurrent modifications from multiple devices/tabs
 * will automatically merge without conflicts.
 */

import * as Y from 'yjs';
import { Task } from '@domain/task';

export type TaskChangeHandler = (tasks: Task[]) => void;

/**
 * CRDT-based task store using Y.js
 */
export class CrdtTaskStore {
  private ydoc: Y.Doc;
  private ytasks: Y.Map<Y.Map<any>>;
  private changeHandlers: Set<TaskChangeHandler> = new Set();

  constructor(clientId?: string) {
    this.ydoc = new Y.Doc();
    if (clientId) {
      this.ydoc.clientID = parseInt(clientId, 10) || this.ydoc.clientID;
    }
    this.ytasks = this.ydoc.getMap('tasks');

    // Set up observer for changes
    this.ytasks.observe(() => {
      this.notifyChangeHandlers();
    });
  }

  /**
   * Get the Y.Doc instance for persistence/sync
   */
  getYDoc(): Y.Doc {
    return this.ydoc;
  }

  /**
   * Add a new task to the CRDT store
   */
  addTask(task: Task): void {
    const ytask = new Y.Map<any>();
    ytask.set('id', task.id);
    ytask.set('title', task.title);
    ytask.set('completed', task.completed);
    ytask.set('created', task.created.toISOString());
    ytask.set('modified', task.modified.toISOString());
    if (task.completedAt) {
      ytask.set('completedAt', task.completedAt.toISOString());
    }

    this.ytasks.set(task.id, ytask);
  }

  /**
   * Update an existing task
   */
  updateTask(task: Task): void {
    const ytask = this.ytasks.get(task.id);
    if (!ytask) {
      throw new Error(`Task with id ${task.id} not found`);
    }

    ytask.set('title', task.title);
    ytask.set('completed', task.completed);
    ytask.set('modified', task.modified.toISOString());
    if (task.completedAt) {
      ytask.set('completedAt', task.completedAt.toISOString());
    } else {
      ytask.delete('completedAt');
    }
  }

  /**
   * Get all tasks from the CRDT store
   */
  getAllTasks(): Task[] {
    const tasks: Task[] = [];

    this.ytasks.forEach((ytask, taskId) => {
      try {
        const task: Task = {
          id: ytask.get('id'),
          title: ytask.get('title'),
          completed: ytask.get('completed'),
          created: new Date(ytask.get('created')),
          modified: new Date(ytask.get('modified')),
          completedAt: ytask.has('completedAt')
            ? new Date(ytask.get('completedAt'))
            : undefined,
        };
        tasks.push(task);
      } catch (error) {
        console.error(`Error parsing task ${taskId}:`, error);
      }
    });

    // Sort by creation date (newest first)
    return tasks.sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  /**
   * Get a task by ID
   */
  getTaskById(id: string): Task | undefined {
    const ytask = this.ytasks.get(id);
    if (!ytask) return undefined;

    return {
      id: ytask.get('id'),
      title: ytask.get('title'),
      completed: ytask.get('completed'),
      created: new Date(ytask.get('created')),
      modified: new Date(ytask.get('modified')),
      completedAt: ytask.has('completedAt')
        ? new Date(ytask.get('completedAt'))
        : undefined,
    };
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): void {
    this.ytasks.delete(id);
  }

  /**
   * Subscribe to task changes
   */
  onChange(handler: TaskChangeHandler): () => void {
    this.changeHandlers.add(handler);
    // Return unsubscribe function
    return () => {
      this.changeHandlers.delete(handler);
    };
  }

  /**
   * Notify all change handlers
   */
  private notifyChangeHandlers(): void {
    const tasks = this.getAllTasks();
    this.changeHandlers.forEach(handler => {
      try {
        handler(tasks);
      } catch (error) {
        console.error('Error in change handler:', error);
      }
    });
  }

  /**
   * Apply a state update from another source (e.g., sync)
   */
  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.ydoc, update);
  }

  /**
   * Get the current state as an update
   */
  getStateAsUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc);
  }

  /**
   * Destroy the store and clean up resources
   */
  destroy(): void {
    this.changeHandlers.clear();
    this.ydoc.destroy();
  }
}
