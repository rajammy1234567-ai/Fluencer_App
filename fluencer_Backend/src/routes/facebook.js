/**
 * Facebook OAuth Routes
 * Handles Facebook login flow
 */

import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import BrandProfile from '../models/BrandProfile.js';
import { generateToken } from '../utils/auth.js';

const router = express.Router();

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI;

/**
 * Step 1: Redirect to Facebook OAuth
 * GET /auth/facebook
 */
router.get('/facebook', (req, res) => {
  try {
    const { role } = req.query; // Get role from query params
    
    if (!role || !['influencer', 'brand'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role (influencer or brand) is required'
      });
    }

    // Store role in state parameter to retrieve later
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');

    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}&state=${state}&scope=email,public_profile&locale=en_US`;

    res.redirect(facebookAuthUrl);
  } catch (error) {
    console.error('Facebook OAuth redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Facebook login',
      error: error.message
    });
  }
});

/**
 * Step 2: Handle Facebook Callback
 * GET /auth/facebook/callback
 */
router.get('/facebook/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle user cancellation or error
    if (error) {
      console.error('Facebook OAuth error:', error, error_description);
      return res.redirect(`${process.env.FRONTEND_URL || 'exp://localhost:8081'}?error=facebook_login_cancelled`);
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    // Decode state to get role
    let role = 'influencer'; // default
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        role = decodedState.role || 'influencer';
      } catch (e) {
        console.error('Error decoding state:', e);
      }
    }

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}&client_secret=${FB_APP_SECRET}&code=${code}`;

    const tokenResponse = await axios.get(tokenUrl);
    const { access_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error('Failed to get access token from Facebook');
    }

    // Fetch user data from Facebook Graph API
    const userDataUrl = `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.type(large)&access_token=${access_token}`;
    
    const userDataResponse = await axios.get(userDataUrl);
    const fbUser = userDataResponse.data;

    if (!fbUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by Facebook. Please ensure email permission is granted.'
      });
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email: fbUser.email }, { facebook_id: fbUser.id }]
    });

    const profilePic = fbUser.picture?.data?.url || null;

    if (user) {
      // User exists - update Facebook info if needed
      user.facebook_id = fbUser.id;
      user.profile_picture = profilePic;
      user.is_verified = true;
      await user.save();

      // Also update the profile table with name and picture
      if (user.role === 'influencer') {
        await InfluencerProfile.findOneAndUpdate(
          { user_id: user._id },
          { name: fbUser.name, profile_image: profilePic },
          { upsert: true, new: true }
        );
      } else if (user.role === 'brand') {
        await BrandProfile.findOneAndUpdate(
          { user_id: user._id },
          { company_name: fbUser.name, profile_image: profilePic },
          { upsert: true, new: true }
        );
      }
    } else {
      // Create new user
      user = await User.create({
        email: fbUser.email,
        role: role,
        is_verified: true,
        facebook_id: fbUser.id,
        profile_picture: profilePic
      });

      // Create profile based on role
      if (role === 'influencer') {
        await InfluencerProfile.create({
          user_id: user._id,
          name: fbUser.name,
          profile_image: profilePic
        });
      } else {
        await BrandProfile.create({
          user_id: user._id,
          company_name: fbUser.name,
          profile_image: profilePic
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.role);

    // Return success response with user data
    res.json({
      success: true,
      message: 'Facebook login successful',
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: fbUser.name,
          profile_picture: profilePic,
          facebook_id: fbUser.id,
          role: user.role,
          is_verified: true
        }
      }
    });

  } catch (error) {
    console.error('Facebook callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Facebook login',
      error: error.message
    });
  }
});

/**
 * Get Facebook Login URL (for mobile apps)
 * GET /auth/facebook/login-url
 */
router.get('/facebook/login-url', (req, res) => {
  try {
    const { role } = req.query;
    
    if (!role || !['influencer', 'brand'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role (influencer or brand) is required'
      });
    }

    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}&state=${state}&scope=email,public_profile&locale=en_US`;

    res.json({
      success: true,
      url: facebookAuthUrl
    });
  } catch (error) {
    console.error('Get Facebook URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Facebook login URL',
      error: error.message
    });
  }
});

export default router;
