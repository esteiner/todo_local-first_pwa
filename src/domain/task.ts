/**
 * Domain Layer: Task Entity
 *
 * Core domain model representing a task.
 * This is a pure domain object, independent of infrastructure concerns.
 */

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly created: Date;
  readonly modified: Date;
  readonly completedAt?: Date;
}

/**
 * Task factory for creating new tasks
 */
export class TaskFactory {
  static createTask(title: string, id: string): Task {
    const now = new Date();
    return {
      id,
      title,
      completed: false,
      created: now,
      modified: now,
    };
  }

  static toggleCompletion(task: Task): Task {
    const now = new Date();
    return {
      ...task,
      completed: !task.completed,
      modified: now,
      completedAt: !task.completed ? now : undefined,
    };
  }
}

/**
 * Task repository interface (Domain Service)
 * Implementations will be provided by the infrastructure layer
 */
export interface TaskRepository {
  add(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | undefined>;
  delete(id: string): Promise<void>;
}
