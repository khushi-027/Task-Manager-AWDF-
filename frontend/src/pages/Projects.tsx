import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart3,
  CheckCircle,
  Clock,
  PlayCircle,
  Eye,
  EyeOff,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';

interface ProjectStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: number;
  priorityBreakdown: {
    Low: number;
    Medium: number;
    High: number;
  };
}

export const Projects: React.FC = () => {
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0,
    priorityBreakdown: { Low: 0, Medium: 0, High: 0 },
  });
  const [showChart, setShowChart] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects/stats');
      if (res.data?.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load project stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const maxValue = Math.max(stats.pending, stats.inProgress, stats.completed, 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Chart Visibility Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B34D91]">
              Analytics & Performance
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#38234C]">
            Projects Overview
          </h1>
          <p className="text-xs text-[#987BAA]">
            Task Manager progress breakdown across lifecycle phases
          </p>
        </div>

        <button
          onClick={() => setShowChart(!showChart)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E9D5EF] bg-white text-[#7041A5] text-xs font-bold hover:bg-[#F0E5F8] transition-colors shadow-2xs self-start sm:self-auto"
        >
          {showChart ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-[#B34D91]" />
              <span>Hide Chart</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-[#7041A5]" />
              <span>Show Chart</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-[#E9D5EF] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#987BAA]">Total Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0E5F8] flex items-center justify-center text-[#7041A5]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#38234C] tabular-nums">{stats.total}</p>
          <p className="text-[11px] text-[#987BAA] mt-1">Across all workspace categories</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E9D5EF] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#987BAA]">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0E5F8] flex items-center justify-center text-[#7041A5]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#7041A5] tabular-nums">{stats.pending}</p>
          <p className="text-[11px] text-[#987BAA] mt-1">Awaiting implementation</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E9D5EF] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#987BAA]">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF2F8] flex items-center justify-center text-[#B34D91]">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#B34D91] tabular-nums">{stats.inProgress}</p>
          <p className="text-[11px] text-[#987BAA] mt-1">Actively being worked on</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E9D5EF] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#987BAA]">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 tabular-nums">{stats.completed}</p>
          <p className="text-[11px] text-[#987BAA] mt-1">{stats.completionRate}% completion rate</p>
        </div>
      </div>

      {/* Dynamic Status Chart Container */}
      {showChart && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D5EF] shadow-xs mb-8 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-[#38234C] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#7041A5]" />
                <span>Task Distribution by Status</span>
              </h2>
              <p className="text-xs text-[#987BAA]">
                Dynamic visualization rendered from live database records
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-[#463353]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#7041A5]"></span>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#B34D91]"></span>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Responsive Bar Chart Viewport */}
          <div className="h-64 sm:h-72 w-full pt-4 pb-2 flex items-end justify-around gap-6 border-b border-[#E9D5EF] px-4">
            {/* Pending Column */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-[#7041A5] mb-2 tabular-nums">
                {stats.pending}
              </span>
              <div
                className="w-full max-w-[80px] bg-gradient-to-t from-[#7041A5] to-[#9B6AD6] rounded-t-xl transition-all duration-500 shadow-xs group-hover:opacity-90"
                style={{
                  height: `${Math.max(12, (stats.pending / maxValue) * 190)}px`,
                }}
              ></div>
              <span className="text-xs font-bold text-[#463353] mt-3">Pending</span>
            </div>

            {/* In Progress Column */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-[#B34D91] mb-2 tabular-nums">
                {stats.inProgress}
              </span>
              <div
                className="w-full max-w-[80px] bg-gradient-to-t from-[#B34D91] to-[#E276BF] rounded-t-xl transition-all duration-500 shadow-xs group-hover:opacity-90"
                style={{
                  height: `${Math.max(12, (stats.inProgress / maxValue) * 190)}px`,
                }}
              ></div>
              <span className="text-xs font-bold text-[#463353] mt-3">In Progress</span>
            </div>

            {/* Completed Column */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-emerald-600 mb-2 tabular-nums">
                {stats.completed}
              </span>
              <div
                className="w-full max-w-[80px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-500 shadow-xs group-hover:opacity-90"
                style={{
                  height: `${Math.max(12, (stats.completed / maxValue) * 190)}px`,
                }}
              ></div>
              <span className="text-xs font-bold text-[#463353] mt-3">Completed</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#987BAA] pt-3">
            <span>Y-axis: Task Volume</span>
            <span>X-axis: Lifecycle Stage</span>
          </div>
        </div>
      )}

      {/* Secondary Progress Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Completion Metric Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E9D5EF] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#38234C] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#7041A5]" />
              <span>Workspace Completion Rate</span>
            </h3>
            <span className="text-sm font-black text-[#7041A5]">{stats.completionRate}%</span>
          </div>

          <div className="w-full bg-[#F0E5F8] h-3.5 rounded-full overflow-hidden p-0.5 mb-3">
            <div
              className="bg-gradient-to-r from-[#7041A5] via-[#B34D91] to-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>

          <p className="text-xs text-[#987BAA] leading-relaxed">
            {stats.completed} of {stats.total} total tasks have been marked as completed.
            {stats.completionRate >= 80
              ? ' High velocity! The majority of milestones are satisfied.'
              : ' Continue moving items through the in-progress stage to maintain team momentum.'}
          </p>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-[#E9D5EF] shadow-xs">
          <h3 className="text-sm font-bold text-[#38234C] flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#B34D91]" />
            <span>Priority Breakdown</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-[#463353]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>High Priority</span>
                </span>
                <span className="tabular-nums">{stats.priorityBreakdown.High}</span>
              </div>
              <div className="w-full bg-[#F8F3FC] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{
                    width: `${stats.total > 0 ? (stats.priorityBreakdown.High / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-[#463353]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7041A5]"></span>
                  <span>Medium Priority</span>
                </span>
                <span className="tabular-nums">{stats.priorityBreakdown.Medium}</span>
              </div>
              <div className="w-full bg-[#F8F3FC] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#7041A5] h-full rounded-full"
                  style={{
                    width: `${stats.total > 0 ? (stats.priorityBreakdown.Medium / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-[#463353]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#987BAA]"></span>
                  <span>Low Priority</span>
                </span>
                <span className="tabular-nums">{stats.priorityBreakdown.Low}</span>
              </div>
              <div className="w-full bg-[#F8F3FC] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#987BAA] h-full rounded-full"
                  style={{
                    width: `${stats.total > 0 ? (stats.priorityBreakdown.Low / stats.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
