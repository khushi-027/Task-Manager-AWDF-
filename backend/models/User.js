import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../data/users.json');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Mongoose native model
let MongooseUser;
try {
  MongooseUser = mongoose.model('User', userSchema);
} catch {
  MongooseUser = mongoose.models.User;
}

// File persistence helpers
function loadUsersFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

function saveUsersToFile(users) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

// Unified User data access layer (works seamlessly with Mongoose or file storage)
export const UserModel = {
  schema: userSchema,

  async findOne(filter) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseUser.findOne(filter);
    }
    const users = loadUsersFromFile();
    return (
      users.find((u) => {
        if (filter.email && u.email?.toLowerCase() !== filter.email?.toLowerCase()) return false;
        if (filter._id && u._id !== filter._id && u.id !== filter._id) return false;
        if (filter.resetPasswordToken && u.resetPasswordToken !== filter.resetPasswordToken) return false;
        return true;
      }) || null
    );
  },

  async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseUser.findById(id);
    }
    const users = loadUsersFromFile();
    return users.find((u) => u._id === id || u.id === id) || null;
  },

  async find(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseUser.find(filter).select('-password');
    }
    let users = loadUsersFromFile();
    if (filter.role) {
      users = users.filter((u) => u.role === filter.role);
    }
    return users.map(({ password, ...rest }) => rest);
  },

  async create(userData) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseUser.create(userData);
    }
    const users = loadUsersFromFile();
    const newUser = {
      _id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsersToFile(users);
    return newUser;
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseUser.findByIdAndUpdate(id, updateData, { new: true, ...options });
    }
    const users = loadUsersFromFile();
    const index = users.findIndex((u) => u._id === id || u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    saveUsersToFile(users);
    return users[index];
  },

  async countDocuments(filter = {}) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseUser.countDocuments(filter);
    }
    const users = loadUsersFromFile();
    if (filter.role) return users.filter((u) => u.role === filter.role).length;
    return users.length;
  },
};

export default UserModel;
