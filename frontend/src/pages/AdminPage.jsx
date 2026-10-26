import React, { useMemo, useState } from 'react';
import { getAdminReport } from '../components/api';

const today = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '—';
const csvCell = (value) => {
  const text = String(value ?? '');
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

export default function AdminPage({ role }) {
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [tasks, setTasks] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const completedCount = useMemo(() => (tasks || []).filter(
    (task) => task.status === 'complete' || task.completed
  ).length, [tasks]);

  const generateReport = async (event) => {
    event.preventDefault();
    setError('');
    if (!from || !to || from > to) {
      setTasks(null);
      setError('Enter valid dates and make sure From is not later than To.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await getAdminReport(from, to);
      setTasks(response.data.tasks);
    } catch (err) {
      setTasks(null);
      setError(err.message || 'Could not generate the report.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!tasks) return;
    const rows = [
      ['Task', 'Status', 'Created date', 'Completed date'],
      ...tasks.map((task) => [
        task.title,
        task.status || (task.completed ? 'complete' : 'pending'),
        task.createdAt ? new Date(task.createdAt).toISOString() : '',
        task.completedAt ? new Date(task.completedAt).toISOString() : ''
      ])
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-report-${from}-to-${to}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  if (role !== 'admin') {
    return <section className="page-content"><div className="content-card access-denied" role="alert">
      <h1>Administrator access required</h1>
      <p>Your account does not have permission to view workspace reports.</p>
    </div></section>;
  }

  return <section className="page-content">
    <div className="page-heading">
      <div>
        <h1>Admin dashboard</h1>
        <p className="page-subtitle">Review workspace tasks and prepare date-range reports.</p>
      </div>
      <span className="admin-badge">Administrator</span>
    </div>

    <form className="report-form content-card" onSubmit={generateReport}>
      <label>From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} required /></label>
      <label>To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} required /></label>
      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate report'}
      </button>
    </form>
    {error && <p className="error-message" role="alert">{error}</p>}

    {tasks && <>
      <div className="report-summary">
        <div className="summary-card"><span>Tasks created</span><strong>{tasks.length}</strong></div>
        <div className="summary-card"><span>Tasks completed</span><strong>{completedCount}</strong></div>
      </div>
      <div className="report-table-wrap content-card">
        <div className="table-heading">
          <h2>Task report</h2>
          <button className="secondary-button" type="button" onClick={downloadCsv}>Download CSV</button>
        </div>
        {tasks.length === 0
          ? <p className="empty-state">No tasks were created in this date range.</p>
          : <table className="report-table">
            <thead><tr><th scope="col">Task</th><th scope="col">Status</th>
              <th scope="col">Created date</th><th scope="col">Completed date</th></tr></thead>
            <tbody>{tasks.map((task) => <tr key={task._id}>
              <td>{task.title}</td><td>{task.status || (task.completed ? 'complete' : 'pending')}</td>
              <td>{formatDate(task.createdAt)}</td><td>{formatDate(task.completedAt)}</td>
            </tr>)}</tbody>
          </table>}
      </div>
    </>}
  </section>;
}
