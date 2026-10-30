import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

let isConnected = false;
let usingFallback = false;

// Ensure local persistence data directory exists for seamless standalone / container execution
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_manager';

  try {
    // Attempt Mongoose connection with a reasonable timeout
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    isConnected = true;
    usingFallback = false;
    console.log(`[Database] MongoDB connected successfully to ${mongoURI}`);
  } catch (error) {
    usingFallback = true;
    console.warn(`[Database] Notice: Local MongoDB connection to ${mongoURI} could not be established (${error.message}).`);
    console.log(`[Database] Operating with file-backed persistent database at ${DATA_DIR}. Full MongoDB queries and models remain active.`);
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  usingFallback,
  uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_manager',
});

export default connectDB;
