/**
 * Application Entry Point
 *
 * Initializes the application and renders the UI.
 */

import { AppContext } from '@application/app-context';
import { TodoApp } from '@ui/app';
import '@ui/styles.css';

async function main() {
  try {
    // Initialize application context
    const appContext = AppContext.getInstance();
    await appContext.initialize();

    // Render the UI
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App element not found');
    }

    app.innerHTML = `
      <div class="header">
        <h1>Local-First Todo</h1>
        <p>Your tasks, your data, your control</p>
      </div>

      <div class="card">
        <form id="add-task-form" class="add-task-form">
          <input
            type="text"
            id="task-input"
            class="input"
            placeholder="What needs to be done?"
            autocomplete="off"
            required
          />
          <button type="submit" class="btn btn-primary">Add</button>
        </form>

        <ul id="task-list" class="task-list"></ul>
      </div>

      <div class="card">
        <div class="sync-config">
          <h3>Solid Pod Sync (Optional)</h3>
          <div id="sync-status" class="sync-status">
            <span class="status-indicator"></span>
            <span>Not connected</span>
          </div>

          <div class="form-group">
            <label for="solid-url">Your Solid Pod URL</label>
            <input
              type="url"
              id="solid-url"
              class="input"
              placeholder="https://your-pod.solidcommunity.net"
            />
          </div>

          <div class="form-actions">
            <button id="login-btn" class="btn btn-secondary btn-small">Login</button>
            <button id="logout-btn" class="btn btn-secondary btn-small" style="display: none;">Logout</button>
            <button id="sync-btn" class="btn btn-primary btn-small" style="display: none;">Sync Now</button>
          </div>
        </div>
      </div>
    `;

    // Initialize UI
    new TodoApp();

    console.log('Application started successfully');
  } catch (error) {
    console.error('Failed to start application:', error);
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="card" style="margin-top: 2rem;">
          <h2>Error</h2>
          <p>Failed to start the application. Please refresh the page.</p>
          <pre>${error}</pre>
        </div>
      `;
    }
  }
}

main();
