/**
 * Application Layer: Task Service
 *
 * Application service that orchestrates task operations.
 * This is the main entry point for task-related use cases.
 */

import { Task, TaskFactory } from '@domain/task';
import { CrdtTaskStore } from './crdt-store';
import { v4 as uuidv4 } from 'uuid';

export class TaskService {
  constructor(private store: CrdtTaskStore) {}

  /**
   * Use case: Create a new task
   */
  async createTask(title: string): Promise<Task> {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }

    const id = uuidv4();
    const task = TaskFactory.createTask(title.trim(), id);

    this.store.addTask(task);

    return task;
  }

  /**
   * Use case: Toggle task completion status
   */
  async toggleTaskCompletion(taskId: string): Promise<Task> {
    const task = this.store.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const updatedTask = TaskFactory.toggleCompletion(task);
    this.store.updateTask(updatedTask);

    return updatedTask;
  }

  /**
   * Use case: Get all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    return this.store.getAllTasks();
  }

  /**
   * Use case: Get a task by ID
   */
  async getTaskById(taskId: string): Promise<Task | undefined> {
    return this.store.getTaskById(taskId);
  }

  /**
   * Use case: Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    this.store.deleteTask(taskId);
  }

  /**
   * Subscribe to task changes
   */
  onTasksChanged(handler: (tasks: Task[]) => void): () => void {
    return this.store.onChange(handler);
  }
}
