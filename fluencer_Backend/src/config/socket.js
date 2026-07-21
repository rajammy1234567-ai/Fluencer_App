import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join chat room
    socket.on('join_chat', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join('_');
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room: ${roomId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      const { receiverId, message, messageType } = data;
      const roomId = [socket.userId, receiverId].sort().join('_');

      // Broadcast to room
      io.to(roomId).emit('receive_message', {
        senderId: socket.userId,
        receiverId,
        message,
        messageType: messageType || 'text',
        timestamp: new Date()
      });

      // Send notification to receiver
      io.to(`user_${receiverId}`).emit('new_message_notification', {
        senderId: socket.userId,
        message,
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      io.to(`user_${receiverId}`).emit('user_typing', {
        userId: socket.userId
      });
    });

    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      io.to(`user_${receiverId}`).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Campaign notifications
    socket.on('campaign_update', (data) => {
      const { campaignId, influencerId, status } = data;
      io.to(`user_${influencerId}`).emit('campaign_notification', {
        campaignId,
        status,
        message: `Your application has been ${status}`,
        timestamp: new Date()
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Send notification to specific user
export const sendNotification = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};
