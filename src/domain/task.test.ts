/**
 * Domain Layer Tests: Task Entity
 */

import { describe, it, expect } from 'vitest';
import { TaskFactory } from './task';

describe('Domain: TaskFactory', () => {
  describe('createTask', () => {
    it('should create a new task with correct properties', () => {
      const title = 'Buy groceries';
      const id = 'test-id-123';

      const task = TaskFactory.createTask(title, id);

      expect(task.id).toBe(id);
      expect(task.title).toBe(title);
      expect(task.completed).toBe(false);
      expect(task.created).toBeInstanceOf(Date);
      expect(task.modified).toBeInstanceOf(Date);
      expect(task.completedAt).toBeUndefined();
    });

    it('should set created and modified to the same time', () => {
      const task = TaskFactory.createTask('Test', 'id-1');

      expect(task.created.getTime()).toBe(task.modified.getTime());
    });

    it('should create tasks with different IDs', () => {
      const task1 = TaskFactory.createTask('Task 1', 'id-1');
      const task2 = TaskFactory.createTask('Task 2', 'id-2');

      expect(task1.id).not.toBe(task2.id);
    });
  });

  describe('toggleCompletion', () => {
    it('should toggle task from incomplete to complete', () => {
      const originalTask = TaskFactory.createTask('Test', 'id-1');
      expect(originalTask.completed).toBe(false);

      const toggledTask = TaskFactory.toggleCompletion(originalTask);

      expect(toggledTask.completed).toBe(true);
      expect(toggledTask.completedAt).toBeInstanceOf(Date);
      expect(toggledTask.modified.getTime()).toBeGreaterThanOrEqual(
        originalTask.modified.getTime()
      );
    });

    it('should toggle task from complete to incomplete', () => {
      const originalTask = TaskFactory.createTask('Test', 'id-1');
      const completedTask = TaskFactory.toggleCompletion(originalTask);
      expect(completedTask.completed).toBe(true);

      const incompletedTask = TaskFactory.toggleCompletion(completedTask);

      expect(incompletedTask.completed).toBe(false);
      expect(incompletedTask.completedAt).toBeUndefined();
    });

    it('should update modified timestamp on toggle', () => {
      const originalTask = TaskFactory.createTask('Test', 'id-1');
      const originalModified = originalTask.modified.getTime();

      // Wait a bit to ensure timestamp difference
      const toggledTask = TaskFactory.toggleCompletion(originalTask);

      expect(toggledTask.modified.getTime()).toBeGreaterThanOrEqual(originalModified);
    });

    it('should preserve other task properties', () => {
      const originalTask = TaskFactory.createTask('Test Task', 'test-id');
      const toggledTask = TaskFactory.toggleCompletion(originalTask);

      expect(toggledTask.id).toBe(originalTask.id);
      expect(toggledTask.title).toBe(originalTask.title);
      expect(toggledTask.created).toEqual(originalTask.created);
    });
  });
});
