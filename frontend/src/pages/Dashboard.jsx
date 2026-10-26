import React, { useState } from 'react';
import TaskSections from './TaskSections.jsx';
import { useTaskWorkspace } from './WorkspaceLayout.jsx';

export default function Dashboard() {
  const {
    tasks,
    isLoading,
    createTask,
    changeTaskStatus,
    removeTask
  } = useTaskWorkspace();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (event) => {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (isCreating || title.length < 3) return;

    setIsCreating(true);
    const created = await createTask({ title, priority, status: 'pending' });
    if (created) setNewTaskTitle('');
    setIsCreating(false);
  };

  return <section className="page-content">
    <div className="page-heading">
      <div>
        <h1>Tasks</h1>
        <p className="page-subtitle">A little progress, one task at a time.</p>
      </div>
    </div>

    <form onSubmit={handleCreate} className="new-task-form">
      <label className="visually-hidden" htmlFor="new-task-title">New task title</label>
      <input id="new-task-title" value={newTaskTitle}
        onChange={(event) => setNewTaskTitle(event.target.value)}
        placeholder="Add a new task..." minLength="3" required />
      <label className="visually-hidden" htmlFor="new-task-priority">Priority</label>
      <select id="new-task-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
        <option value="low">Low priority</option>
        <option value="medium">Medium priority</option>
        <option value="high">High priority</option>
      </select>
      <button className="primary-button" type="submit" disabled={isCreating || newTaskTitle.trim().length < 3}>
        {isCreating ? 'Adding...' : 'Add task'}
      </button>
    </form>

    {isLoading
      ? <p className="empty-state" role="status">Loading your tasks...</p>
      : <TaskSections tasks={tasks} onStatusChange={changeTaskStatus} onDelete={removeTask} />}
  </section>;
}
