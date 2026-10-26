# Task Manager Frontend

React + Vite frontend for the full-stack Task Manager app.
Connects to the Express + MongoDB backend at `http://localhost:5000`.

## Requirements

- [Node.js](https://nodejs.org/) v18 or later
- The backend must be running before starting the frontend

## Setup and Run

```bash
npm install
npm run dev
```

App will be available at `http://localhost:5173`.

## What It Does

- Authenticates against the existing backend and protects workspace routes
- Creates, prioritizes, updates, and deletes backend-persisted tasks
- Shares one task collection between the Tasks and Projects pages
- Shows task status totals and an interactive progress chart
- Provides a role-protected Admin report and CSV download
- Loads secondary pages as separate JavaScript chunks

## Project Structure

```
src/
  App.jsx               authentication, routing, and lazy page loading
  components/
    api.js              fetch wrappers for all backend endpoints
  pages/
    AuthPage.jsx        sign-in and registration
    WorkspaceLayout.jsx shared navigation and task data
    Dashboard.jsx       task creation and status sections
    ProjectsPage.jsx    task progress chart
    AdminPage.jsx       date-range report and CSV export
    ContactPage.jsx     contact information availability
    TaskSections.jsx    task list and task controls
  statuses.js           shared task status definitions
  index.css              shared lavender theme and responsive layout
main.jsx                app entry point
docs/
  build-before.txt      baseline Vite build output
  build-after.txt       optimized Vite build output
```

## Practical 8: Performance and lazy loading

Auth and workspace pages use lazy-loaded JavaScript chunks. Run `npm run build` and inspect `dist/assets` to verify page chunks are emitted. Admin role setup and report behavior are documented in [the backend Practical 8 notes](../backend/docs/practical8-admin-and-reports.md).

## Backend Repo

https://github.com/24AIML042-Nyasia/task-manager-api-24AIML042
