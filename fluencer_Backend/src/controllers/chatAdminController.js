/**
 * Chat Admin Controller
 * Handles all admin-side chat monitoring and management
 */

import Chat from '../models/Chat.js';
import ChatMessage from '../models/ChatMessage.js';
import Campaign from '../models/Campaign.js';
import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import User from '../models/User.js';

/**
 * Get all chats with details
 */
export const getAllChats = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    const filter = {};
    if (status === 'active') {
      filter.is_active = true;
    } else if (status === 'inactive') {
      filter.is_active = false;
    }

    const chatsList = await Chat.find(filter).lean();
    
    const detailedChats = await Promise.all(chatsList.map(async (ch) => {
      const campaign = await Campaign.findById(ch.campaign_id).select('campaign_name campaign_type').lean();
      const bp = await BrandProfile.findOne({ user_id: ch.brand_id }).select('company_name profile_image').lean();
      const ip = await InfluencerProfile.findOne({ user_id: ch.influencer_id }).select('name profile_image').lean();
      const lastMsg = await ChatMessage.findOne({ chat_id: ch._id }).sort({ created_at: -1 }).lean();

      return {
        id: ch._id.toString(),
        campaign_id: ch.campaign_id.toString(),
        brand_id: ch.brand_id.toString(),
        influencer_id: ch.influencer_id.toString(),
        message_count: ch.message_count,
        max_messages: ch.max_messages,
        is_active: ch.is_active,
        created_at: ch.created_at,
        updated_at: ch.updated_at,
        campaign_name: campaign ? campaign.campaign_name : '',
        campaign_type: campaign ? campaign.campaign_type : '',
        brand_name: bp ? bp.company_name : '',
        brand_image: bp ? bp.profile_image : null,
        influencer_name: ip ? ip.name : '',
        influencer_image: ip ? ip.profile_image : null,
        last_message: lastMsg ? lastMsg.message : null,
        last_message_time: lastMsg ? lastMsg.created_at : null
      };
    }));

    // Filter by search terms on populated fields
    let filteredChats = detailedChats;
    if (search) {
      const regex = new RegExp(search, 'i');
      filteredChats = detailedChats.filter(ch => 
        regex.test(ch.campaign_name) || regex.test(ch.brand_name) || regex.test(ch.influencer_name)
      );
    }

    const total = filteredChats.length;
    const paginated = filteredChats.slice(offset, offset + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message,
    });
  }
};

/**
 * Get chat details with all messages
 */
export const getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;

    const ch = await Chat.findById(chatId).lean();

    if (!ch) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    const campaign = await Campaign.findById(ch.campaign_id).select('campaign_name campaign_type content_type').lean();
    const bp = await BrandProfile.findOne({ user_id: ch.brand_id }).select('company_name profile_image').lean();
    const ip = await InfluencerProfile.findOne({ user_id: ch.influencer_id }).select('name profile_image').lean();

    const chat = {
      id: ch._id.toString(),
      campaign_id: ch.campaign_id.toString(),
      brand_id: ch.brand_id.toString(),
      influencer_id: ch.influencer_id.toString(),
      message_count: ch.message_count,
      max_messages: ch.max_messages,
      is_active: ch.is_active,
      created_at: ch.created_at,
      updated_at: ch.updated_at,
      campaign_name: campaign ? campaign.campaign_name : '',
      campaign_type: campaign ? campaign.campaign_type : '',
      content_type: campaign ? campaign.content_type : '',
      brand_name: bp ? bp.company_name : '',
      brand_image: bp ? bp.profile_image : null,
      influencer_name: ip ? ip.name : '',
      influencer_image: ip ? ip.profile_image : null
    };

    // Get all messages
    const msgs = await ChatMessage.find({ chat_id: chatId }).sort({ created_at: 1 }).lean();

    const messages = msgs.map(cm => {
      return {
        id: cm._id.toString(),
        chat_id: cm.chat_id.toString(),
        sender_id: cm.sender_id.toString(),
        message: cm.message,
        message_type: cm.message_type,
        is_read: cm.is_read,
        created_at: cm.created_at,
        sender_type: cm.sender_id.toString() === chat.brand_id ? 'brand' : 'influencer',
        sender_name: cm.sender_id.toString() === chat.brand_id ? chat.brand_name : chat.influencer_name
      };
    });

    res.status(200).json({
      success: true,
      data: {
        chat,
        messages,
      },
    });
  } catch (error) {
    console.error('Get chat details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat details',
      error: error.message,
    });
  }
};


/**
 * Get chat statistics
 */
export const getChatStats = async (req, res) => {
  try {
    const totalChats = await Chat.countDocuments({});
    const activeChats = await Chat.countDocuments({ is_active: true });
    const totalMessages = await ChatMessage.countDocuments({});

    const avgResult = await Chat.aggregate([
      { $group: { _id: null, avg: { $avg: '$message_count' } } }
    ]);
    const avgMessages = Math.round(avgResult[0]?.avg || 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await ChatMessage.countDocuments({ created_at: { $gte: sevenDaysAgo } });

    const topChatsList = await Chat.find({}).sort({ message_count: -1 }).limit(5).lean();

    const topChats = await Promise.all(topChatsList.map(async (ch) => {
      const c = await Campaign.findById(ch.campaign_id).select('campaign_name').lean();
      const bp = await BrandProfile.findOne({ user_id: ch.brand_id }).select('company_name').lean();
      const ip = await InfluencerProfile.findOne({ user_id: ch.influencer_id }).select('name').lean();

      return {
        id: ch._id.toString(),
        campaign_name: c ? c.campaign_name : '',
        brand_name: bp ? bp.company_name : '',
        influencer_name: ip ? ip.name : '',
        message_count: ch.message_count
      };
    }));

    

    res.status(200).json({
      success: true,
      data: {
        totalChats,
        activeChats,
        inactiveChats: totalChats - activeChats,
        totalMessages,
        avgMessages,
        recentActivity,
        topChats,
      },
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat statistics',
      error: error.message,
    });
  }
};

/**
 * Toggle chat active status
 */
export const toggleChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { is_active } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    chat.is_active = !!is_active;
    await chat.save();

    res.status(200).json({
      success: true,
      message: `Chat ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle chat status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat status',
      error: error.message,
    });
  }
};

/**
 * Search messages
 */
export const searchMessages = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!search || search.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const filter = { message: { $regex: search, $options: 'i' } };
    const total = await ChatMessage.countDocuments(filter);
    
    const list = await ChatMessage.find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const messages = await Promise.all(list.map(async (cm) => {
      const ch = await Chat.findById(cm.chat_id).lean();
      let campaignName = '';
      let senderName = '';
      let senderType = 'influencer';

      if (ch) {
        const c = await Campaign.findById(ch.campaign_id).select('campaign_name').lean();
        campaignName = c ? c.campaign_name : '';
        
        if (cm.sender_id.toString() === ch.brand_id.toString()) {
          const bp = await BrandProfile.findOne({ user_id: ch.brand_id }).select('company_name').lean();
          senderName = bp ? bp.company_name : 'Brand';
          senderType = 'brand';
        } else {
          const ip = await InfluencerProfile.findOne({ user_id: ch.influencer_id }).select('name').lean();
          senderName = ip ? ip.name : 'Influencer';
        }
      }

      return {
        id: cm._id.toString(),
        chat_id: cm.chat_id.toString(),
        message: cm.message,
        message_type: cm.message_type,
        created_at: cm.created_at,
        campaign_id: ch ? ch.campaign_id.toString() : '',
        campaign_name: campaignName,
        sender_name: senderName,
        sender_type: senderType
      };
    }));

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages',
      error: error.message,
    });
  }
};
