import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log('Connecting to URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
.then(() => {
  console.log('✅ Success: Connected to MongoDB Atlas!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Error: Connection failed:', err);
  process.exit(1);
});
