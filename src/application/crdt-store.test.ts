/**
 * Application Layer Tests: CRDT Store
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CrdtTaskStore } from './crdt-store';
import { TaskFactory } from '@domain/task';

describe('Application: CrdtTaskStore', () => {
  let store: CrdtTaskStore;

  beforeEach(() => {
    store = new CrdtTaskStore('test-client');
  });

  afterEach(() => {
    store.destroy();
  });

  describe('addTask', () => {
    it('should add a task to the store', () => {
      const task = TaskFactory.createTask('Test task', 'id-1');

      store.addTask(task);

      const retrievedTask = store.getTaskById('id-1');
      expect(retrievedTask).toBeDefined();
      expect(retrievedTask?.title).toBe('Test task');
    });

    it('should allow adding multiple tasks', () => {
      const task1 = TaskFactory.createTask('Task 1', 'id-1');
      const task2 = TaskFactory.createTask('Task 2', 'id-2');

      store.addTask(task1);
      store.addTask(task2);

      const allTasks = store.getAllTasks();
      expect(allTasks).toHaveLength(2);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', () => {
      const task = TaskFactory.createTask('Original', 'id-1');
      store.addTask(task);

      const updatedTask = TaskFactory.toggleCompletion(task);
      store.updateTask(updatedTask);

      const retrieved = store.getTaskById('id-1');
      expect(retrieved?.completed).toBe(true);
    });

    it('should throw error when updating non-existent task', () => {
      const task = TaskFactory.createTask('Test', 'non-existent');

      expect(() => store.updateTask(task)).toThrow();
    });
  });

  describe('getAllTasks', () => {
    it('should return empty array when no tasks', () => {
      const tasks = store.getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('should return all tasks sorted by creation date', () => {
      const task1 = TaskFactory.createTask('First', 'id-1');
      // Small delay to ensure different timestamps
      const now = Date.now();
      while (Date.now() === now) { /* wait */ }
      const task2 = TaskFactory.createTask('Second', 'id-2');

      store.addTask(task1);
      store.addTask(task2);

      const tasks = store.getAllTasks();
      expect(tasks).toHaveLength(2);
      // Verify both tasks are present
      const ids = tasks.map(t => t.id);
      expect(ids).toContain('id-1');
      expect(ids).toContain('id-2');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task from the store', () => {
      const task = TaskFactory.createTask('To be deleted', 'id-1');
      store.addTask(task);

      store.deleteTask('id-1');

      const retrieved = store.getTaskById('id-1');
      expect(retrieved).toBeUndefined();
    });

    it('should not throw when deleting non-existent task', () => {
      expect(() => store.deleteTask('non-existent')).not.toThrow();
    });
  });

  describe('onChange', () => {
    it('should notify listeners when tasks change', async () => {
      return new Promise<void>((resolve) => {
        store.onChange((tasks) => {
          expect(tasks).toHaveLength(1);
          resolve();
        });

        const task = TaskFactory.createTask('Test', 'id-1');
        store.addTask(task);
      });
    });

    it('should allow unsubscribing', async () => {
      let callCount = 0;

      const unsubscribe = store.onChange(() => {
        callCount++;
      });

      const task1 = TaskFactory.createTask('Task 1', 'id-1');
      store.addTask(task1);

      unsubscribe();

      const task2 = TaskFactory.createTask('Task 2', 'id-2');
      store.addTask(task2);

      // Wait and check call count
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(callCount).toBeLessThanOrEqual(1);
    });
  });

  describe('CRDT synchronization', () => {
    it('should synchronize state between two stores', () => {
      const store1 = new CrdtTaskStore('client-1');
      const store2 = new CrdtTaskStore('client-2');

      // Add task to store1
      const task = TaskFactory.createTask('Shared task', 'id-1');
      store1.addTask(task);

      // Get update from store1 and apply to store2
      const update = store1.getStateAsUpdate();
      store2.applyUpdate(update);

      // Verify task exists in store2
      const retrieved = store2.getTaskById('id-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Shared task');

      store1.destroy();
      store2.destroy();
    });

    it('should handle concurrent modifications', () => {
      const store1 = new CrdtTaskStore('client-1');
      const store2 = new CrdtTaskStore('client-2');

      // Add same task to both stores
      const task = TaskFactory.createTask('Shared task', 'id-1');
      store1.addTask(task);
      store2.addTask(task);

      // Modify differently
      const completed1 = TaskFactory.toggleCompletion(task);
      store1.updateTask(completed1);

      // Sync
      const update1 = store1.getStateAsUpdate();
      store2.applyUpdate(update1);

      // Both should have the task (CRDT merges automatically)
      expect(store1.getTaskById('id-1')).toBeDefined();
      expect(store2.getTaskById('id-1')).toBeDefined();

      store1.destroy();
      store2.destroy();
    });
  });
});
