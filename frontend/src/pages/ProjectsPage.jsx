import React, { useMemo, useState } from 'react';
import { useTaskWorkspace } from './WorkspaceLayout.jsx';

const categories = [
  { key: 'pending', label: 'Pending', color: 'bar-pending' },
  { key: 'ongoing', label: 'In Progress', color: 'bar-ongoing' },
  { key: 'complete', label: 'Completed', color: 'bar-complete' }
];

export default function ProjectsPage() {
  const { tasks, isLoading } = useTaskWorkspace();
  const [isChartVisible, setIsChartVisible] = useState(true);
  const counts = useMemo(() => categories.map((category) => ({
    ...category,
    count: tasks.filter((task) => (task.status || (task.completed ? 'complete' : 'pending')) === category.key).length
  })), [tasks]);
  const maxCount = Math.max(1, ...counts.map((category) => category.count));
  const maxValue = Math.max(4, Math.ceil(maxCount / 4) * 4);
  const plot = { left: 48, top: 12, width: 500, height: 178 };
  const baseline = plot.top + plot.height;
  const chartTicks = Array.from({ length: 5 }, (_, index) => maxValue - index * maxValue / 4);

  return <section className="page-content">
    <div className="page-heading projects-heading">
      <div>
        <h1>Projects</h1>
        <p className="page-subtitle">Task Manager progress overview</p>
      </div>
      <button className="secondary-button" type="button" aria-expanded={isChartVisible}
        aria-controls="task-progress-chart" onClick={() => setIsChartVisible((visible) => !visible)}>
        {isChartVisible ? 'Hide chart' : 'Show chart'}
      </button>
    </div>
    <div id="task-progress-chart">
        {isLoading
          ? <p className="empty-state" role="status">Loading project progress...</p>
          : tasks.length === 0
            ? <p className="empty-state">Add tasks to see your progress here.</p>
            : <section className="content-card chart-card" aria-label="Task progress chart" hidden={!isChartVisible}>
            <svg className="bar-chart" viewBox="0 0 560 230" role="img"
              aria-label={counts.map(({ label, count }) => `${label}: ${count}`).join(', ')}>
              <title>Task progress by status</title>
              {chartTicks.map((tick, index) => {
                const y = plot.top + (index * plot.height / 4);
                return <g key={tick}>
                  <line className="chart-grid" x1={plot.left} x2={plot.left + plot.width} y1={y} y2={y} />
                  <text className="chart-axis-label" x={plot.left - 8} y={y + 4} textAnchor="end">{tick}</text>
                </g>;
              })}
              {counts.map((category, index) => {
                const center = plot.left + ((index + 0.5) * plot.width / counts.length);
                const barHeight = category.count / maxValue * plot.height;
                return <g key={category.key}>
                  <line className="chart-grid vertical-grid" x1={center} x2={center} y1={plot.top} y2={baseline} />
                  {barHeight > 0 && <rect className={`chart-bar ${category.color}`}
                    x={center - 65} y={baseline - barHeight} width="130" height={barHeight} rx="5" />}
                  <text className="chart-axis-label category-label" x={center} y={baseline + 20} textAnchor="middle">
                    {category.label}
                  </text>
                </g>;
              })}
              <line className="chart-axis" x1={plot.left} x2={plot.left} y1={plot.top} y2={baseline} />
              <line className="chart-axis" x1={plot.left} x2={plot.left + plot.width} y1={baseline} y2={baseline} />
            </svg>
          </section>}
    </div>
  </section>;
}
