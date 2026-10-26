import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { createTask as sendCreateTask, deleteTask, getTasks, updateTask } from '../components/api';
import { statuses } from '../statuses';

const TaskWorkspaceContext = createContext(null);
const pendingTaskLoads = new Map();

const loadTasksOnce = (token) => {
  if (!pendingTaskLoads.has(token)) {
    pendingTaskLoads.set(token, getTasks().finally(() => pendingTaskLoads.delete(token)));
  }
  return pendingTaskLoads.get(token);
};

export function useTaskWorkspace() {
  const context = useContext(TaskWorkspaceContext);
  if (!context) throw new Error('Task pages must be rendered inside the workspace.');
  return context;
}

export default function WorkspaceLayout({ token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    loadTasksOnce(token).then((json) => {
      if (isCurrent) setTasks(json.data || []);
    }).catch((err) => {
      if (!isCurrent) return;
      if (err.status === 401) onLogout();
      else setError(err.message || 'Unable to load your tasks.');
    }).finally(() => {
      if (isCurrent) setIsLoading(false);
    });
    return () => { isCurrent = false; };
  }, [token, onLogout]);

  const createTask = useCallback(async (task) => {
    setError('');
    try {
      const json = await sendCreateTask(task);
      setTasks((current) => [json.data, ...current]);
      return true;
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.message || 'Could not create task.');
      return false;
    }
  }, [onLogout]);

  const changeTaskStatus = useCallback(async (task) => {
    const currentStatus = task.status || (task.completed ? 'complete' : 'pending');
    const currentIndex = statuses.findIndex((status) => status.key === currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length].key;
    setError('');
    try {
      const json = await updateTask(task._id, { title: task.title, status: nextStatus });
      setTasks((current) => current.map((item) => item._id === task._id ? json.data : item));
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.message || 'Could not update task.');
    }
  }, [onLogout]);

  const removeTask = useCallback(async (id) => {
    setError('');
    try {
      await deleteTask(id);
      setTasks((current) => current.filter((task) => task._id !== id));
    } catch (err) {
      if (err.status === 401) onLogout();
      else setError(err.message || 'Could not delete task.');
    }
  }, [onLogout]);

  const contextValue = useMemo(() => ({
    tasks, isLoading, createTask, changeTaskStatus, removeTask
  }), [tasks, isLoading, createTask, changeTaskStatus, removeTask]);

  return <main className="app-shell">
    <div className="app-frame">
      <header className="topbar">
        <NavLink to="/" className="app-title" aria-label="Task Manager home">Task Manager</NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Tasks</NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Projects</NavLink>
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink>
          <button className="logout-button" type="button" onClick={onLogout}>Sign out</button>
        </nav>
      </header>
      {error && <p className="error-message page-error" role="alert">{error}</p>}
      <TaskWorkspaceContext.Provider value={contextValue}>
        <Outlet />
      </TaskWorkspaceContext.Provider>
    </div>
  </main>;
}
