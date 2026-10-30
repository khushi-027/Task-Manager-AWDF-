import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/tasks.json');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerName: {
      type: String,
      default: '',
    },
    ownerEmail: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

let MongooseTask;
try {
  MongooseTask = mongoose.model('Task', taskSchema);
} catch {
  MongooseTask = mongoose.models.Task;
}

function loadTasksFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading tasks file:', err);
    return [];
  }
}

function saveTasksToFile(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('Error writing tasks file:', err);
  }
}

export const TaskModel = {
  schema: taskSchema,

  async find(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      let query = MongooseTask.find();
      if (filter.owner) query = query.where('owner', filter.owner);
      if (filter.status) query = query.where('status', filter.status);
      if (filter.priority) query = query.where('priority', filter.priority);
      return await query.populate('owner', 'name email').sort({ createdAt: -1 });
    }

    let tasks = loadTasksFromFile();
    if (filter.owner) {
      tasks = tasks.filter((t) => t.owner === filter.owner || t.owner?._id === filter.owner);
    }
    if (filter.status) {
      tasks = tasks.filter((t) => t.status === filter.status);
    }
    if (filter.priority) {
      tasks = tasks.filter((t) => t.priority === filter.priority);
    }
    // Sort descending by createdAt
    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseTask.findById(id).populate('owner', 'name email');
    }
    const tasks = loadTasksFromFile();
    return tasks.find((t) => t._id === id || t.id === id) || null;
  },

  async create(taskData) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseTask.create(taskData);
    }
    const tasks = loadTasksFromFile();
    const now = new Date().toISOString();
    const newTask = {
      _id: 'tsk_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      ...taskData,
      completedAt: taskData.status === 'Completed' ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    tasks.unshift(newTask);
    saveTasksToFile(tasks);
    return newTask;
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseTask.findByIdAndUpdate(id, updateData, { new: true, ...options });
    }
    const tasks = loadTasksFromFile();
    const index = tasks.findIndex((t) => t._id === id || t.id === id);
    if (index === -1) return null;

    const current = tasks[index];
    const now = new Date().toISOString();

    let completedAt = current.completedAt;
    if (updateData.status === 'Completed' && current.status !== 'Completed') {
      completedAt = now;
    } else if (updateData.status && updateData.status !== 'Completed') {
      completedAt = null;
    }

    tasks[index] = {
      ...current,
      ...updateData,
      completedAt,
      updatedAt: now,
    };
    saveTasksToFile(tasks);
    return tasks[index];
  },

  async findByIdAndDelete(id) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseTask.findByIdAndDelete(id);
    }
    const tasks = loadTasksFromFile();
    const index = tasks.findIndex((t) => t._id === id || t.id === id);
    if (index === -1) return null;
    const removed = tasks.splice(index, 1)[0];
    saveTasksToFile(tasks);
    return removed;
  },

  async countDocuments(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      let query = MongooseTask.countDocuments();
      if (filter.owner) query = query.where('owner', filter.owner);
      if (filter.status) query = query.where('status', filter.status);
      return await query;
    }
    let tasks = loadTasksFromFile();
    if (filter.owner) {
      tasks = tasks.filter((t) => t.owner === filter.owner || t.owner?._id === filter.owner);
    }
    if (filter.status) {
      tasks = tasks.filter((t) => t.status === filter.status);
    }
    return tasks.length;
  },
};

export default TaskModel;
