import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fluencer_db';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

export const getConnection = async () => {
  return mongoose.connection;
};

// Mock query function for compatibility/gradual refactoring (if needed)
export const query = async (sql, values) => {
  console.warn('⚠️ SQL Query called in MongoDB mode:', sql, values);
  throw new Error('Direct SQL queries are not supported in MongoDB mode.');
};

export default mongoose.connection;
