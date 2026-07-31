import express from 'express';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import ChatMessage from '../models/ChatMessage.js';
import Campaign from '../models/Campaign.js';
import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import { uploadChatFile } from '../middleware/upload.js';

const router = express.Router();

// Helper function to resolve or auto-create single unique chat thread
async function resolveChatDoc(paramId, userId) {
  let chat = null;
  const isValidObject = mongoose.Types.ObjectId.isValid(paramId);
  
  if (isValidObject) {
    chat = await Chat.findOne({
      _id: paramId,
      $or: [{ brand_id: userId }, { influencer_id: userId }]
    });
  }

  if (!chat && isValidObject) {
    chat = await Chat.findOne({
      application_id: paramId,
      $or: [{ brand_id: userId }, { influencer_id: userId }]
    });
  }

  if (!chat && isValidObject) {
    const Application = (await import('../models/Application.js')).default;
    const appDoc = await Application.findById(paramId).lean();
    if (appDoc) {
      let existing = await Chat.findOne({
        campaign_id: appDoc.campaign_id,
        influencer_id: appDoc.influencer_id
      });
      if (!existing) {
        const Campaign = (await import('../models/Campaign.js')).default;
        const camp = await Campaign.findById(appDoc.campaign_id).lean();
        existing = await Chat.create({
          application_id: appDoc._id,
          campaign_id: appDoc.campaign_id,
          brand_id: camp ? camp.brand_id : userId,
          influencer_id: appDoc.influencer_id,
          status: appDoc.status === 'accepted' ? 'accepted' : 'pending'
        });
      }
      chat = existing;
    }
  }
  return chat;
}

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
      ch.last_message = lastMsg ? (lastMsg.message_type === 'image' || (lastMsg.message && (lastMsg.message.startsWith('http') || lastMsg.message.startsWith('data:image')) && (lastMsg.message.includes('cloudinary') || lastMsg.message.includes('uploads') || lastMsg.message.endsWith('.jpg') || lastMsg.message.endsWith('.png') || lastMsg.message.endsWith('.jpeg') || lastMsg.message.endsWith('.webp'))) ? '📷 Photo' : lastMsg.message) : null;
      ch.last_message_time = lastMsg ? lastMsg.created_at : null;
      ch.unread_count = unreadCount;

      return ch;
    }));

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

    const chatDoc = await resolveChatDoc(chatId, userId);

    if (!chatDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat not found or unauthorized' 
      });
    }

    const chat = chatDoc.toObject ? chatDoc.toObject() : chatDoc;
    const actualChatId = chat._id.toString();

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

    const msgs = await ChatMessage.find({ chat_id: actualChatId }).sort({ created_at: 1 }).lean();

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

    await ChatMessage.updateMany(
      { chat_id: actualChatId, sender_id: { $ne: userId } },
      { is_read: true }
    );

    const Application = (await import('../models/Application.js')).default;
    const application = await Application.findOne({
      $or: [
        { campaign_id: chat.campaign_id, influencer_id: chat.influencer_id },
        { _id: chat.application_id }
      ]
    }).select('status deliverable_status escrow_amount submission_url').lean();

    const isDealLocked = chat.deal_locked || chat.status === 'accepted' || chat.status === 'locked' || chat.status === 'escrow_locked' || (application && (application.status === 'escrow_locked' || application.status === 'completed')) || !!chat.escrow_amount;
    const submissionUrl = chat.submission_url || (application ? application.submission_url : null);

    res.status(200).json({ 
      success: true, 
      chat: {
        ...chat,
        id: actualChatId,
        other_user_name: otherUserName,
        campaign_name: campaignName,
        current_user_role: req.user.role,
        is_brand_owner: isBrandUser,
        is_influencer: !isBrandUser,
        deal_locked: isDealLocked,
        submission_url: submissionUrl,
        deliverable_status: chat.deliverable_status || (application ? application.deliverable_status : 'pending'),
        cost_per_influencer: (campaign ? campaign.cost_per_influencer : null) || (application ? application.escrow_amount : 5000) || 5000,
        deal_amount: (campaign ? campaign.cost_per_influencer : null) || (application ? application.escrow_amount : null) || chat.escrow_amount || 5000
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

// Send a message (with 10 message free limit)
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

    // Strict Phone Number & Contact Sharing Restriction Guard
    const strippedText = String(message).replace(/[\s\-\.\(\)\+\/]/g, '');
    const containsPhone = /\d{10}/.test(strippedText) || /(?:91)?[6-9]\d{9}/.test(strippedText) || /(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s\-\.\,]*(?:zero|one|two|three|four|five|six|seven|eight|nine)[\s\-\.\,]*(?:zero|one|two|three|four|five|six|seven|eight|nine)/i.test(message);

    if (containsPhone) {
      return res.status(400).json({
        success: false,
        message: 'Action Restricted: Sharing phone numbers or contact details in chat is strictly prohibited on Fluencer for user safety.'
      });
    }

    const chatDoc = await resolveChatDoc(chatId, userId);

    if (!chatDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chat not found or unauthorized' 
      });
    }

    const actualChatId = chatDoc._id.toString();

    if (!chatDoc.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'Chat is no longer active' 
      });
    }

    // Check deal escrow payment status
    const Application = (await import('../models/Application.js')).default;
    const application = await Application.findOne({
      $or: [
        { campaign_id: chatDoc.campaign_id, influencer_id: chatDoc.influencer_id },
        { _id: chatDoc.application_id }
      ]
    }).lean();

    const isPaid = application && (application.status === 'escrow_locked' || application.status === 'completed');

    if (chatDoc.status === 'completed' || (application && (application.status === 'completed' || application.deliverable_status === 'approved'))) {
      return res.status(403).json({
        success: false,
        chat_completed: true,
        message: '🔒 This deal chat has been marked as COMPLETED. Work deliverable approved! No further messages can be sent.'
      });
    }

    if (!isPaid) {
      const userMessageCount = await ChatMessage.countDocuments({
        chat_id: actualChatId,
        message_type: { $ne: 'system' }
      });

      if (userMessageCount >= 10) {
        return res.status(403).json({
          success: false,
          free_limit_reached: true,
          message: '🔒 Free limit reached (10/10 messages). Brand must lock deal & deposit escrow to unlock unlimited chat!'
        });
      }
    }

    const result = await ChatMessage.create({
      chat_id: actualChatId,
      sender_id: userId,
      message: message.trim(),
      message_type: message_type || 'text',
      is_read: false
    });

    chatDoc.message_count += 1;
    await chatDoc.save();

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

// Upload image / photo for a chat
router.post('/:chatId/upload-image', authMiddleware, (req, res) => {
  uploadChatFile(req, res, async (err) => {
    try {
      const chatId = req.params.chatId;
      const userId = req.user.userId;

      const chatDoc = await resolveChatDoc(chatId, userId);
      if (!chatDoc) {
        return res.status(404).json({ success: false, message: 'Chat not found or unauthorized' });
      }

      const actualChatId = chatDoc._id.toString();

      if (!chatDoc.is_active) {
        return res.status(403).json({ success: false, message: 'Chat is no longer active' });
      }

      // Check deal escrow payment status
      const Application = (await import('../models/Application.js')).default;
      const application = await Application.findOne({
        $or: [
          { campaign_id: chatDoc.campaign_id, influencer_id: chatDoc.influencer_id },
          { _id: chatDoc.application_id }
        ]
      }).lean();

      const isPaid = application && (application.status === 'escrow_locked' || application.status === 'completed');

      if (chatDoc.status === 'completed' || (application && (application.status === 'completed' || application.deliverable_status === 'approved'))) {
        return res.status(403).json({
          success: false,
          chat_completed: true,
          message: '🔒 This deal chat has been marked as COMPLETED. Work deliverable approved!'
        });
      }

      if (!isPaid) {
        const userMessageCount = await ChatMessage.countDocuments({
          chat_id: actualChatId,
          message_type: { $ne: 'system' }
        });

        if (userMessageCount >= 10) {
          return res.status(403).json({
            success: false,
            free_limit_reached: true,
            message: '🔒 Free limit reached (10/10 messages). Brand must lock deal & deposit escrow to unlock unlimited chat!'
          });
        }
      }

      let imageUrl = req.fileUrl;

      // Fallback: If Cloudinary did not return a URL but file buffer or base64 was sent
      if (!imageUrl && req.file) {
        const fs = await import('fs');
        const path = await import('path');
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const ext = req.file.mimetype ? (req.file.mimetype.split('/')[1] || 'jpg') : 'jpg';
        const filename = `chat_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        imageUrl = `/uploads/${filename}`;
      } else if (!imageUrl && req.body && req.body.image_base64) {
        imageUrl = req.body.image_base64;
      }

      if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'No image file uploaded or provided' });
      }

      const result = await ChatMessage.create({
        chat_id: actualChatId,
        sender_id: userId,
        message: imageUrl,
        message_type: 'image',
        is_read: false
      });

      chatDoc.message_count += 1;
      await chatDoc.save();

      res.status(201).json({
        success: true,
        message: 'Photo sent successfully',
        messageId: result._id.toString(),
        imageUrl: imageUrl,
        chatMessage: {
          id: result._id.toString(),
          sender_id: userId,
          message: imageUrl,
          message_type: 'image',
          created_at: result.created_at
        }
      });
    } catch (error) {
      console.error('Image message send error:', error);
      res.status(500).json({ success: false, message: 'Failed to send image', error: error.message });
    }
  });
});

// Get chat details
router.get('/:chatId', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid Chat ID' });
    }

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

    const chatDoc = await resolveChatDoc(chatId, userId);
    if (!chatDoc) return res.status(404).json({ success: false, message: 'Chat not found' });
    
    const actualChatId = chatDoc._id.toString();
    const chat = chatDoc;

    if (chat.brand_id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only brand owner can lock deal' });
    }

    const Application = (await import('../models/Application.js')).default;
    const campaign = await Campaign.findById(chat.campaign_id);
    const application = await Application.findOne({
      $or: [
        { campaign_id: chat.campaign_id, influencer_id: chat.influencer_id },
        { _id: chat.application_id }
      ]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found for this chat' });
    }

    const dealAmount = (campaign ? campaign.cost_per_influencer : null) || (application ? application.escrow_amount : null) || 5000;

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

    application.status = 'escrow_locked';
    application.escrow_amount = dealAmount;
    await application.save();

    chat.status = 'escrow_locked';
    chat.deal_locked = true;
    chat.escrow_amount = dealAmount;
    await chat.save();

    // Post system message into Chat
    await ChatMessage.create({
      chat_id: actualChatId,
      sender_id: userId,
      message: `🛡️ Brand deposited ₹${dealAmount} into Escrow. Creator can now shoot and submit the reel.`,
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

    const chatDoc = await resolveChatDoc(chatId, userId);
    if (!chatDoc) return res.status(404).json({ success: false, message: 'Chat not found' });
    
    const actualChatId = chatDoc._id.toString();
    const chat = chatDoc;

    const Application = (await import('../models/Application.js')).default;
    let application = null;

    if (chat.application_id) {
      application = await Application.findById(chat.application_id);
    }

    if (!application) {
      application = await Application.findOne({
        $or: [
          { campaign_id: chat.campaign_id, influencer_id: chat.influencer_id },
          { campaign_id: chat.campaign_id, influencer_id: userId }
        ]
      });
    }

    if (application) {
      application.deliverable_status = 'submitted';
      application.submission_url = submission_url;
      application.submission_notes = submission_notes || '';
      application.submitted_at = new Date();
      await application.save();
    }

    chat.submission_url = submission_url;
    chat.deliverable_status = 'submitted';
    await chat.save();

    // Post system message into Chat
    await ChatMessage.create({
      chat_id: actualChatId,
      sender_id: userId,
      message: `🎬 Creator submitted Reel proof for brand review.`,
      message_type: 'system',
      is_read: false
    });

    res.json({
      success: true,
      message: 'Work Reel proof submitted successfully!',
      submission_url
    });
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

    const chatDoc = await resolveChatDoc(chatId, userId);
    if (!chatDoc) return res.status(404).json({ success: false, message: 'Chat not found' });
    
    const actualChatId = chatDoc._id.toString();
    const chat = chatDoc;

    const isBrandUser = req.user.role === 'brand' || chat.brand_id.toString() === userId.toString();
    if (!isBrandUser) {
      return res.status(403).json({ success: false, message: 'Only brand owner can approve work quality' });
    }

    const Application = (await import('../models/Application.js')).default;
    let application = null;

    if (chat.application_id) {
      application = await Application.findById(chat.application_id);
    }

    if (!application) {
      application = await Application.findOne({ campaign_id: chat.campaign_id, influencer_id: chat.influencer_id });
    }

    if (application) {
      application.deliverable_status = 'approved';
      application.status = 'completed';
      await application.save();
    }

    chat.deliverable_status = 'approved';
    chat.status = 'completed';
    await chat.save();

    // Transfer Escrow Payout directly to Influencer's Available Wallet Balance
    const campaign = await Campaign.findById(chat.campaign_id);
    const dealAmount = (campaign ? campaign.cost_per_influencer : null) || (application ? application.escrow_amount : null) || chat.escrow_amount || 5000;

    const influencerProfile = await InfluencerProfile.findOne({ user_id: chat.influencer_id });
    if (influencerProfile) {
      influencerProfile.escrow_balance = Math.max(0, (influencerProfile.escrow_balance || 0) - dealAmount);
      influencerProfile.wallet_balance = (influencerProfile.wallet_balance || 0) + dealAmount;
      influencerProfile.completed_campaigns = (influencerProfile.completed_campaigns || 0) + 1;
      await influencerProfile.save();
      console.log(`✅ Escrow Payout Transferred: ₹${dealAmount} credited to Influencer (${influencerProfile.name}). New Wallet Balance: ₹${influencerProfile.wallet_balance}`);
    }

    const brandProfile = await BrandProfile.findOne({ user_id: chat.brand_id });
    if (brandProfile) {
      brandProfile.escrow_balance = Math.max(0, (brandProfile.escrow_balance || 0) - dealAmount);
      await brandProfile.save();
    }

    try {
      const WalletTransaction = (await import('../models/WalletTransaction.js')).default;
      await WalletTransaction.create({
        user_id: chat.influencer_id,
        amount: dealAmount,
        type: 'credit',
        status: 'completed',
        description: `Escrow Payout Released: ₹${dealAmount} credited for "${campaign?.campaign_name || 'Campaign'}" Reel Approval`,
        created_at: new Date()
      });

      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create({
        target_id: chat.influencer_id,
        title: '🎉 Payout Released to Wallet!',
        message: `₹${dealAmount} has been credited to your Available Wallet for work approval on ${campaign?.campaign_name || 'Campaign'}!`,
        type: 'influencer',
        created_at: new Date()
      });
    } catch (txErr) {
      console.warn('Wallet transaction / notification creation warning:', txErr);
    }

    // Post system message into Chat
    await ChatMessage.create({
      chat_id: actualChatId,
      sender_id: userId,
      message: `✅ Work Approved · ₹${dealAmount} Escrow Payout Released to Creator Available Wallet!`,
      message_type: 'system',
      is_read: false
    });

    res.json({
      success: true,
      message: 'Deliverable quality approved successfully! Payout queued for Web Admin release.'
    });
  } catch (error) {
    console.error('In-chat approve work error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
