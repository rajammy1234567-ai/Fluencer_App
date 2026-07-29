import express from 'express';
import InfluencerProfile from '../models/InfluencerProfile.js';
import authMiddleware from '../middleware/auth.js';
import { uploadProfileImage } from '../middleware/upload.js';

const router = express.Router();

// Upload profile image
router.post('/upload-image', authMiddleware, (req, res) => {
  uploadProfileImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    try {
      // Return file URL
      const fileUrl = `/uploads/profiles/${req.file.filename}`;
      const userId = req.user.userId;

      // Update profile in database
      await InfluencerProfile.findOneAndUpdate(
        { user_id: userId },
        { profile_image: fileUrl },
        { upsert: true }
      );

      res.json({ 
        success: true, 
        message: 'Image uploaded successfully',
        imageUrl: fileUrl
      });
    } catch (error) {
       console.error('Database update error:', error);
       res.status(500).json({ 
         success: false, 
         message: 'Failed to update profile image in database'
       });
    }
  });
});

// Save influencer profile details
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, gender, categories, location, bio, instagram, youtube, twitter } = req.body;
    const userId = req.user.userId;

    if (!name || !categories || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, categories, and location are required' 
      });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one category must be selected' 
      });
    }
    
    // Convert undefined to null for optional fields
    const bioValue = bio || '';
    const instagramValue = instagram || null;
    const youtubeValue = youtube || null;
    const twitterValue = twitter || null;

    // Check if profile already exists
    const existingProfile = await InfluencerProfile.findOne({ user_id: userId });

    if (existingProfile) {
      // Update existing profile
      const finalGender = gender || existingProfile.gender;
      
      existingProfile.name = name;
      existingProfile.gender = finalGender;
      existingProfile.categories = categories;
      existingProfile.location = location;
      existingProfile.bio = bioValue;
      existingProfile.instagram = instagramValue;
      existingProfile.youtube = youtubeValue;
      existingProfile.twitter = twitterValue;
      
      await existingProfile.save();
    } else {
      if (!gender) {
          return res.status(400).json({ 
            success: false, 
            message: 'Gender is required for new profile' 
          });
      }
      // Create new profile
      await InfluencerProfile.create({
        user_id: userId,
        name,
        gender,
        categories,
        location,
        bio: bioValue,
        instagram: instagramValue,
        youtube: youtubeValue,
        twitter: twitterValue
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Profile saved successfully'
    });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save profile', 
      error: error.message 
    });
  }
});

// Update influencer profile details (PUT method with image & field support)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { profile_picture, profile_image, logo, name, bio, followers, location, instagram, youtube, twitter } = req.body;

    const updateData = {};
    if (profile_picture || profile_image || logo) {
      const picUrl = profile_picture || profile_image || logo;
      updateData.profile_picture = picUrl;
      updateData.profile_image = picUrl;
      updateData.logo = picUrl;
    }
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (followers) updateData.followers = followers;
    if (location) updateData.location = location;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (youtube !== undefined) updateData.youtube = youtube;
    if (twitter !== undefined) updateData.twitter = twitter;

    const profile = await InfluencerProfile.findOneAndUpdate(
      { user_id: userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile
    });
  } catch (error) {
    console.error('Influencer PUT profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update influencer profile', error: error.message });
  }
});

// Get influencer profile details
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await InfluencerProfile.findOne({ user_id: userId }).lean();

    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found'
      });
    }

    // Convert id field for client compatibility
    profile.id = profile._id.toString();

    const Application = (await import('../models/Application.js')).default;
    const totalCollabs = await Application.countDocuments({
      influencer_id: userId,
      status: { $in: ['accepted', 'completed', 'escrow_locked'] }
    });

    profile.collaborations = totalCollabs;
    profile.collabs = totalCollabs;
    profile.followers = profile.followers || '125K';
    profile.rating = profile.rating || 4.9;

    res.status(200).json({ 
      success: true, 
      profile: profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
});

// Get any influencer public profile & portfolio by userId or id (for Brands & Public View)
router.get('/profile/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    let profile = await InfluencerProfile.findOne({
      $or: [{ user_id: id }, { _id: id }]
    }).lean();

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Influencer profile not found' });
    }

    profile.id = profile._id.toString();
    profile.followers = profile.followers || '125K';
    profile.rating = profile.rating || 4.9;
    profile.portfolio = profile.portfolio || [];

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Public profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch public profile', error: error.message });
  }
});

// Check if profile exists
router.get('/profile-exists', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await InfluencerProfile.findOne({ user_id: userId });

    res.status(200).json({ 
      success: true, 
      exists: !!profile
    });
  } catch (error) {
    console.error('Profile check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check profile', 
      error: error.message 
    });
  }
});

// Update follower count manually
router.post('/update-followers', authMiddleware, async (req, res) => {
  try {
    const { followers } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!followers) {
      return res.status(400).json({ success: false, message: 'Followers count string is required' });
    }

    const profile = await InfluencerProfile.findOneAndUpdate(
      { user_id: userId },
      { followers: String(followers).trim() },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Follower count updated successfully!', followers: profile.followers });
  } catch (error) {
    console.error('Follower update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update follower count', error: error.message });
  }
});

// Unlock ₹499 Pro Membership Campaign Pass for Creator
router.post('/unlock-pass', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const profile = await InfluencerProfile.findOneAndUpdate(
      { user_id: userId },
      { 
        is_pro_member: true,
        pro_unlocked_at: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: '🎉 Pro Membership (₹499) Unlocked Successfully! You can now view and apply to all brand campaigns.',
      is_pro_member: true,
      profile
    });
  } catch (error) {
    console.error('Pro pass unlock error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlock Pro Membership pass', error: error.message });
  }
});

// Add portfolio item (photo or reel)
router.post('/portfolio', authMiddleware, async (req, res) => {
  try {
    const { type, url, title } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, message: 'Media URL is required' });
    }

    const newItem = {
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: type === 'reel' ? 'reel' : 'photo',
      url: url.trim(),
      title: title ? String(title).trim() : '',
      created_at: new Date()
    };

    const profile = await InfluencerProfile.findOneAndUpdate(
      { user_id: userId },
      { $push: { portfolio: newItem } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Portfolio item added successfully!',
      portfolioItem: newItem,
      portfolio: profile.portfolio || []
    });
  } catch (error) {
    console.error('Portfolio add error:', error);
    res.status(500).json({ success: false, message: 'Failed to add portfolio item', error: error.message });
  }
});

// Delete portfolio item
router.delete('/portfolio/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const profile = await InfluencerProfile.findOneAndUpdate(
      { user_id: userId },
      { $pull: { portfolio: { id: id } } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Portfolio item deleted successfully!',
      portfolio: profile ? profile.portfolio : []
    });
  } catch (error) {
    console.error('Portfolio delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete portfolio item', error: error.message });
  }
});

export default router;
