import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TaskForm from '../components/TaskForm';
import TaskCard, { TaskItem } from '../components/TaskCard';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [notification, setNotification] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/tasks');
      if (res.data?.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleTaskCreated = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" added to Pending.`);
  };

  const handleStatusChange = async (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );

      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data?.success && res.data.task) {
        // Sync with server returned object
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.data.task : t))
        );
        showToast(`Moved to ${newStatus}.`);
      }
    } catch (err: any) {
      showToast('Error updating task status.');
      fetchTasks();
    }
  };

  const handleUpdate = async (taskId: string, updatedData: Partial<TaskItem>) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, ...updatedData } : t))
      );
      const res = await api.put(`/tasks/${taskId}`, updatedData);
      if (res.data?.success && res.data.task) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.data.task : t))
        );
        showToast('Task updated successfully.');
      }
    } catch (err: any) {
      showToast('Failed to update task.');
      fetchTasks();
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data?.success) {
        showToast('Task removed.');
      }
    } catch (err: any) {
      showToast('Failed to delete task.');
      fetchTasks();
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const pendingTasks = filteredTasks.filter((t) => t.status === 'Pending');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#38234C] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-[#7041A5]">
          <Check className="w-4 h-4 text-[#B34D91]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header & Search/Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#38234C]">
            Task Dashboard
          </h1>
          <p className="text-xs text-[#987BAA] mt-0.5">
            Organize priorities, manage workflow stages, and track progress
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-[#987BAA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E9D5EF] bg-white text-xs text-[#463353] placeholder-[#987BAA] focus:outline-hidden focus:ring-2 focus:ring-[#7041A5]"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#E9D5EF] rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-[#987BAA]" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs font-medium text-[#463353] bg-transparent focus:outline-hidden"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <button
            onClick={fetchTasks}
            title="Refresh tasks"
            className="p-2 rounded-xl border border-[#E9D5EF] bg-white text-[#7041A5] hover:bg-[#F0E5F8] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      <TaskForm onTaskCreated={handleTaskCreated} />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3 Status Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: Pending */}
        <div className="bg-[#F8F3FC]/60 rounded-2xl p-4 border border-[#E9D5EF]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E9D5EF]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#F0E5F8] flex items-center justify-center text-[#7041A5]">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[#38234C]">Pending</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#7041A5] border border-[#E9D5EF]">
              {pendingTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[140px]">
            {pendingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#987BAA]">
                No pending tasks.
              </div>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-[#F8F3FC]/60 rounded-2xl p-4 border border-[#E9D5EF]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E9D5EF]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FFF2F8] flex items-center justify-center text-[#B34D91]">
                <PlayCircle className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[#38234C]">In Progress</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#B34D91] border border-[#E9D5EF]">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[140px]">
            {inProgressTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#987BAA]">
                No tasks currently in progress.
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="bg-[#F8F3FC]/60 rounded-2xl p-4 border border-[#E9D5EF]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E9D5EF]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-[#38234C]">Completed</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[140px]">
            {completedTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#987BAA]">
                No completed tasks yet.
              </div>
            ) : (
              completedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
