import express from 'express';
import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import Chat from '../models/Chat.js';
import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// ==================== BUSINESS ROUTES ====================

// Create a new campaign (Business only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      campaign_name,
      influencer_location,
      campaign_type,
      content_type,
      number_of_seats,
      min_followers,
      cost_per_influencer,
      description,
      reference_images,
      shooting_location_guide,
      sample_reel_url,
      guidelines
    } = req.body;
    
    const brandId = req.user.userId;
    const role = req.user.role;

    // Verify user is a brand
    if (role !== 'brand') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only brands can create campaigns' 
      });
    }

    if (!campaign_name || !influencer_location || !campaign_type || !content_type || !number_of_seats) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled' 
      });
    }

    const campaign = await Campaign.create({
      brand_id: brandId,
      campaign_name,
      influencer_location,
      campaign_type,
      content_type,
      number_of_seats,
      min_followers: min_followers || 0,
      cost_per_influencer: cost_per_influencer || 0,
      description: description || '',
      reference_images: reference_images || [],
      shooting_location_guide: shooting_location_guide || '',
      sample_reel_url: sample_reel_url || '',
      guidelines: guidelines || '',
      status: 'open'
    });

    res.status(201).json({ 
      success: true, 
      message: 'Campaign created successfully',
      campaignId: campaign._id.toString()
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

// Get all campaigns for a brand (Business only)
router.get('/my-campaigns', authMiddleware, async (req, res) => {
  try {
    const brandId = req.user.userId;
    const role = req.user.role;

    if (role !== 'brand') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const campaignsList = await Campaign.find({ brand_id: brandId, is_deleted: false }).lean();

    const campaigns = await Promise.all(campaignsList.map(async (c) => {
      const apps = await Application.find({ campaign_id: c._id });
      c.id = c._id.toString();
      c.applications_count = apps.length;
      c.accepted_count = apps.filter(a => a.status === 'accepted').length;
      c.pending_count = apps.filter(a => a.status === 'pending').length;
      return c;
    }));

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

// Get applications for a specific campaign (Business only)
router.get('/:id/applications', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const brandId = req.user.userId;
    const role = req.user.role;

    if (role !== 'brand') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Verify campaign belongs to this brand
    const campaign = await Campaign.findOne({ _id: campaignId, brand_id: brandId });

    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found or unauthorized' 
      });
    }

    const apps = await Application.find({ campaign_id: campaignId }).lean();

    const applications = await Promise.all(apps.map(async (app) => {
      const influencer = await User.findById(app.influencer_id).select('email').lean();
      const profile = await InfluencerProfile.findOne({ user_id: app.influencer_id }).lean();

      app.id = app._id.toString();
      app.influencer_name = profile ? profile.name : 'Influencer';
      app.profile_image = profile ? profile.profile_image : null;
      app.followers_count = profile ? profile.followers_count : 0;
      app.location = profile ? profile.location : '';
      app.categories = profile ? profile.categories : [];
      app.email = influencer ? influencer.email : '';
      return app;
    }));

    res.status(200).json({ 
      success: true, 
      applications: applications
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications', 
      error: error.message 
    });
  }
});

// Accept an influencer application (Business only) - Creates chat
router.post('/applications/:applicationId/accept', authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const brandId = req.user.userId;
    const role = req.user.role;

    if (role !== 'brand') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Get application details
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    const campaign = await Campaign.findOne({ _id: application.campaign_id, brand_id: brandId });
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found or unauthorized' 
      });
    }

    // Lock Escrow from Brand Wallet
    const requiredAmount = campaign.cost_per_influencer || 0;
    const brandProfile = await BrandProfile.findOne({ user_id: brandId });

    if (brandProfile && requiredAmount > 0) {
      // Auto Top-Up in simulation/test mode if balance is 0
      if ((brandProfile.wallet_balance || 0) < requiredAmount) {
        brandProfile.wallet_balance = (brandProfile.wallet_balance || 0) + requiredAmount + 10000;
        await WalletTransaction.create({
          user_id: brandId,
          user_role: 'brand',
          type: 'deposit',
          amount: requiredAmount + 10000,
          status: 'completed',
          description: 'Auto Simulation Top-Up for Deal Acceptance',
          reference_id: `AUTO_${Date.now()}`
        });
      }

      // Deduct from brand wallet & move to brand escrow balance
      brandProfile.wallet_balance -= requiredAmount;
      brandProfile.escrow_balance = (brandProfile.escrow_balance || 0) + requiredAmount;
      await brandProfile.save();

      // Log Escrow Lock Transaction for Brand
      await WalletTransaction.create({
        user_id: brandId,
        user_role: 'brand',
        type: 'escrow_lock',
        amount: requiredAmount,
        status: 'completed',
        description: `Escrow Locked for Campaign: ${campaign.campaign_name}`,
        reference_id: application._id.toString()
      });

      // Credit Influencer Escrow Balance (Reflects in Pending Escrow Balance, Non-Withdrawable until payout)
      const influencerProfile = await InfluencerProfile.findOne({ user_id: application.influencer_id });
      if (influencerProfile) {
        influencerProfile.escrow_balance = (influencerProfile.escrow_balance || 0) + requiredAmount;
        await influencerProfile.save();

        // Log Pending Escrow Lock for Influencer
        await WalletTransaction.create({
          user_id: application.influencer_id,
          user_role: 'influencer',
          type: 'escrow_lock',
          amount: requiredAmount,
          status: 'pending',
          description: `Deal Locked: ₹${requiredAmount} held in Escrow for ${campaign.campaign_name}`,
          reference_id: application._id.toString()
        });
      }
    }

    // Update application status
    application.status = 'accepted';
    application.escrow_amount = requiredAmount;
    application.deliverable_status = 'pending';
    await application.save();

    // Create chat between brand and influencer
    let chat = await Chat.findOne({
      campaign_id: application.campaign_id,
      brand_id: brandId,
      influencer_id: application.influencer_id
    });

    if (!chat) {
      chat = await Chat.create({
        campaign_id: application.campaign_id,
        application_id: application._id,
        brand_id: brandId,
        influencer_id: application.influencer_id,
        message_count: 0,
        max_messages: 10,
        is_active: true
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `Influencer accepted! ₹${requiredAmount} locked in Escrow. Chat opened.`,
      chatId: chat._id.toString(),
      escrow_amount: requiredAmount
    });
  } catch (error) {
    console.error('Accept application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept application', 
      error: error.message 
    });
  }
});

// Submit Work Deliverable (Influencer)
router.post('/applications/:id/submit-work', authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const influencerId = req.user.userId;
    const { submission_url, submission_notes } = req.body;

    if (!submission_url) {
      return res.status(400).json({ success: false, message: 'Please provide a valid video link or post URL' });
    }

    const application = await Application.findOne({ _id: applicationId, influencer_id: influencerId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
    }

    application.submission_url = submission_url;
    application.submission_notes = submission_notes || '';
    application.submitted_at = new Date();
    application.deliverable_status = 'submitted';
    await application.save();

    res.json({
      success: true,
      message: 'Work deliverable submitted successfully! Brand will review your submission.',
      data: application
    });
  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve Work Deliverable (Brand)
router.post('/applications/:id/approve-work', authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const brandId = req.user.userId;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const campaign = await Campaign.findOne({ _id: application.campaign_id, brand_id: brandId });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Unauthorized or campaign not found' });
    }

    application.deliverable_status = 'brand_approved';
    await application.save();

    res.json({
      success: true,
      message: 'Work approved! Admin can now release the Escrow payout to Influencer.',
      data: application
    });
  } catch (error) {
    console.error('Approve work error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all applications for all campaigns owned by this brand
router.get('/applications/all', authMiddleware, async (req, res) => {
  try {
    const brandId = req.user.userId;
    const role = req.user.role;

    if (role !== 'brand') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const brandCampaigns = await Campaign.find({ brand_id: brandId }).select('_id campaign_name brand_id').lean();
    const campaignIds = brandCampaigns.map(c => c._id);

    const apps = await Application.find({ campaign_id: { $in: campaignIds } }).lean();

    const applications = await Promise.all(apps.map(async (app) => {
      const c = brandCampaigns.find(cam => cam._id.toString() === app.campaign_id.toString());
      const influencer = await User.findById(app.influencer_id).select('email').lean();
      const profile = await InfluencerProfile.findOne({ user_id: app.influencer_id }).lean();
      const chat = await Chat.findOne({
        campaign_id: app.campaign_id,
        brand_id: brandId,
        influencer_id: app.influencer_id
      }).select('_id').lean();

      app.id = app._id.toString();
      app.campaign_name = c ? c.campaign_name : '';
      app.influencer_name = profile ? profile.name : 'Influencer';
      app.profile_image = profile ? profile.profile_image : null;
      app.followers_count = profile ? profile.followers_count : 0;
      app.location = profile ? profile.location : '';
      app.categories = profile ? profile.categories : [];
      app.email = influencer ? influencer.email : '';
      app.chat_id = chat ? chat._id.toString() : null;
      return app;
    }));

    // Sort by status pending first, then by date desc
    applications.sort((a, b) => {
      const statusOrder = { pending: 1, accepted: 2, rejected: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    res.status(200).json({ 
      success: true, 
      applications: applications
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications', 
      error: error.message 
    });
  }
});

// Reject an influencer application (Business only)
router.post('/applications/:applicationId/reject', authMiddleware, async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const brandId = req.user.userId;
    const role = req.user.role;

    if (role !== 'brand') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    const campaign = await Campaign.findOne({ _id: application.campaign_id, brand_id: brandId });
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found or unauthorized' 
      });
    }

    application.status = 'rejected';
    await application.save();

    res.status(200).json({ 
      success: true, 
      message: 'Application rejected successfully'
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject application', 
      error: error.message 
    });
  }
});

// ==================== INFLUENCER ROUTES ====================

// Get all active campaigns (Visible to every single user)
router.get('/active/all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const campaignsList = await Campaign.find({ is_deleted: false }).lean();

    const campaigns = await Promise.all(campaignsList.map(async (c) => {
      const bp = await BrandProfile.findOne({ user_id: c.brand_id }).lean();
      const app = await Application.findOne({ campaign_id: c._id, influencer_id: userId }).lean();

      c.id = c._id.toString();
      c.company_name = bp ? bp.company_name : 'Brand';
      c.brand_image = bp ? bp.profile_image : null;
      c.brand_category = bp ? bp.category : '';
      c.brand_description = bp ? bp.description : '';
      c.application_status = app ? app.status : null;
      return c;
    }));

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

// Apply to a campaign (Influencer only)
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const influencerId = req.user.userId;
    const role = req.user.role;
    const { message } = req.body;

    if (role !== 'influencer') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only influencers can apply to campaigns' 
      });
    }

    // Check if campaign exists
    const campaign = await Campaign.findById(campaignId);

    if (!campaign || campaign.is_deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found or not available' 
      });
    }

    // Check if already applied
    const existing = await Application.findOne({ campaign_id: campaignId, influencer_id: influencerId });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied to this campaign' 
      });
    }

    // Create application
    const result = await Application.create({
      campaign_id: campaignId,
      influencer_id: influencerId,
      message: message || '',
      status: 'pending'
    });

    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully',
      applicationId: result._id.toString()
    });
  } catch (error) {
    console.error('Apply to campaign error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to apply to campaign', 
      error: error.message 
    });
  }
});

// Get my applications (Influencer only)
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const influencerId = req.user.userId;
    const role = req.user.role;

    if (role !== 'influencer') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    const apps = await Application.find({ influencer_id: influencerId }).lean();

    const applications = await Promise.all(apps.map(async (app) => {
      const c = await Campaign.findById(app.campaign_id).lean();
      let companyName = 'Brand';
      let brandImage = null;

      if (c) {
        const bp = await BrandProfile.findOne({ user_id: c.brand_id }).select('company_name profile_image').lean();
        if (bp) {
          companyName = bp.company_name;
          brandImage = bp.profile_image;
        }
      }

      app.id = app._id.toString();
      app.campaign_name = c ? c.campaign_name : '';
      app.campaign_type = c ? c.campaign_type : '';
      app.content_type = c ? c.content_type : '';
      app.cost_per_influencer = c ? c.cost_per_influencer : 0;
      app.company_name = companyName;
      app.brand_image = brandImage;
      return app;
    }));

    res.status(200).json({ 
      success: true, 
      applications: applications
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications', 
      error: error.message 
    });
  }
});

// ==================== COMMON ROUTES ====================

// Get single campaign details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;

    const campaign = await Campaign.findById(campaignId).lean();

    if (!campaign || campaign.is_deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found'
      });
    }

    const bp = await BrandProfile.findOne({ user_id: campaign.brand_id }).select('company_name profile_image category').lean();

    campaign.id = campaign._id.toString();
    campaign.company_name = bp ? bp.company_name : 'Brand';
    campaign.brand_image = bp ? bp.profile_image : null;
    campaign.brand_category = bp ? bp.category : '';

    res.status(200).json({ 
      success: true, 
      campaign: campaign
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

// Update campaign (Business only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const brandId = req.user.userId;
    const role = req.user.role;
    const updateData = req.body;

    if (role !== 'brand') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Verify ownership
    const campaign = await Campaign.findOne({ _id: campaignId, brand_id: brandId });

    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found or unauthorized'
      });
    }

    // Dynamically update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        campaign[key] = updateData[key];
      }
    });

    await campaign.save();

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

// Delete campaign (soft delete) (Business only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const brandId = req.user.userId;
    const role = req.user.role;

    if (role !== 'brand') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Verify ownership
    const campaign = await Campaign.findOne({ _id: campaignId, brand_id: brandId });

    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found or unauthorized' 
      });
    }

    // Mark as completed/deleted
    campaign.status = 'closed';
    campaign.is_deleted = true;
    await campaign.save();

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

export default router;
