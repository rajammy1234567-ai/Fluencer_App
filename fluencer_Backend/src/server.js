import dotenv from 'dotenv';
dotenv.config();
import './config/database.js'; // Connect to MongoDB
import app from './app.js';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';


const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔑 JWT_SECRET loaded:`, !!process.env.JWT_SECRET);
  console.log(`🚀 Server running on port ${PORT}`);
  // console.log(`📡 Socket.IO initialized`);
  console.log(`🔗 API: http://localhost:${PORT}`);
});
// Server modified to trigger restart