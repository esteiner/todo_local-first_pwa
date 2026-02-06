/**
 * Application Layer Tests: Task Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskService } from './task-service';
import { CrdtTaskStore } from './crdt-store';

describe('Application: TaskService', () => {
  let service: TaskService;
  let store: CrdtTaskStore;

  beforeEach(() => {
    store = new CrdtTaskStore('test-client');
    service = new TaskService(store);
  });

  afterEach(() => {
    store.destroy();
  });

  describe('createTask', () => {
    it('should create a new task with valid title', async () => {
      const task = await service.createTask('Buy milk');

      expect(task.title).toBe('Buy milk');
      expect(task.completed).toBe(false);
      expect(task.id).toBeDefined();
    });

    it('should trim whitespace from title', async () => {
      const task = await service.createTask('  Buy milk  ');

      expect(task.title).toBe('Buy milk');
    });

    it('should throw error for empty title', async () => {
      await expect(service.createTask('')).rejects.toThrow(
        'Task title cannot be empty'
      );
    });

    it('should throw error for whitespace-only title', async () => {
      await expect(service.createTask('   ')).rejects.toThrow(
        'Task title cannot be empty'
      );
    });

    it('should generate unique IDs for tasks', async () => {
      const task1 = await service.createTask('Task 1');
      const task2 = await service.createTask('Task 2');

      expect(task1.id).not.toBe(task2.id);
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle task from incomplete to complete', async () => {
      const task = await service.createTask('Test task');
      expect(task.completed).toBe(false);

      const toggled = await service.toggleTaskCompletion(task.id);

      expect(toggled.completed).toBe(true);
      expect(toggled.completedAt).toBeDefined();
    });

    it('should toggle task from complete to incomplete', async () => {
      const task = await service.createTask('Test task');
      const completed = await service.toggleTaskCompletion(task.id);
      expect(completed.completed).toBe(true);

      const incomplete = await service.toggleTaskCompletion(task.id);

      expect(incomplete.completed).toBe(false);
      expect(incomplete.completedAt).toBeUndefined();
    });

    it('should throw error for non-existent task', async () => {
      await expect(service.toggleTaskCompletion('non-existent')).rejects.toThrow(
        'Task with id non-existent not found'
      );
    });
  });

  describe('getAllTasks', () => {
    it('should return empty array when no tasks', async () => {
      const tasks = await service.getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('should return all created tasks', async () => {
      await service.createTask('Task 1');
      await service.createTask('Task 2');
      await service.createTask('Task 3');

      const tasks = await service.getAllTasks();
      expect(tasks).toHaveLength(3);
    });
  });

  describe('getTaskById', () => {
    it('should return task by ID', async () => {
      const created = await service.createTask('Find me');

      const found = await service.getTaskById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find me');
    });

    it('should return undefined for non-existent ID', async () => {
      const found = await service.getTaskById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      const task = await service.createTask('To be deleted');

      await service.deleteTask(task.id);

      const found = await service.getTaskById(task.id);
      expect(found).toBeUndefined();
    });
  });

  describe('onTasksChanged', () => {
    it('should return unsubscribe function', () => {
      const unsubscribe = service.onTasksChanged(() => {});
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });
});
