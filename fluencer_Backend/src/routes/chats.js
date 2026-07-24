import express from 'express';
import Chat from '../models/Chat.js';
import ChatMessage from '../models/ChatMessage.js';
import Campaign from '../models/Campaign.js';
import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get all chats for current user (both brand and influencer)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let chatsList;
    if (role === 'brand') {
      chatsList = await Chat.find({ brand_id: userId }).lean();
    } else {
      chatsList = await Chat.find({ influencer_id: userId }).lean();
    }

    const chats = await Promise.all(chatsList.map(async (ch) => {
      const campaign = await Campaign.findById(ch.campaign_id).select('campaign_name').lean();
      
      let otherUserName = 'User';
      let otherUserImage = null;

      if (role === 'brand') {
        const ip = await InfluencerProfile.findOne({ user_id: ch.influencer_id }).select('name profile_image').lean();
        if (ip) {
          otherUserName = ip.name;
          otherUserImage = ip.profile_image;
        }
      } else {
        const bp = await BrandProfile.findOne({ user_id: ch.brand_id }).select('company_name profile_image').lean();
        if (bp) {
          otherUserName = bp.company_name;
          otherUserImage = bp.profile_image;
        }
      }

      const lastMsg = await ChatMessage.findOne({ chat_id: ch._id }).sort({ created_at: -1 }).lean();
      const unreadCount = await ChatMessage.countDocuments({ chat_id: ch._id, sender_id: { $ne: userId }, is_read: false });

      ch.id = ch._id.toString();
      ch.campaign_name = campaign ? campaign.campaign_name : '';
      if (role === 'brand') {
        ch.influencer_name = otherUserName;
        ch.influencer_image = otherUserImage;
      } else {
        ch.brand_name = otherUserName;
        ch.brand_image = otherUserImage;
      }
      ch.last_message = lastMsg ? lastMsg.message : null;
      ch.last_message_time = lastMsg ? lastMsg.created_at : null;
      ch.unread_count = unreadCount;

      return ch;
    }));

    // Sort by last message time
    chats.sort((a, b) => new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0));

    res.status(200).json({ 
      success: true, 
      chats: chats
    });
  } catch (error) {
    console.error('Chats fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chats', 
      error: error.message 
    });
  }
});

// Get chat messages
router.get('/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;

    // Verify user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      $or: [{ brand_id: userId }, { influencer_id: userId }]
    }).lean();

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat not found or unauthorized' 
      });
    }

    // Get other user's info for header
    let otherUserName = '';
    let campaignName = '';
    
    const campaign = await Campaign.findById(chat.campaign_id).select('campaign_name').lean();
    campaignName = campaign ? campaign.campaign_name : '';

    const isBrandUser = req.user.role === 'brand';

    if (isBrandUser) {
      const ip = await InfluencerProfile.findOne({ user_id: chat.influencer_id }).select('name').lean();
      otherUserName = ip ? ip.name : 'Influencer';
    } else {
      const bp = await BrandProfile.findOne({ user_id: chat.brand_id }).select('company_name').lean();
      otherUserName = bp ? bp.company_name : 'Brand';
    }

    // Get messages
    const msgs = await ChatMessage.find({ chat_id: chatId }).sort({ created_at: 1 }).lean();

    const messages = await Promise.all(msgs.map(async (cm) => {
      const sender = await User.findById(cm.sender_id).select('role').lean();
      let senderName = '';
      let senderImage = null;

      if (sender) {
        if (sender.role === 'brand') {
          const bp = await BrandProfile.findOne({ user_id: cm.sender_id }).select('company_name profile_image').lean();
          if (bp) {
            senderName = bp.company_name;
            senderImage = bp.profile_image;
          }
        } else {
          const ip = await InfluencerProfile.findOne({ user_id: cm.sender_id }).select('name profile_image').lean();
          if (ip) {
            senderName = ip.name;
            senderImage = ip.profile_image;
          }
        }
      }

      cm.id = cm._id.toString();
      cm.sender_role = sender ? sender.role : '';
      cm.sender_name = senderName;
      cm.sender_image = senderImage;
      return cm;
    }));

    // Mark messages as read
    await ChatMessage.updateMany(
      { chat_id: chatId, sender_id: { $ne: userId } },
      { is_read: true }
    );

    res.status(200).json({ 
      success: true, 
      chat: {
        ...chat,
        id: chat._id.toString(),
        other_user_name: otherUserName,
        campaign_name: campaignName,
        current_user_role: req.user.role,
        is_brand_owner: isBrandUser,
        is_influencer: !isBrandUser
      },
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

// Send a message (with 10 message limit)
router.post('/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;
    const { message, message_type } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message cannot be empty' 
      });
    }

    // Verify user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      $or: [{ brand_id: userId }, { influencer_id: userId }]
    });

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat not found or unauthorized' 
      });
    }

    // Check if chat is active
    if (!chat.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Chat is no longer active' 
      });
    }

    // Insert message
    const result = await ChatMessage.create({
      chat_id: chatId,
      sender_id: userId,
      message: message.trim(),
      message_type: message_type || 'text',
      is_read: false
    });

    // Update message count
    chat.message_count += 1;
    await chat.save();

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

// Get chat details
router.get('/:chatId', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      $or: [{ brand_id: userId }, { influencer_id: userId }]
    }).lean();

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat not found or unauthorized' 
      });
    }

    const campaign = await Campaign.findById(chat.campaign_id).select('campaign_name campaign_type content_type').lean();
    
    let otherUserName = '';
    let otherUserImage = null;

    if (userId.toString() === chat.brand_id.toString()) {
      const ip = await InfluencerProfile.findOne({ user_id: chat.influencer_id }).select('name profile_image').lean();
      if (ip) {
        otherUserName = ip.name;
        otherUserImage = ip.profile_image;
      }
    } else {
      const bp = await BrandProfile.findOne({ user_id: chat.brand_id }).select('company_name profile_image').lean();
      if (bp) {
        otherUserName = bp.company_name;
        otherUserImage = bp.profile_image;
      }
    }

    res.status(200).json({ 
      success: true, 
      chat: {
        ...chat,
        id: chat._id.toString(),
        campaign_name: campaign ? campaign.campaign_name : '',
        campaign_type: campaign ? campaign.campaign_type : '',
        content_type: campaign ? campaign.content_type : '',
        other_user_name: otherUserName,
        other_user_image: otherUserImage
      }
    });
  } catch (error) {
    console.error('Chat fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat', 
      error: error.message 
    });
  }
});

// In-Chat Action: Brand Locks Deal & Deposits Escrow
router.post('/:chatId/lock-deal', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (chat.brand_id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only brand owner can lock deal' });
    }

    const Application = (await import('../models/Application.js')).default;
    const campaign = await Campaign.findById(chat.campaign_id);
    const application = await Application.findOne({ campaign_id: chat.campaign_id, influencer_id: chat.influencer_id });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found for this chat' });
    }

    const dealAmount = application.escrow_amount || (campaign ? campaign.cost_per_influencer : 5000) || 5000;

    // Deduct Brand Wallet & Add to Escrow
    const brandProfile = await BrandProfile.findOne({ user_id: userId });
    if (!brandProfile || (brandProfile.wallet_balance || 0) < dealAmount) {
      return res.status(400).json({ success: false, message: `Insufficient brand wallet balance (Required: ₹${dealAmount})` });
    }

    brandProfile.wallet_balance -= dealAmount;
    brandProfile.escrow_balance = (brandProfile.escrow_balance || 0) + dealAmount;
    await brandProfile.save();

    const influencerProfile = await InfluencerProfile.findOne({ user_id: chat.influencer_id });
    if (influencerProfile) {
      influencerProfile.escrow_balance = (influencerProfile.escrow_balance || 0) + dealAmount;
      await influencerProfile.save();
    }

    application.status = 'accepted';
    application.escrow_amount = dealAmount;
    await application.save();

    // Post system message into Chat
    await ChatMessage.create({
      chat_id: chatId,
      sender_id: userId,
      message: `🔒 DEAL LOCKED! Brand deposited ₹${dealAmount} into Escrow. Creator can now shoot and submit the reel.`,
      message_type: 'system',
      is_read: false
    });

    res.json({ success: true, message: `Deal locked and ₹${dealAmount} held in escrow!`, dealAmount });
  } catch (error) {
    console.error('In-chat lock deal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// In-Chat Action: Creator Submits Work Reel Proof
router.post('/:chatId/submit-work', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;
    const { submission_url, submission_notes } = req.body;

    if (!submission_url) {
      return res.status(400).json({ success: false, message: 'Instagram Reel URL is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const Application = (await import('../models/Application.js')).default;
    const application = await Application.findOne({ campaign_id: chat.campaign_id, influencer_id: chat.influencer_id });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.deliverable_status = 'submitted';
    application.submission_url = submission_url;
    application.submission_notes = submission_notes || '';
    application.submitted_at = new Date();
    await application.save();

    // Post system message into Chat
    await ChatMessage.create({
      chat_id: chatId,
      sender_id: userId,
      message: `🎬 WORK SUBMITTED! Creator submitted Reel proof: ${submission_url}`,
      message_type: 'system',
      is_read: false
    });

    res.json({ success: true, message: 'Reel work proof submitted successfully!' });
  } catch (error) {
    console.error('In-chat submit work error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// In-Chat Action: Brand Approves Deliverable Work Proof
router.post('/:chatId/approve-work', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (chat.brand_id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only brand owner can approve work' });
    }

    const Application = (await import('../models/Application.js')).default;
    const application = await Application.findOne({ campaign_id: chat.campaign_id, influencer_id: chat.influencer_id });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.deliverable_status = 'brand_approved';
    await application.save();

    // Post system message into Chat
    await ChatMessage.create({
      chat_id: chatId,
      sender_id: userId,
      message: `✅ DELIVERABLE APPROVED! Brand confirmed work quality. Web Admin can now release 18% escrow payout.`,
      message_type: 'system',
      is_read: false
    });

    res.json({ success: true, message: 'Deliverable approved! Ready for Admin escrow payout.' });
  } catch (error) {
    console.error('In-chat approve work error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
