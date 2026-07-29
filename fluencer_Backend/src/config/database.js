import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fluencer_db';

// Connect to MongoDB with fallback
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Primary MongoDB connected successfully');
  } catch (err) {
    console.error('⚠️ Primary MongoDB connection failed:', err.message);
    try {
      console.log('🔄 Attempting fallback to local MongoDB database...');
      await mongoose.connect('mongodb://127.0.0.1:27017/fluencer_db', { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Local Fallback MongoDB connected successfully');
    } catch (localErr) {
      console.error('❌ Local Fallback MongoDB connection failed:', localErr.message);
    }
  }
};

connectDB();

export const getConnection = async () => {
  return mongoose.connection;
};

// Mock query function for compatibility/gradual refactoring (if needed)
export const query = async (sql, values) => {
  console.warn('⚠️ SQL Query called in MongoDB mode:', sql, values);
  throw new Error('Direct SQL queries are not supported in MongoDB mode.');
};

export default mongoose.connection;
