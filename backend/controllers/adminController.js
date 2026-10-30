import { TaskModel } from '../models/Task.js';
import { UserModel } from '../models/User.js';

// @desc    Admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboard = async (req, res) => {
  try {
    const [allTasks, allUsers] = await Promise.all([
      TaskModel.find({}),
      UserModel.find({}),
    ]);

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
    const pendingTasks = allTasks.filter((t) => t.status === 'Pending').length;

    const usersWithStats = allUsers.map((user) => {
      const uId = (user._id || user.id).toString();
      const userTasks = allTasks.filter((t) => {
        const ownerId = (t.owner?._id || t.owner || '').toString();
        return ownerId === uId;
      });
      return {
        _id: uId,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        totalTasks: userTasks.length,
        completedTasks: userTasks.filter((t) => t.status === 'Completed').length,
        pendingTasks: userTasks.filter((t) => t.status === 'Pending').length,
      };
    });

    return res.json({
      success: true,
      stats: {
        totalUsers: allUsers.length,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      users: usersWithStats,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load administrator dashboard data.',
      error: error.message,
    });
  }
};

// Helper to filter tasks by date range
const filterTasksByRange = (tasks, fromDate, toDate) => {
  const fromTime = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : 0;
  const toTime = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : Infinity;

  return tasks.filter((task) => {
    const taskTime = new Date(task.createdAt).getTime();
    return taskTime >= fromTime && taskTime <= toTime;
  });
};

// @desc    Generate workspace date-range report
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getAdminReports = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both "from" and "to" date parameters are required (YYYY-MM-DD format).',
      });
    }

    const start = new Date(from);
    const end = new Date(to);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please supply valid ISO or YYYY-MM-DD dates.',
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: '"From" date cannot be after "To" date.',
      });
    }

    const allTasks = await TaskModel.find({});
    const filtered = filterTasksByRange(allTasks, from, to);

    const total = filtered.length;
    const completed = filtered.filter((t) => t.status === 'Completed').length;
    const pending = filtered.filter((t) => t.status === 'Pending').length;
    const inProgress = filtered.filter((t) => t.status === 'In Progress').length;

    return res.json({
      success: true,
      range: { from, to },
      summary: {
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        inProgressTasks: inProgress,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      tasks: filtered.map((t) => ({
        _id: t._id || t.id,
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        ownerName: t.ownerName || t.owner?.name || 'Workspace Member',
        ownerEmail: t.ownerEmail || t.owner?.email || 'N/A',
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate date-range report.',
      error: error.message,
    });
  }
};

// @desc    Export workspace report to CSV
// @route   GET /api/admin/reports/export
// @access  Private/Admin
export const exportReportCSV = async (req, res) => {
  try {
    const { from, to } = req.query;

    const allTasks = await TaskModel.find({});
    const filtered = (from && to) ? filterTasksByRange(allTasks, from, to) : allTasks;

    // Build CSV content
    const headers = [
      'Task ID',
      'Task Title',
      'Description',
      'Owner Name',
      'Owner Email',
      'Status',
      'Priority',
      'Created Date',
      'Completed Date',
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filtered.map((t) => [
      escapeCsv(t._id || t.id),
      escapeCsv(t.title),
      escapeCsv(t.description || ''),
      escapeCsv(t.ownerName || t.owner?.name || 'Workspace Member'),
      escapeCsv(t.ownerEmail || t.owner?.email || 'N/A'),
      escapeCsv(t.status),
      escapeCsv(t.priority),
      escapeCsv(t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : 'N/A'),
      escapeCsv(t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : 'N/A'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const fileName = `task-report-${from || 'all'}-to-${to || 'latest'}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate CSV export.',
      error: error.message,
    });
  }
};
