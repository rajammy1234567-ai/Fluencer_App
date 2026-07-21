import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for a user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }]
    }).sort({ created_at: -1 }).lean();

    const convMap = new Map();

    for (const m of messages) {
      const otherUserId = m.sender_id.toString() === userId.toString()
        ? m.receiver_id.toString()
        : m.sender_id.toString();

      if (!convMap.has(otherUserId)) {
        convMap.set(otherUserId, m);
      }
    }

    const conversations = await Promise.all(Array.from(convMap.keys()).map(async (otherId) => {
      const lastM = convMap.get(otherId);
      
      const otherUser = await User.findById(otherId).select('role').lean();
      let otherUserName = 'User';
      let otherUserImage = null;

      if (otherUser) {
        if (otherUser.role === 'brand') {
          const bp = await BrandProfile.findOne({ user_id: otherId }).select('company_name profile_image').lean();
          if (bp) {
            otherUserName = bp.company_name;
            otherUserImage = bp.profile_image;
          }
        } else {
          const ip = await InfluencerProfile.findOne({ user_id: otherId }).select('name profile_image').lean();
          if (ip) {
            otherUserName = ip.name;
            otherUserImage = ip.profile_image;
          }
        }
      }

      const unreadCount = await Message.countDocuments({
        sender_id: otherId,
        receiver_id: userId,
        is_read: false
      });

      return {
        other_user_id: otherId,
        other_user_name: otherUserName,
        other_user_image: otherUserImage,
        last_message_time: lastM.created_at,
        last_message: lastM.message,
        unread_count: unreadCount
      };
    }));

    res.status(200).json({ 
      success: true, 
      conversations: conversations
    });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch conversations', 
      error: error.message 
    });
  }
});

// Get messages between two users
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const otherUserId = req.params.otherUserId;

    const msgs = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId }
      ]
    }).sort({ created_at: 1 }).lean();

    const messages = msgs.map(m => {
      m.id = m._id.toString();
      m.message_type = m.sender_id.toString() === userId.toString() ? 'sent' : 'received';
      return m;
    });

    // Mark messages as read
    await Message.updateMany(
      { sender_id: otherUserId, receiver_id: userId, is_read: false },
      { is_read: true }
    );

    res.status(200).json({ 
      success: true, 
      messages: messages
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages', 
      error: error.message 
    });
  }
});

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, message, messageType } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Receiver ID and message are required' 
      });
    }

    const result = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      message: message,
      message_type: messageType || 'text',
      is_read: false
    });

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: result._id.toString()
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message', 
      error: error.message 
    });
  }
});

// Mark messages as read
router.put('/mark-read/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const otherUserId = req.params.otherUserId;

    await Message.updateMany(
      { sender_id: otherUserId, receiver_id: userId },
      { is_read: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark messages as read', 
      error: error.message 
    });
  }
});

// Get unread message count
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const unreadCount = await Message.countDocuments({ receiver_id: userId, is_read: false });

    res.status(200).json({ 
      success: true, 
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get unread count', 
      error: error.message 
    });
  }
});

export default router;
