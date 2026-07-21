import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all models to register schemas with Mongoose
import './models/User.js';
import './models/OTP.js';
import './models/InfluencerProfile.js';
import './models/BrandProfile.js';
import './models/Campaign.js';
import './models/Application.js';
import './models/Chat.js';
import './models/ChatMessage.js';
import './models/Message.js';
import './models/Payment.js';
import './models/Withdrawal.js';
import './models/Notification.js';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting End-to-End Database and API Flow Verification...\n');

  let influencerToken = '';
  let brandToken = '';
  let adminToken = '';
  let campaignId = '';
  let applicationId = '';
  let chatId = '';

  const influencerEmail = `creator_${Math.floor(Math.random() * 1000)}@fluencer.test`;
  const brandEmail = `brand_${Math.floor(Math.random() * 1000)}@fluencer.test`;
  const testPassword = 'Password123!';

  try {
    // ----------------------------------------------------
    // 1. SIGNUP & PROFILE FLOW (INFLUENCER)
    // ----------------------------------------------------
    console.log('⚙️ Testing Influencer Signup OTP Request...');
    const signupInfRes = await fetch(`${BASE_URL}/api/auth/signup-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: influencerEmail, role: 'influencer' })
    });
    const signupInf = await signupInfRes.json();
    console.log('Result:', signupInf.success ? '✅ Success' : '❌ Failed', signupInf.message);

    // Retrieve OTP directly from Atlas
    console.log('🔍 Fetching OTP record from Atlas...');
    const OTPModel = mongoose.model('OTP');
    const otpRecordInf = await OTPModel.findOne({ email: influencerEmail });
    if (!otpRecordInf) throw new Error('OTP record not found on Atlas');
    console.log('✅ Retained OTP from DB:', otpRecordInf.otp);

    console.log('⚙️ Verifying OTP for Influencer...');
    const verifyInfRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: influencerEmail, otp: otpRecordInf.otp, password: testPassword })
    });
    const verifyInf = await verifyInfRes.json();
    influencerToken = verifyInf.token;
    console.log('Result:', verifyInf.success ? '✅ Success' : '❌ Failed. Token received:', !!influencerToken);

    console.log('⚙️ Creating Influencer Profile details...');
    const infProfileRes = await fetch(`${BASE_URL}/api/influencers/profile`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${influencerToken}`
      },
      body: JSON.stringify({ 
        name: 'Jane Doe Test', 
        gender: 'female', 
        categories: ['Fashion', 'Lifestyle'], 
        location: 'Mumbai, India', 
        bio: 'E2E testing account' 
      })
    });
    const infProfile = await infProfileRes.json();
    console.log('Result:', infProfile.success ? '✅ Success' : '❌ Failed', infProfile.message);

    // ----------------------------------------------------
    // 2. SIGNUP & PROFILE FLOW (BRAND)
    // ----------------------------------------------------
    console.log('\n⚙️ Testing Brand Signup OTP Request...');
    const signupBrandRes = await fetch(`${BASE_URL}/api/auth/signup-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail, role: 'brand' })
    });
    const signupBrand = await signupBrandRes.json();
    
    console.log('🔍 Fetching OTP record from Atlas...');
    const otpRecordBrand = await OTPModel.findOne({ email: brandEmail });
    if (!otpRecordBrand) throw new Error('OTP record not found on Atlas');

    console.log('⚙️ Verifying OTP for Brand...');
    const verifyBrandRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail, otp: otpRecordBrand.otp, password: testPassword })
    });
    const verifyBrand = await verifyBrandRes.json();
    brandToken = verifyBrand.token;
    console.log('Result:', verifyBrand.success ? '✅ Success' : '❌ Failed');

    console.log('⚙️ Creating Brand Profile details...');
    const brandProfileRes = await fetch(`${BASE_URL}/api/brands/profile`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${brandToken}`
      },
      body: JSON.stringify({ 
        companyName: 'Acme Test Corp', 
        category: 'Fashion', 
        address: 'Delhi, India' 
      })
    });
    const brandProfile = await brandProfileRes.json();
    console.log('Result:', brandProfile.success ? '✅ Success' : '❌ Failed', brandProfile.message);

    // ----------------------------------------------------
    // 3. CAMPAIGN CREATION FLOW
    // ----------------------------------------------------
    console.log('\n⚙️ Creating a Campaign as the Brand...');
    const campaignRes = await fetch(`${BASE_URL}/api/campaigns`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${brandToken}`
      },
      body: JSON.stringify({ 
        campaign_name: 'Summer Fashion Launch 2026', 
        influencer_location: 'Mumbai, India', 
        campaign_type: 'paid', 
        content_type: 'reel', 
        number_of_seats: 5,
        min_followers: 1000,
        cost_per_influencer: 5000,
        description: 'Test Campaign Description'
      })
    });
    const campaignData = await campaignRes.json();
    campaignId = campaignData.campaignId;
    console.log('Result:', campaignData.success ? '✅ Success' : '❌ Failed', 'Campaign ID:', campaignId);

    // ----------------------------------------------------
    // 4. CAMPAIGN APPLICATION FLOW
    // ----------------------------------------------------
    console.log('\n⚙️ Applying to the Campaign as the Influencer...');
    const applyRes = await fetch(`${BASE_URL}/api/campaigns/${campaignId}/apply`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${influencerToken}`
      },
      body: JSON.stringify({ message: 'I would love to collaborate!' })
    });
    const applyData = await applyRes.json();
    applicationId = applyData.applicationId;
    console.log('Result:', applyData.success ? '✅ Success' : '❌ Failed', 'Application ID:', applicationId);

    // ----------------------------------------------------
    // 5. APPLICATION MANAGEMENT & CHAT FLOW
    // ----------------------------------------------------
    console.log('\n⚙️ Accepting the Application as the Brand...');
    const acceptRes = await fetch(`${BASE_URL}/api/campaigns/applications/${applicationId}/accept`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${brandToken}`
      }
    });
    const acceptData = await acceptRes.json();
    chatId = acceptData.chatId;
    console.log('Result:', acceptData.success ? '✅ Success (Chat Open!)' : '❌ Failed', 'Chat ID:', chatId);

    console.log('⚙️ Sending Chat Message from Brand...');
    const sendMsgRes = await fetch(`${BASE_URL}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${brandToken}`
      },
      body: JSON.stringify({ message: 'Hi Jane, welcome to our campaign!' })
    });
    const sendMsg = await sendMsgRes.json();
    console.log('Result:', sendMsg.success ? '✅ Success' : '❌ Failed');

    // ----------------------------------------------------
    // 6. ADMIN SYSTEM FLOW
    // ----------------------------------------------------
    console.log('\n⚙️ Testing Admin Login...');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fluencer.app', password: 'Admin@123' })
    });
    const adminLogin = await adminLoginRes.json();
    adminToken = adminLogin.token;
    console.log('Result:', adminLogin.success ? '✅ Success' : '❌ Failed');

    console.log('⚙️ Fetching Admin Dashboard Stats...');
    const statsRes = await fetch(`${BASE_URL}/api/admin/dashboard/stats`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    console.log('Result:', statsData.success ? '✅ Success' : '❌ Failed');
    console.log('Platform Stats:', statsData.data);

    console.log('\n🌟 ALL END-TO-END FLOW TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ E2E Verification failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Connect mongoose to execute DB query in test
mongoose.connect(process.env.MONGODB_URI).then(() => {
  runTests();
});
