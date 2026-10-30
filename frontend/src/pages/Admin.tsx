import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Shield,
  Calendar,
  FileDown,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';

interface ReportTask {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  completedAt?: string | null;
}

interface ReportSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export const Admin: React.FC = () => {
  // Date range defaults: past 30 days to today
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);

  const [loadingReport, setLoadingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [reportTasks, setReportTasks] = useState<ReportTask[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Workspace user directory
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Auto generate initial report for current period
    handleGenerateReport();
  }, []);

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      setErrorMessage('Please select both "From" and "To" dates.');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setErrorMessage('"From" date cannot be later than "To" date.');
      return;
    }

    setErrorMessage('');
    setLoadingReport(true);

    try {
      const res = await api.get(`/admin/reports?from=${fromDate}&to=${toDate}`);
      if (res.data?.success) {
        setReportSummary(res.data.summary);
        setReportTasks(res.data.tasks || []);
        setReportGenerated(true);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to generate date-range report.');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadCSV = () => {
    const token = localStorage.getItem('task_manager_token');
    const url = `/api/admin/reports/export?from=${fromDate}&to=${toDate}`;

    // Fetch as blob with auth header to support direct download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `workspace-task-report-${fromDate}-to-${toDate}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((err) => {
        alert('Could not download CSV: ' + err.message);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section matching screenshots */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B34D91]">
            Workspace Control
          </span>
          <span className="text-xs text-[#987BAA]">·</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF2F8] text-[#7041A5] border border-[#E9D5EF]">
            <Shield className="w-3 h-3 text-[#B34D91]" />
            <span>Administrator Role Active</span>
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#38234C]">
          Admin Dashboard & Audit Reports
        </h1>
        <p className="text-xs text-[#987BAA] max-w-2xl mt-0.5">
          Workspace-wide oversight, cross-user task telemetry, and date-range compliance reporting.
        </p>
      </div>

      {/* Date-Range Report Generation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D5EF] shadow-xs mb-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#F0E5F8] flex items-center justify-center text-[#7041A5]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#38234C]">Date-Range Task Report</h2>
            <p className="text-xs text-[#987BAA]">
              Filter tasks by creation date window to audit output and export metrics
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Date Picker Form Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pb-6 border-b border-[#F0E5F8]">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
              From Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#E9D5EF] text-xs font-medium text-[#463353] focus:outline-hidden focus:ring-2 focus:ring-[#7041A5]"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
              To Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#E9D5EF] text-xs font-medium text-[#463353] focus:outline-hidden focus:ring-2 focus:ring-[#7041A5]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={loadingReport}
              className="px-5 py-2 rounded-xl bg-[#7041A5] hover:bg-[#5d338e] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{loadingReport ? 'Generating...' : 'Generate Report'}</span>
            </button>

            {reportGenerated && reportTasks.length > 0 && (
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 rounded-xl border border-[#E9D5EF] bg-white hover:bg-[#FFF2F8] text-[#B34D91] text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Report Summary Cards */}
        {reportSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
            <div className="p-3.5 rounded-2xl bg-[#F8F3FC] border border-[#E9D5EF]">
              <span className="text-[11px] font-semibold text-[#987BAA]">Tasks in Range</span>
              <p className="text-xl font-bold text-[#38234C] tabular-nums mt-0.5">
                {reportSummary.totalTasks}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FFF2F8] border border-[#F2CBE2]">
              <span className="text-[11px] font-semibold text-[#987BAA]">Completed Tasks</span>
              <p className="text-xl font-bold text-emerald-600 tabular-nums mt-0.5">
                {reportSummary.completedTasks}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F0E5F8] border border-[#E9D5EF]">
              <span className="text-[11px] font-semibold text-[#987BAA]">In Progress / Pending</span>
              <p className="text-xl font-bold text-[#7041A5] tabular-nums mt-0.5">
                {reportSummary.inProgressTasks + reportSummary.pendingTasks}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[#E9D5EF]">
              <span className="text-[11px] font-semibold text-[#987BAA]">Completion Velocity</span>
              <p className="text-xl font-bold text-[#B34D91] tabular-nums mt-0.5">
                {reportSummary.completionRate}%
              </p>
            </div>
          </div>
        )}

        {/* Report Task Table */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#463353]">
              Filtered Tasks Breakdown ({reportTasks.length})
            </h3>
            <span className="text-[11px] text-[#987BAA]">
              Range: {fromDate} to {toDate}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E9D5EF]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F3FC] border-b border-[#E9D5EF] text-[#987BAA] font-bold">
                  <th className="py-3 px-4">Task Title</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Completed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E5F8] bg-white">
                {reportTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#987BAA]">
                      No tasks found within the selected date range.
                    </td>
                  </tr>
                ) : (
                  reportTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-[#FFF2F8]/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#38234C] max-w-[220px] truncate">
                        {task.title}
                      </td>
                      <td className="py-3 px-4 text-[#463353]">
                        <span className="font-medium">{task.ownerName}</span>
                        <span className="block text-[10px] text-[#987BAA] truncate">
                          {task.ownerEmail}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            task.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : task.status === 'In Progress'
                              ? 'bg-[#FFF2F8] text-[#B34D91] border border-[#F2CBE2]'
                              : 'bg-[#F0E5F8] text-[#7041A5] border border-[#E9D5EF]'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#463353]">{task.priority}</td>
                      <td className="py-3 px-4 text-[#987BAA] tabular-nums">
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-[#987BAA] tabular-nums">
                        {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Workspace Users Directory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D5EF] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF2F8] flex items-center justify-center text-[#B34D91]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#38234C]">Workspace Members & Ownership</h2>
              <p className="text-xs text-[#987BAA]">
                Audit active accounts and personal task distribution
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F0E5F8] text-[#7041A5]">
            {users.length} Registered Users
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div
              key={u._id}
              className="p-4 rounded-2xl border border-[#E9D5EF] bg-[#F8F3FC]/50 hover:bg-white hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#38234C] truncate">{u.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    u.role === 'admin'
                      ? 'bg-[#FFF2F8] text-[#B34D91] border border-[#F2CBE2]'
                      : 'bg-white text-[#7041A5] border border-[#E9D5EF]'
                  }`}
                >
                  {u.role}
                </span>
              </div>
              <p className="text-xs text-[#987BAA] truncate mb-3">{u.email}</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#E9D5EF] text-xs font-medium text-[#463353]">
                <span>Total Tasks: <strong className="text-[#7041A5]">{u.totalTasks}</strong></span>
                <span>Done: <strong className="text-emerald-600">{u.completedTasks}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
