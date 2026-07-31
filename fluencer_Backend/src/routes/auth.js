import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import BrandProfile from '../models/BrandProfile.js';
import { 
  generateOTP, 
  generateToken, 
  generateOTPExpiry, 
  isOTPExpired 
} from '../utils/auth.js';
import { sendOTPEmail } from '../config/mailer.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Google Login - Verify Google token and create/login user
router.post('/google-login', async (req, res) => {
  try {
    const { accessToken, role } = req.body;

    if (!accessToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Access token is required' 
      });
    }

    // Verify Google access token and get user info
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!googleResponse.ok) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid Google token' 
      });
    }

    const googleUser = await googleResponse.json();
    const { email, name, picture } = googleUser;

    console.log('🔐 Google login attempt for email:', email);

    // Check if user already exists
    const user = await User.findOne({ email });

    if (user) {
      const token = generateToken(user._id.toString(), user.role);
      
      console.log('✅ Google login successful for existing user:', email);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        token: token,
        userId: user._id.toString(),
        role: user.role,
        isNewUser: false
      });
    }

    // New user - need role to create account
    if (!role || !['influencer', 'brand'].includes(role)) {
      return res.status(200).json({
        success: true,
        needsRole: true,
        email: email,
        name: name,
        picture: picture,
        message: 'Please select a role to complete registration'
      });
    }

    // Create new user with Google auth (no password needed)
    const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
    const newUser = await User.create({
      email,
      password: randomPassword,
      role
    });

    const userId = newUser._id.toString();

    // Create empty profile based on role
    if (role === 'influencer') {
      await InfluencerProfile.create({
        user_id: newUser._id,
        name: name || 'User',
        profile_image: picture || null
      });
      console.log('✅ Influencer profile created for user:', userId);
    } else if (role === 'brand') {
      await BrandProfile.create({
        user_id: newUser._id,
        company_name: name || 'Company',
        profile_image: picture || null
      });
      console.log('✅ Brand profile created for user:', userId);
    }

    const token = generateToken(userId, role);
    console.log('✅ New user created via Google:', email, 'Role:', role);

    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully',
      token: token,
      userId: userId,
      role: role,
      isNewUser: true
    });

  } catch (error) {
    console.error('❌ Google login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Google login failed', 
      error: error.message 
    });
  }
});

// Signup - Request OTP (Supports Email OR Mobile Number)
router.post('/signup-request', async (req, res) => {
  try {
    const { email, role, phone, identifier } = req.body;
    const inputVal = (email || phone || identifier || '').trim();
    const cleanRole = (role || '').trim();

    if (!inputVal || !cleanRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address or Mobile number and role are required' 
      });
    }

    if (!['influencer', 'brand'].includes(cleanRole)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be influencer or brand' 
      });
    }

    const isMobile = /^\+?[0-9\s\-]{7,15}$/.test(inputVal) && !inputVal.includes('@');
    const phoneDigits = inputVal.replace(/\D/g, '');
    const cleanEmail = isMobile ? `mobile_${phoneDigits}@fluencer.app` : inputVal.toLowerCase();
    const cleanPhone = isMobile ? phoneDigits : null;

    // Check if user already exists
    const user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(cleanPhone ? [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }] : [])
      ]
    });

    if (user) {
      if (user.role !== cleanRole) {
        return res.status(400).json({ 
          success: false, 
          message: `This account is already registered as a ${user.role}. Please login.`
        });
      }

      return res.status(400).json({ 
        success: false, 
        message: 'Account already registered. Please login.' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    // Save/Update OTP to temporary verification
    await OTP.findOneAndUpdate(
      { email: cleanEmail },
      { otp, otp_expiry: otpExpiry, role: cleanRole, phone: cleanPhone },
      { upsert: true, new: true }
    );

    console.log(`🔑 Generated OTP for ${inputVal}: ${otp}`);
    if (!isMobile) {
      sendOTPEmail(cleanEmail, otp).catch(err => console.warn('Email send error:', err.message));
    }

    res.status(200).json({ 
      success: true, 
      message: `OTP generated successfully: ${otp}`,
      email: inputVal,
      otp: otp
    });
  } catch (error) {
    console.error('Signup request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Signup request failed', 
      error: error.message 
    });
  }
});

// Verify OTP and Create Account (Supports Email OR Mobile Number)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, password, phone, identifier } = req.body;
    const inputVal = (email || phone || identifier || '').trim();
    const cleanOtp = String(otp || '').trim();

    if (!inputVal || !cleanOtp || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address/Mobile number, OTP, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const isMobile = /^\+?[0-9\s\-]{7,15}$/.test(inputVal) && !inputVal.includes('@');
    const phoneDigits = inputVal.replace(/\D/g, '');
    const cleanEmail = isMobile ? `mobile_${phoneDigits}@fluencer.app` : inputVal.toLowerCase();
    const cleanPhone = isMobile ? phoneDigits : (phone || null);

    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      $or: [
        { email: cleanEmail },
        { email: inputVal.toLowerCase() },
        ...(phoneDigits ? [{ phone: phoneDigits }] : [])
      ],
      otp: cleanOtp 
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    if (isOTPExpired(otpRecord.otp_expiry)) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    const role = otpRecord.role;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role
    });

    const userId = newUser._id.toString();

    // Create profile with phone set if mobile registration
    if (role === 'influencer') {
      await InfluencerProfile.create({
        user_id: newUser._id,
        name: 'User',
        phone: cleanPhone || ''
      });
      console.log('✅ Influencer profile created for user:', userId);
    } else if (role === 'brand') {
      await BrandProfile.create({
        user_id: newUser._id,
        company_name: 'Company',
        phone: cleanPhone || ''
      });
      console.log('✅ Brand profile created for user:', userId);
    }

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    const token = generateToken(userId, role);

    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully',
      token: token,
      userId: userId,
      role: role
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'OTP verification failed', 
      error: error.message 
    });
  }
});

// Login (Supports Email OR Mobile Number)
router.post('/login', async (req, res) => {
  try {
    const { password, role } = req.body;
    const loginInput = (req.body.email || req.body.login || req.body.phone || req.body.identifier || req.body.mobile || '').trim();

    console.log('🔐 Login attempt for identifier:', loginInput, 'from role section:', role);

    if (!loginInput || !password) {
      console.log('❌ Missing email/mobile or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Email address / Mobile number and password are required' 
      });
    }

    console.log('📊 Querying database for user by email or mobile number...');
    const cleanInput = loginInput.toLowerCase();
    const phoneDigits = loginInput.replace(/\D/g, '');

    let user = await User.findOne({
      $or: [
        { email: cleanInput },
        { phone: loginInput },
        ...(phoneDigits ? [{ phone: phoneDigits }, { phone: `+91${phoneDigits}` }] : [])
      ]
    });

    // Fallback search via InfluencerProfile or BrandProfile phone fields
    if (!user && phoneDigits) {
      const ip = await InfluencerProfile.findOne({ 
        $or: [{ phone: loginInput }, { phone: phoneDigits }, { phone: `+91${phoneDigits}` }] 
      }).select('user_id').lean();

      const bp = await BrandProfile.findOne({ 
        $or: [{ phone: loginInput }, { phone: phoneDigits }, { phone: `+91${phoneDigits}` }] 
      }).select('user_id').lean();

      const foundUserId = ip ? ip.user_id : (bp ? bp.user_id : null);
      if (foundUserId) {
        user = await User.findById(foundUserId);
      }
    }

    console.log('📊 Query result:', user ? 'User found' : 'User not found');

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email/mobile number or password' 
      });
    }

    console.log('👤 User found:', { id: user._id, email: user.email, role: user.role });
    
    // Check if the user's role matches the requested login section
    if (role && user.role !== role) {
      console.log('❌ Role mismatch: User is', user.role, 'but trying to login as', role);
      const roleLabel = user.role === 'influencer' ? 'Influencer' : user.role === 'brand' ? 'Brand' : user.role;
      return res.status(403).json({ 
        success: false, 
        message: `This account is already registered as ${roleLabel}. Please use the ${roleLabel} login section.`,
        actualRole: user.role
      });
    }
    
    console.log('🔒 Comparing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔒 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const token = generateToken(user._id.toString(), user.role);
    console.log('✅ Login successful, token generated');

    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      token: token,
      userId: user._id.toString(),
      role: user.role
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Admin Login (temporary hardcoded credentials for MVP)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Admin login attempt for email:', email);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Temporary admin credentials for MVP
    const ADMIN_EMAIL = 'admin@fluencer.app';
    const ADMIN_PASSWORD = 'Admin@123';

    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate JWT token for admin with role 'admin'
      const token = generateToken('admin_user_id_1', 'admin');
      console.log('✅ Admin login successful, token generated');

      return res.status(200).json({ 
        success: true, 
        message: 'Admin login successful',
        token: token,
        userId: 'admin_user_id_1',
        role: 'admin'
      });
    } else {
      console.log('❌ Invalid admin credentials');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin credentials' 
      });
    }
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Admin login failed', 
      error: error.message 
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('id email role');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user', 
      error: error.message 
    });
  }
});

// Forgot Password - Request OTP
router.post('/forgot-password-request', async (req, res) => {
  try {
    const { email, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email' 
      });
    }

    // Check if the user's role matches the requested section
    if (role && user.role !== role) {
      console.log('❌ Role mismatch in forgot-password: User is', user.role, 'but trying from', role, 'section');
      const roleLabel = user.role === 'influencer' ? 'Influencer' : user.role === 'brand' ? 'Brand' : user.role;
      return res.status(403).json({ 
        success: false, 
        message: `This account is already registered as ${roleLabel}. Please use the ${roleLabel} section to reset your password.`,
        actualRole: user.role
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    // Save OTP for password reset
    await OTP.findOneAndUpdate(
      { email: cleanEmail },
      { otp, otp_expiry: otpExpiry, role: user.role },
      { upsert: true, new: true }
    );

    // Send OTP email (async attempt)
    console.log(`🔑 Generated Password Reset OTP for ${cleanEmail}: ${otp}`);
    sendOTPEmail(cleanEmail, otp).catch(err => console.warn('Email send error:', err.message));

    res.status(200).json({ 
      success: true, 
      message: `Password reset OTP generated: ${otp}`,
      email: cleanEmail,
      otp: otp
    });
  } catch (error) {
    console.error('❌ Forgot password request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process request', 
      error: error.message 
    });
  }
});

// Reset Password - Verify OTP and Update Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    if (!cleanEmail || !cleanOtp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, OTP, and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email: cleanEmail, otp: cleanOtp });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    if (isOTPExpired(otpRecord.otp_expiry)) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    // Get user role before updating password
    const user = await User.findOne({ email: cleanEmail });
    const userRole = user ? user.role : null;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updateOne({ email: cleanEmail }, { password: hashedPassword });

    // Delete OTP record
    await OTP.deleteOne({ email: cleanEmail });

    console.log('✅ Password reset successful for:', email);

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful. You can now login with your new password.',
      role: userRole
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password', 
      error: error.message 
    });
  }
});

export default router;
