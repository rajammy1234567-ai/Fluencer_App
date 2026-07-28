import express from 'express';
import { query } from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Create a new campaign
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Support both snake_case (from frontend) and camelCase
    const campaignName = req.body.campaign_name || req.body.campaignName;
    const influencerLocation = req.body.influencer_location || req.body.influencerLocation;
    const campaignType = req.body.campaign_type || req.body.campaignType;
    const contentType = req.body.content_type || req.body.contentType;
    const numberOfSeats = req.body.number_of_seats || req.body.numberOfSeats;
    const minFollowers = req.body.min_followers || req.body.minFollowers;
    const costPerInfluencer = req.body.cost_per_influencer || req.body.costPerInfluencer;
    const description = req.body.description;
    
    const brandId = req.user.userId;

    console.log('Campaign data received:', { campaignName, influencerLocation, campaignType, contentType, numberOfSeats });

    if (!campaignName || !influencerLocation || !campaignType || !contentType || !numberOfSeats) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled',
        received: { campaignName, influencerLocation, campaignType, contentType, numberOfSeats }
      });
    }

    const insertResult = await query(
      `INSERT INTO campaigns (
        brand_id, 
        campaign_name, 
        influencer_location, 
        campaign_type, 
        content_type, 
        number_of_seats, 
        min_followers, 
        cost_per_influencer, 
        description,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        brandId,
        campaignName,
        influencerLocation,
        campaignType,
        contentType,
        numberOfSeats,
        minFollowers || 0,
        costPerInfluencer || 0,
        description || null
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Campaign created successfully',
      campaignId: insertResult.insertId
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create campaign', 
      error: error.message 
    });
  }
});

// Get all campaigns for a brand
router.get('/my-campaigns', authMiddleware, async (req, res) => {
  try {
    const brandId = req.user.userId;

    const campaigns = await query(
      `SELECT 
        c.*,
        COUNT(DISTINCT ca.id) as applications_count,
        COUNT(DISTINCT CASE WHEN ca.status = 'accepted' THEN ca.id END) as accepted_count
      FROM campaigns c
      LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
      WHERE c.brand_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [brandId]
    );

    res.status(200).json({ 
      success: true, 
      campaigns: campaigns
    });
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch campaigns', 
      error: error.message 
    });
  }
});

// Get single campaign details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;

    const campaigns = await query(
      'SELECT * FROM campaigns WHERE id = ?',
      [campaignId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found'
      });
    }

    res.status(200).json({ 
      success: true, 
      campaign: campaigns[0]
    });
  } catch (error) {
    console.error('Campaign fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch campaign', 
      error: error.message 
    });
  }
});

// Get all active campaigns (for influencers)
// Get ALL campaigns for admin (no status filter)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const campaigns = await query(
      `SELECT 
        c.*,
        bp.company_name,
        bp.profile_image as brand_image,
        bp.category as brand_category
      FROM campaigns c
      INNER JOIN brand_profiles bp ON c.brand_id = bp.user_id
      ORDER BY c.created_at DESC`
    );

    res.status(200).json({ 
      success: true, 
      campaigns: campaigns
    });
  } catch (error) {
    console.error('All campaigns fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch campaigns', 
      error: error.message 
    });
  }
});

router.get('/active/all', authMiddleware, async (req, res) => {
  try {
    const campaigns = await query(
      `SELECT 
        c.*,
        bp.company_name,
        bp.profile_image as brand_image,
        bp.category as brand_category
      FROM campaigns c
      INNER JOIN brand_profiles bp ON c.brand_id = bp.user_id
      WHERE c.status = 'active'
      ORDER BY c.created_at DESC`
    );

    res.status(200).json({ 
      success: true, 
      campaigns: campaigns
    });
  } catch (error) {
    console.error('Active campaigns fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch campaigns', 
      error: error.message 
    });
  }
});

// Update campaign
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const brandId = req.user.userId;
    const updateData = req.body;

    // Verify ownership
    const campaigns = await query(
      'SELECT * FROM campaigns WHERE id = ? AND brand_id = ?',
      [campaignId, brandId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found or unauthorized'
      });
    }

    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update'
      });
    }

    values.push(campaignId);

    await query(
      `UPDATE campaigns SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.status(200).json({ 
      success: true, 
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Campaign update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update campaign', 
      error: error.message 
    });
  }
});

// Delete campaign
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const brandId = req.user.userId;

    // Verify ownership
    const campaigns = await query(
      'SELECT * FROM campaigns WHERE id = ? AND brand_id = ?',
      [campaignId, brandId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found or unauthorized'
      });
    }

    await query('DELETE FROM campaigns WHERE id = ?', [campaignId]);

    res.status(200).json({ 
      success: true, 
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Campaign delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete campaign', 
      error: error.message 
    });
  }
});

// Get campaign applications (for brand to see who applied)
router.get('/:id/applications', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const Application = (await import('../models/Application.js')).default;
    const InfluencerProfile = (await import('../models/InfluencerProfile.js')).default;
    const User = (await import('../models/User.js')).default;
    const Chat = (await import('../models/Chat.js')).default;

    const apps = await Application.find({ campaign_id: campaignId }).lean();
    
    const applications = await Promise.all(apps.map(async (app) => {
      const ip = await InfluencerProfile.findOne({ user_id: app.influencer_id }).lean();
      const user = await User.findById(app.influencer_id).lean();
      const chatDoc = await Chat.findOne({ 
        $or: [
          { application_id: app._id },
          { campaign_id: app.campaign_id, influencer_id: app.influencer_id }
        ]
      }).lean();

      const chatId = chatDoc ? chatDoc._id.toString() : app._id.toString();

      return {
        ...app,
        id: app._id.toString(),
        chat_id: chatId,
        influencer_name: ip ? (ip.name || 'Ananya Sharma') : 'Influencer',
        location: ip ? ip.location : 'Mumbai, MH',
        categories: ip ? ip.categories : ['Fashion'],
        followers: ip ? (ip.followers || (ip.followers_count ? (ip.followers_count >= 1000 ? (ip.followers_count / 1000).toFixed(1) + 'K' : String(ip.followers_count)) : '0')) : '0',
        followers_count: ip ? (ip.followers_count || 0) : 0,
        profile_image: ip ? ip.profile_image : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
        influencer_email: user ? user.email : 'influencer@fluencer.app'
      };
    }));

    res.status(200).json({ 
      success: true, 
      applications: applications
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(200).json({ 
      success: true, 
      applications: [] 
    });
  }
});

// Apply to campaign (influencer side)
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const influencerId = req.user.userId;
    const { message } = req.body;

    // Check if already applied
    const existing = await query(
      'SELECT * FROM campaign_applications WHERE campaign_id = ? AND influencer_id = ?',
      [campaignId, influencerId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already applied to this campaign'
      });
    }

    await query(
      'INSERT INTO campaign_applications (campaign_id, influencer_id, message, status, created_at) VALUES (?, ?, ?, "pending", NOW())',
      [campaignId, influencerId, message || null]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to apply to campaign', 
      error: error.message 
    });
  }
});

// Accept/Reject application (brand side)
router.put('/applications/:id/status', authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;
    const brandId = req.user.userId;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be accepted or rejected'
      });
    }

    // Verify brand owns the campaign
    const applications = await query(
      `SELECT ca.*, c.brand_id
      FROM campaign_applications ca
      INNER JOIN campaigns c ON ca.campaign_id = c.id
      WHERE ca.id = ? AND c.brand_id = ?`,
      [applicationId, brandId]
    );

    if (applications.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found or unauthorized'
      });
    }

    await query(
      'UPDATE campaign_applications SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, applicationId]
    );

    res.status(200).json({ 
      success: true, 
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update application status', 
      error: error.message 
    });
  }
});

export default router;
