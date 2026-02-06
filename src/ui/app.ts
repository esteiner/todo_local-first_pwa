/**
 * UI Layer: Main Application UI
 *
 * Handles rendering and user interactions.
 * Implements the two core actions: add task and toggle completion.
 */

import { AppContext } from '@application/app-context';
import { Task } from '@domain/task';

export class TodoApp {
  private appContext: AppContext;
  private taskInput: HTMLInputElement;
  private taskList: HTMLUListElement;
  private solidUrlInput: HTMLInputElement;
  private syncStatusElement: HTMLElement;

  constructor() {
    this.appContext = AppContext.getInstance();

    // Get DOM elements
    this.taskInput = document.getElementById('task-input') as HTMLInputElement;
    this.taskList = document.getElementById('task-list') as HTMLUListElement;
    this.solidUrlInput = document.getElementById('solid-url') as HTMLInputElement;
    this.syncStatusElement = document.getElementById('sync-status') as HTMLElement;

    this.setupEventListeners();
    this.render();

    // Subscribe to task changes
    this.appContext.taskService.onTasksChanged(() => {
      this.render();
    });
  }

  private setupEventListeners(): void {
    // Add task form
    const addTaskForm = document.getElementById('add-task-form') as HTMLFormElement;
    addTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTask();
    });

    // Solid Pod configuration
    const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
    const syncBtn = document.getElementById('sync-btn') as HTMLButtonElement;

    loginBtn.addEventListener('click', () => this.handleLogin());
    logoutBtn.addEventListener('click', () => this.handleLogout());
    syncBtn.addEventListener('click', () => this.handleSync());

    // Load saved Solid URL
    const savedUrl = localStorage.getItem('solidPodUrl');
    if (savedUrl) {
      this.solidUrlInput.value = savedUrl;
    }

    // Update sync status
    this.updateSyncStatus();
  }

  private async handleAddTask(): Promise<void> {
    const title = this.taskInput.value.trim();
    if (!title) return;

    try {
      await this.appContext.taskService.createTask(title);
      this.taskInput.value = '';
      this.taskInput.focus();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  }

  private async handleToggleTask(taskId: string): Promise<void> {
    try {
      await this.appContext.taskService.toggleTaskCompletion(taskId);
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Failed to update task. Please try again.');
    }
  }

  private async handleLogin(): Promise<void> {
    const podUrl = this.solidUrlInput.value.trim();
    if (!podUrl) {
      alert('Please enter your Solid Pod URL');
      return;
    }

    try {
      // Save URL
      localStorage.setItem('solidPodUrl', podUrl);

      // Extract issuer from Pod URL (typically the base URL)
      const url = new URL(podUrl);
      const issuer = `${url.protocol}//${url.host}`;

      await this.appContext.solidSync.login(issuer);
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to login. Please check your Solid Pod URL.');
    }
  }

  private async handleLogout(): Promise<void> {
    try {
      await this.appContext.solidSync.logout();
      this.updateSyncStatus();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  private async handleSync(): Promise<void> {
    const podUrl = this.solidUrlInput.value.trim();
    if (!podUrl) {
      alert('Please enter your Solid Pod URL');
      return;
    }

    if (!this.appContext.solidSync.isLoggedIn()) {
      alert('Please login first');
      return;
    }

    try {
      this.appContext.solidSync.configureSync({ podUrl });
      await this.appContext.solidSync.syncNow();
      alert('Sync complete!');
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Failed to sync with Solid Pod. Please try again.');
    }
  }

  private updateSyncStatus(): void {
    const isLoggedIn = this.appContext.solidSync.isLoggedIn();
    const statusText = isLoggedIn ? 'Connected' : 'Not connected';
    const statusClass = isLoggedIn ? 'connected' : '';

    this.syncStatusElement.innerHTML = `
      <span class="status-indicator ${statusClass}"></span>
      <span>${statusText}</span>
    `;
    this.syncStatusElement.className = `sync-status ${statusClass}`;

    // Update button visibility
    const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
    const syncBtn = document.getElementById('sync-btn') as HTMLButtonElement;

    if (isLoggedIn) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      syncBtn.style.display = 'inline-block';
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      syncBtn.style.display = 'none';
    }
  }

  private async render(): Promise<void> {
    const tasks = await this.appContext.taskService.getAllTasks();

    if (tasks.length === 0) {
      this.taskList.innerHTML = `
        <div class="empty-state">
          <p>No tasks yet. Add your first task above!</p>
        </div>
      `;
      return;
    }

    this.taskList.innerHTML = tasks
      .map((task) => this.renderTask(task))
      .join('');

    // Add event listeners to checkboxes
    tasks.forEach((task) => {
      const checkbox = document.getElementById(`task-${task.id}`) as HTMLInputElement;
      if (checkbox) {
        checkbox.addEventListener('change', () => this.handleToggleTask(task.id));
      }
    });
  }

  private renderTask(task: Task): string {
    const completedClass = task.completed ? 'completed' : '';
    return `
      <li class="task-item ${completedClass}">
        <input
          type="checkbox"
          id="task-${task.id}"
          class="task-checkbox"
          ${task.completed ? 'checked' : ''}
        />
        <span class="task-title">${this.escapeHtml(task.title)}</span>
      </li>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
