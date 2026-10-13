import express from 'express';
import authMiddleware from '../middleware/auth.js';
import UserBlock from '../models/UserBlock.js';
import ContentReport from '../models/ContentReport.js';
import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import BrandProfile from '../models/BrandProfile.js';
import Campaign from '../models/Campaign.js';
import { getBlockDetails } from '../utils/moderation.js';

const router = express.Router();

/**
 * POST /api/moderation/report
 * File a formal report against a user, message, profile, or campaign
 * Complies with Apple Guideline 1.2 (Reporting objectionable content within 24h)
 */
router.post('/report', authMiddleware, async (req, res) => {
  try {
    const reporterId = req.user.userId || req.user.id;
    const { reportedUserId, contentType, contentId, reason, details } = req.body;

    let targetUserId = reportedUserId;
    if (!targetUserId && contentType === 'campaign' && contentId) {
      const cmp = await Campaign.findById(contentId).select('brand_id').lean();
      if (cmp && cmp.brand_id) targetUserId = cmp.brand_id;
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Reported user ID or valid content ID is required.'
      });
    }

    if (targetUserId.toString() === reporterId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report your own account or content.'
      });
    }

    const validTypes = ['user', 'message', 'campaign', 'profile'];
    if (!contentType || !validTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid content type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const validReasons = ['spam', 'harassment', 'inappropriate_content', 'scam_fraud', 'hate_speech', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid report reason. Must be one of: ${validReasons.join(', ')}`
      });
    }

    // Verify reported user exists (check User, BrandProfile, or InfluencerProfile ID)
    let reportedUser = await User.findById(targetUserId).select('_id email role').lean();
    if (!reportedUser) {
      const bp = await BrandProfile.findById(targetUserId).select('user_id').lean();
      if (bp && bp.user_id) {
        targetUserId = bp.user_id;
        reportedUser = await User.findById(targetUserId).select('_id email role').lean();
      }
    }
    if (!reportedUser) {
      const ip = await InfluencerProfile.findById(targetUserId).select('user_id').lean();
      if (ip && ip.user_id) {
        targetUserId = ip.user_id;
        reportedUser = await User.findById(targetUserId).select('_id email role').lean();
      }
    }

    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: 'The user or creator associated with this content was not found.'
      });
    }

    const report = await ContentReport.create({
      reporter_id: reporterId,
      reported_user_id: targetUserId,
      content_type: contentType,
      content_id: contentId || null,
      reason,
      details: (details || '').trim().slice(0, 1000),
      status: 'pending'
    });

    console.log(`🚨 UGC REPORT FILED: Report [${report._id}] by [${reporterId}] against [${reportedUserId}] for [${reason}]`);

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our 24/7 moderation team reviews all flagged content within 24 hours in accordance with our zero-tolerance community standards.',
      reportId: report._id.toString()
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit report: ' + error.message
    });
  }
});

/**
 * POST /api/moderation/block
 * Block a user to prevent all mutual messaging, applications, and visibility
 * Complies with Apple Guideline 1.2 (User blocking mechanism)
 */
router.post('/block', authMiddleware, async (req, res) => {
  try {
    const blockerId = req.user.userId || req.user.id;
    const { targetUserId, reason } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID to block is required.'
      });
    }

    if (targetUserId.toString() === blockerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself.'
      });
    }

    const targetUser = await User.findById(targetUserId).select('_id email').lean();
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User to block was not found.'
      });
    }

    await UserBlock.findOneAndUpdate(
      { blocker_id: blockerId, blocked_id: targetUserId },
      { $set: { reason: (reason || '').trim() || null } },
      { upsert: true, new: true }
    );

    console.log(`🚫 USER BLOCKED: [${blockerId}] blocked [${targetUserId}]`);

    return res.status(200).json({
      success: true,
      message: 'User blocked successfully. They will no longer be able to message you or interact with your content.'
    });
  } catch (error) {
    console.error('Block user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to block user: ' + error.message
    });
  }
});

/**
 * POST /api/moderation/unblock
 * Unblock a previously blocked user
 */
router.post('/unblock', authMiddleware, async (req, res) => {
  try {
    const blockerId = req.user.userId || req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID to unblock is required.'
      });
    }

    const result = await UserBlock.deleteOne({
      blocker_id: blockerId,
      blocked_id: targetUserId
    });

    console.log(`✅ USER UNBLOCKED: [${blockerId}] unblocked [${targetUserId}] (Deleted: ${result.deletedCount})`);

    return res.status(200).json({
      success: true,
      message: 'User has been unblocked successfully.'
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unblock user: ' + error.message
    });
  }
});

/**
 * GET /api/moderation/status/:targetUserId
 * Retrieve current block state between authenticated user and target
 */
router.get('/status/:targetUserId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user.id;
    const { targetUserId } = req.params;

    const details = await getBlockDetails(currentUserId, targetUserId);
    return res.status(200).json({
      success: true,
      ...details
    });
  } catch (error) {
    console.error('Block status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check block status: ' + error.message
    });
  }
});

/**
 * GET /api/moderation/blocked-users
 * List all users currently blocked by the authenticated user
 */
router.get('/blocked-users', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user.id;

    const blockRecords = await UserBlock.find({ blocker_id: currentUserId })
      .sort({ created_at: -1 })
      .lean();

    const blockedList = await Promise.all(blockRecords.map(async (record) => {
      const blockedId = record.blocked_id.toString();
      const user = await User.findById(blockedId).select('role email').lean();

      let name = 'User';
      let profileImage = null;

      if (user) {
        if (user.role === 'brand') {
          const bp = await BrandProfile.findOne({ user_id: blockedId }).select('company_name profile_image').lean();
          if (bp) {
            name = bp.company_name || 'Brand';
            profileImage = bp.profile_image || null;
          }
        } else {
          const ip = await InfluencerProfile.findOne({ user_id: blockedId }).select('name profile_image').lean();
          if (ip) {
            name = ip.name || 'Creator';
            profileImage = ip.profile_image || null;
          }
        }
      }

      return {
        blocked_user_id: blockedId,
        name,
        profile_image: profileImage,
        blocked_at: record.created_at,
        reason: record.reason
      };
    }));

    return res.status(200).json({
      success: true,
      blocked_users: blockedList
    });
  } catch (error) {
    console.error('Fetch blocked users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked users: ' + error.message
    });
  }
});

/**
 * Admin Moderation Review & Action Workflow
 * GET /api/moderation/admin/reports
 */
router.get('/admin/reports', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin authorization required.'
      });
    }

    const { status, limit = 50, page = 1 } = req.query;
    const filter = status ? { status } : {};

    const reports = await ContentReport.find(filter)
      .sort({ created_at: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('reporter_id', 'email role')
      .populate('reported_user_id', 'email role')
      .lean();

    const total = await ContentReport.countDocuments(filter);

    return res.status(200).json({
      success: true,
      reports,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin reports fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation reports: ' + error.message
    });
  }
});

/**
 * Admin Moderation Action
 * PATCH /api/moderation/admin/reports/:reportId
 */
router.patch('/admin/reports/:reportId', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role;
    const adminId = req.user.userId || req.user.id;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin authorization required.'
      });
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['reviewed', 'action_taken', 'dismissed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await ContentReport.findByIdAndUpdate(
      reportId,
      {
        $set: {
          status,
          admin_notes: (adminNotes || '').trim(),
          reviewed_by: adminId,
          reviewed_at: new Date()
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Report status updated to ${status}.`,
      report: updated
    });
  } catch (error) {
    console.error('Admin report update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update moderation report: ' + error.message
    });
  }
});

export default router;
