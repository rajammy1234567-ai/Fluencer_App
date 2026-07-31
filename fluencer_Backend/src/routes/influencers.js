import express from 'express';
import InfluencerProfile from '../models/InfluencerProfile.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import { uploadProfileImage } from '../middleware/upload.js';

const router = express.Router();

// Upload profile image
router.post('/upload-image', authMiddleware, (req, res) => {
  uploadProfileImage(req, res, async (err) => {
    try {
      const fileUrl = req.fileUrl || (req.file ? `/uploads/profiles/${req.file.filename}` : (req.body ? (req.body.image_url || req.body.profile_image || req.body.profile_picture) : null));
      const userId = req.user.userId || req.user.id;

      if (!fileUrl) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file or image URL provided' 
        });
      }

      // Update profile in database
      const profile = await InfluencerProfile.findOneAndUpdate(
        { user_id: userId },
        { $set: { profile_picture: fileUrl, profile_image: fileUrl } },
        { new: true, upsert: true }
      );

      res.json({ 
        success: true, 
        message: 'Profile image uploaded successfully',
        imageUrl: fileUrl,
        profile
      });
    } catch (error) {
       console.error('Database update error:', error);
       res.status(500).json({ 
         success: false, 
         message: 'Failed to update profile image in database',
         error: error.message
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
    const { profile_picture, profile_image, logo, name, bio, followers, location, instagram, youtube, twitter, phone } = req.body;

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
    
    if (phone !== undefined && phone !== null) {
      const cleanPhone = String(phone).replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number must be a valid 10-digit mobile number' 
        });
      }
      updateData.phone = cleanPhone;
      try {
        const User = (await import('../models/User.js')).default;
        await User.findByIdAndUpdate(userId, { phone: cleanPhone });
      } catch (uErr) {
        console.error('Failed to sync user phone:', uErr);
      }
    }

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

    try {
      const user = await User.findById(userId).lean();
      profile.wallet_balance = (user && typeof user.wallet_balance === 'number') ? user.wallet_balance : 30000;
      profile.escrow_balance = (user && typeof user.escrow_balance === 'number') ? user.escrow_balance : 0;
    } catch (uErr) {
      profile.wallet_balance = 30000;
      profile.escrow_balance = 0;
    }

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

// Helper to parse follower count string into count integer and clean text with strict validation
function parseFollowerNumber(val) {
  if (!val) return null;
  const raw = String(val).trim();
  if (!raw) return null;
  
  // Reject invalid strings (e.g. non-numeric, special symbols except K/M/comma/dot)
  if (!/^[0-9,.\s]+[KMkm]?$/.test(raw)) {
    return null;
  }
  
  const str = raw.toUpperCase();
  let count = 0;
  if (str.endsWith('M')) {
    const numPart = parseFloat(str.replace('M', '').trim());
    if (isNaN(numPart) || numPart <= 0) return null;
    count = Math.round(numPart * 1000000);
  } else if (str.endsWith('K')) {
    const numPart = parseFloat(str.replace('K', '').trim());
    if (isNaN(numPart) || numPart <= 0) return null;
    count = Math.round(numPart * 1000);
  } else {
    const cleanNum = parseInt(str.replace(/,/g, ''), 10);
    if (isNaN(cleanNum) || cleanNum <= 0) return null;
    count = cleanNum;
  }
  
  if (count <= 0) return null;
  
  let text = '';
  if (count >= 1000000) {
    text = (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (count >= 1000) {
    text = (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    text = String(count);
  }
  
  return { text, count };
}

// Update follower count manually with strict validation
router.post('/update-followers', authMiddleware, async (req, res) => {
  try {
    const { followers } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!followers || !String(followers).trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a valid follower count (e.g., 5000, 125K, 1.5M)' });
    }

    const parsed = parseFollowerNumber(followers);
    if (!parsed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid follower count format. Please enter a number or use suffixes like 10K, 125K, 1.5M' 
      });
    }

    const profile = await InfluencerProfile.findOneAndUpdate(
      { user_id: userId },
      { followers: parsed.text, followers_count: parsed.count },
      { new: true, upsert: true }
    );

    res.json({ 
      success: true, 
      message: `Follower count updated successfully!`, 
      followers: profile.followers, 
      followers_count: profile.followers_count 
    });
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
        $set: {
          is_pro_member: true,
          pro_unlocked_at: new Date()
        },
        $setOnInsert: {
          name: req.user.name || 'Fluencer Creator',
          categories: ['Fashion', 'Beauty', 'Lifestyle'],
          followers: '10K',
          followers_count: 10000
        }
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

// Unlock Pro Pass for Influencer
router.post('/unlock-pass', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const profile = await InfluencerProfile.findOneAndUpdate(
      { user_id: userId },
      { $set: { is_pro_member: true, pro_unlocked_at: new Date() } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Pro Membership Pass unlocked successfully!',
      profile
    });
  } catch (error) {
    console.error('Unlock pass error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlock pass', error: error.message });
  }
});

export default router;
