import express from 'express';
import Notification from '../models/Notification.js';
import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all notifications for logged-in user (brand or influencer)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userType = req.user.role; // 'brand' or 'influencer'

    const filter = {
      $or: [
        { target_type: 'all' },
        { target_type: userType, target_id: userId },
        { target_type: userType === 'brand' ? 'all_brands' : 'all_influencers' }
      ]
    };

    const notifications = await Notification.find(filter).sort({ created_at: -1 }).limit(50).lean();

    const resultList = notifications.map(n => {
      n.id = n._id.toString();
      return n;
    });

    res.json({
      success: true,
      notifications: resultList,
      unread_count: resultList.filter(n => !n.is_read).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userType = req.user.role;

    const filter = {
      is_read: false,
      $or: [
        { target_type: 'all' },
        { target_type: userType, target_id: userId },
        { target_type: userType === 'brand' ? 'all_brands' : 'all_influencers' }
      ]
    };

    const count = await Notification.countDocuments(filter);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;
    const userType = req.user.role;

    const notification = await Notification.findOne({
      _id: id,
      $or: [
        { target_type: 'all' },
        { target_type: 'all_brands' },
        { target_type: 'all_influencers' },
        { target_type: userType, target_id: userId }
      ]
    });

    if (notification) {
      notification.is_read = true;
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userType = req.user.role;

    const filter = {
      is_read: false,
      $or: [
        { target_type: 'all' },
        { target_type: userType, target_id: userId },
        { target_type: userType === 'brand' ? 'all_brands' : 'all_influencers' }
      ]
    };

    await Notification.updateMany(filter, { is_read: true });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Admin: Send notification to all influencers
router.post('/admin/send-to-all-influencers', async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const n = await Notification.create({
      title,
      message,
      target_type: 'all_influencers',
      created_by: null
    });

    res.json({
      success: true,
      message: 'Notification sent to all influencers',
      notification_id: n._id.toString()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// Admin: Send notification to all brands
router.post('/admin/send-to-all-brands', async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const n = await Notification.create({
      title,
      message,
      target_type: 'all_brands',
      created_by: null
    });

    res.json({
      success: true,
      message: 'Notification sent to all brands',
      notification_id: n._id.toString()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// Admin: Send notification to specific user
router.post('/admin/send-to-specific', async (req, res) => {
  try {
    const { title, message, target_type, target_id } = req.body;

    if (!title || !message || !target_type || !target_id) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const n = await Notification.create({
      title,
      message,
      target_type,
      target_id,
      created_by: null
    });

    res.json({
      success: true,
      message: `Notification sent to ${target_type}`,
      notification_id: n._id.toString()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// Admin: Get notification history
router.get('/admin/history', async (req, res) => {
  try {
    const list = await Notification.find({}).sort({ created_at: -1 }).limit(100).lean();

    const notifications = await Promise.all(list.map(async (n) => {
      let targetName = null;
      if (n.target_type === 'brand') {
        const bp = await BrandProfile.findOne({ user_id: n.target_id }).select('company_name').lean();
        targetName = bp ? bp.company_name : null;
      } else if (n.target_type === 'influencer') {
        const ip = await InfluencerProfile.findOne({ user_id: n.target_id }).select('name').lean();
        targetName = ip ? ip.name : null;
      }

      n.id = n._id.toString();
      n.target_name = targetName;
      return n;
    }));

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification history'
    });
  }
});

export default router;
