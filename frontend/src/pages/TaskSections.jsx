import React from 'react';
import { statuses } from '../statuses';

const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High' };

export default function TaskSections({ tasks, onStatusChange, onDelete }) {
  const grouped = statuses.reduce((acc, status) => {
    acc[status.key] = tasks.filter((task) => (task.status || (task.completed ? 'complete' : 'pending')) === status.key);
    return acc;
  }, {});

  return <div className="task-sections">{statuses.map((status) => {
    const sectionTasks = grouped[status.key];
    return <section className="task-section" key={status.key}>
      <div className="section-heading">
        <h2>{status.label}</h2>
        <span className="task-count">{sectionTasks.length}</span>
      </div>
      {sectionTasks.length === 0
        ? <p className="section-empty">No tasks here yet.</p>
        : <ul>{sectionTasks.map((task) => <TaskRow key={task._id} task={task}
          onStatusChange={onStatusChange} onDelete={onDelete} />)}</ul>}
    </section>;
  })}</div>;
}

function TaskRow({ task, onStatusChange, onDelete }) {
  const currentStatus = task.status || (task.completed ? 'complete' : 'pending');
  const createdAt = task.createdAt ? new Date(task.createdAt) : null;
  const completedAt = task.completedAt ? new Date(task.completedAt) : null;
  const formattedCreatedAt = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

  return <li className={`task-row status-${currentStatus}`}>
    <button type="button" className="status-toggle" onClick={() => onStatusChange(task)}
      aria-label={`Advance ${task.title} from ${currentStatus}`} title="Advance task status">
      <span className="status-dot" aria-hidden="true" />
    </button>
    <span className={currentStatus === 'complete' ? 'task-title complete-title' : 'task-title'}>{task.title}</span>
    <span className={`priority-badge priority-${task.priority || 'medium'}`}>
      {priorityLabels[task.priority] || 'Medium'} priority
    </span>
    {formattedCreatedAt && <time className="task-timestamp" dateTime={task.createdAt}
      title={`Created ${createdAt.toLocaleString()}`}>{formattedCreatedAt}</time>}
    {completedAt && !Number.isNaN(completedAt.getTime()) && <time className="visually-hidden"
      dateTime={task.completedAt}>Completed {completedAt.toLocaleString()}</time>}
    <span className="status-label">{currentStatus === 'ongoing' ? 'In progress' : currentStatus === 'complete' ? 'Completed' : 'Pending'}</span>
    <button type="button" className="delete-button" onClick={() => onDelete(task._id)}
      aria-label={`Delete ${task.title}`} title="Delete task">×</button>
  </li>;
}
