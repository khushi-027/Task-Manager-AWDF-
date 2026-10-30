import { TaskModel } from '../models/Task.js';

// @desc    Get all tasks for the logged in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const filter = {};

    // Normal users ONLY see their own tasks
    if (req.user.role !== 'admin' || req.query.personal === 'true') {
      filter.owner = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const tasks = await TaskModel.find(filter);

    return res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks.',
      error: error.message,
    });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    const validStatuses = ['Pending', 'In Progress', 'Completed'];

    const chosenPriority = validPriorities.includes(priority) ? priority : 'Medium';
    const chosenStatus = validStatuses.includes(status) ? status : 'Pending';

    const newTask = await TaskModel.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: chosenPriority,
      status: chosenStatus,
      owner: req.user._id,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
    });

    return res.status(201).json({
      success: true,
      task: newTask,
      message: 'Task created successfully.',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task.',
      error: error.message,
    });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const ownerId = task.owner?._id ? task.owner._id.toString() : task.owner.toString();
    if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task.',
      });
    }

    return res.json({ success: true, task });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch task.',
      error: error.message,
    });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const ownerId = task.owner?._id ? task.owner._id.toString() : task.owner.toString();
    if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this task.',
      });
    }

    const { title, description, priority, status } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;

    const updatedTask = await TaskModel.findByIdAndUpdate(req.params.id, updateData);

    return res.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully.',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task.',
      error: error.message,
    });
  }
};

// @desc    Quick status change
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, In Progress, or Completed.',
      });
    }

    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const ownerId = task.owner?._id ? task.owner._id.toString() : task.owner.toString();
    if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change this task.',
      });
    }

    const updated = await TaskModel.findByIdAndUpdate(req.params.id, { status });

    return res.json({
      success: true,
      task: updated,
      message: `Status moved to ${status}.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update task status.',
      error: error.message,
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const ownerId = task.owner?._id ? task.owner._id.toString() : task.owner.toString();
    if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task.',
      });
    }

    await TaskModel.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Task removed successfully.',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task.',
      error: error.message,
    });
  }
};

// @desc    Get project & progress statistics
// @route   GET /api/projects/stats
// @access  Private
export const getProjectStats = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin' || req.query.workspace !== 'true') {
      filter.owner = req.user._id;
    }

    const allTasks = await TaskModel.find(filter);

    const pending = allTasks.filter((t) => t.status === 'Pending').length;
    const inProgress = allTasks.filter((t) => t.status === 'In Progress').length;
    const completed = allTasks.filter((t) => t.status === 'Completed').length;
    const total = allTasks.length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityBreakdown = {
      Low: allTasks.filter((t) => t.priority === 'Low').length,
      Medium: allTasks.filter((t) => t.priority === 'Medium').length,
      High: allTasks.filter((t) => t.priority === 'High').length,
    };

    return res.json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        completed,
        completionRate,
        priorityBreakdown,
      },
    });
  } catch (error) {
    console.error('Error calculating project stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve project statistics.',
      error: error.message,
    });
  }
};
