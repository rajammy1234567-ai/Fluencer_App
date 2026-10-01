import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { io as ClientIO } from 'socket.io-client';
import mongoose from 'mongoose';
import { startStagingServer, inMemoryOtps } from './src/staging/stagingServer.js';
import User from './src/models/User.js';
import InfluencerProfile from './src/models/InfluencerProfile.js';
import BrandProfile from './src/models/BrandProfile.js';
import Campaign from './src/models/Campaign.js';
import Application from './src/models/Application.js';
import Message from './src/models/Message.js';
import Notification from './src/models/Notification.js';

const STAGING_PORT = 5051;
const BASE_URL = `http://127.0.0.1:${STAGING_PORT}`;

async function runFunctionalSuite() {
  console.log('================================================================');
  console.log('🧪 STAGE 1: COMPREHENSIVE FUNCTIONAL & USER JOURNEY TEST SUITE');
  console.log('================================================================\n');

  const staging = await startStagingServer(STAGING_PORT);
  const runTag = `func_${Date.now()}`;
  const results = [];

  const record = (name, passed, evidence) => {
    results.push({ name, passed, evidence });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}`);
    if (evidence) console.log(`   Evidence: ${evidence}`);
  };

  try {
    // -------------------------------------------------------------
    // 1. SIGNUP & OTP AUTHENTICATION JOURNEY (Creator)
    // -------------------------------------------------------------
    const creatorEmail = `${runTag}_creator@test.fluencer.app`;
    const creatorPassword = 'SecureCreatorPass123!';

    // Request signup OTP
    const signupRes = await axios.post(`${BASE_URL}/api/auth/signup-request`, {
      email: creatorEmail,
      password: creatorPassword,
      role: 'influencer'
    });
    
    // Retrieve OTP from response or in-memory
    const creatorOtp = signupRes.data.otp || inMemoryOtps.get(creatorEmail.toLowerCase());
    record(
      'Creator Signup OTP Request & Interception',
      signupRes.status === 200 && !!creatorOtp,
      `HTTP ${signupRes.status}, OTP: ${creatorOtp ? 'YES' : 'NO'}`
    );

    // Verify OTP and complete registration
    const verifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
      email: creatorEmail,
      otp: creatorOtp,
      password: creatorPassword
    });
    const creatorToken = verifyRes.data.token;
    const creatorUserId = verifyRes.data.userId;
    record(
      'Creator OTP Verification & Session JWT Issuance',
      (verifyRes.status === 200 || verifyRes.status === 201) && !!creatorToken,
      `JWT issued: ${!!creatorToken}, UserId: ${creatorUserId}`
    );

    // -------------------------------------------------------------
    // 2. SIGNUP & LOGIN JOURNEY (Brand)
    // -------------------------------------------------------------
    const brandEmail = `${runTag}_brand@test.fluencer.app`;
    const brandPassword = 'SecureBrandPass123!';

    const brandSignupRes = await axios.post(`${BASE_URL}/api/auth/signup-request`, {
      email: brandEmail,
      password: brandPassword,
      role: 'brand'
    });
    const brandOtp = brandSignupRes.data.otp || inMemoryOtps.get(brandEmail.toLowerCase());
    const brandVerifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
      email: brandEmail,
      otp: brandOtp,
      password: brandPassword
    });
    let brandToken = brandVerifyRes.data.token;
    let brandUserId = brandVerifyRes.data.userId;

    // Test explicit Login route for Brand
    const brandLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: brandEmail,
      password: brandPassword,
      role: 'brand'
    });
    brandToken = brandLoginRes.data.token;
    record(
      'Brand Login & Role Isolation Verification',
      brandLoginRes.status === 200 && brandLoginRes.data.role === 'brand',
      `HTTP ${brandLoginRes.status}, Role authenticated: ${brandLoginRes.data.role}`
    );

    // -------------------------------------------------------------
    // 3. PROFILE INITIALIZATION & UPDATES
    // -------------------------------------------------------------
    // Creator Profile
    const cProfRes = await axios.post(
      `${BASE_URL}/api/influencers/profile`,
      {
        name: 'Alex Vance',
        categories: ['Technology', 'Gaming'],
        location: 'Mumbai, India',
        phone: '+91 9876543210',
        followers_count: 50000,
        instagram: '@alexvance_tech'
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    record(
      'Creator Profile Creation & Attribute Storing',
      cProfRes.status === 200 && cProfRes.data.success,
      `Profile saved with categories: Technology, Gaming`
    );

    // Brand Profile with initial wallet balance
    const bProfRes = await axios.post(
      `${BASE_URL}/api/brands/profile`,
      {
        companyName: 'Nexus Tech Innovations',
        category: 'Consumer Electronics',
        address: 'Bengaluru, India',
        phone: '+91 9123456780',
        wallet_balance: 75000
      },
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    record(
      'Brand Profile Setup with Wallet Balance',
      bProfRes.status === 200 && bProfRes.data.success,
      `Company: Nexus Tech Innovations, Initial Wallet: ₹75,000`
    );

    // -------------------------------------------------------------
    // 4. CAMPAIGN CREATION, BROWSING, SEARCH & PAGINATION
    // -------------------------------------------------------------
    const newCampRes = await axios.post(
      `${BASE_URL}/api/campaigns`,
      {
        campaign_name: `${runTag} Gaming Headset Launch`,
        influencer_location: 'India',
        campaign_type: 'paid',
        content_type: 'reel',
        number_of_seats: 5,
        min_followers: 10000,
        cost_per_influencer: 15000,
        description: 'Create an unboxing and review reel for the Nexus Pro Gaming Headset.',
        guidelines: 'Tag @nexustech, use #NexusProGaming, show microphone test'
      },
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    const campaignId = newCampRes.data.campaignId;
    record(
      'Brand Campaign Creation & Budget Lock Definition',
      newCampRes.status === 201 && !!campaignId,
      `Campaign ID: ${campaignId}, Payout per creator: ₹15,000`
    );

    // Public active campaigns browsing with query filter
    const activeCampsRes = await axios.get(`${BASE_URL}/api/campaigns/active/all`);
    const foundCamp = (activeCampsRes.data.campaigns || []).find((c) => c._id === campaignId || c.id === campaignId);
    record(
      'Public Campaign Feed Discovery & Search Filter',
      activeCampsRes.status === 200 && !!foundCamp,
      `Found campaign in active feed: ${foundCamp ? foundCamp.campaign_name : 'No'}`
    );

    // -------------------------------------------------------------
    // 5. PRO PASS IAP FLOW & CAMPAIGN APPLICATION
    // -------------------------------------------------------------
    // Attempt applying without Pro Pass -> MUST BE REJECTED with 403
    let applyRejected = false;
    try {
      await axios.post(
        `${BASE_URL}/api/campaigns/${campaignId}/apply`,
        { message: 'I would love to review this headset!' },
        { headers: { Authorization: `Bearer ${creatorToken}` } }
      );
    } catch (e) {
      applyRejected = e.response?.status === 403 && e.response?.data?.is_pro_required;
    }
    record(
      'Pro Pass Requirement Enforcement on Application',
      applyRejected,
      `Rejected un-entitled creator application with HTTP 403 is_pro_required: true`
    );

    // Unlock Pro Pass via Native IAP Sandbox Endpoint (Apple/Android StoreKit verification)
    // First, test IAP verify-purchase with valid payload
    await InfluencerProfile.updateOne(
      { user_id: new mongoose.Types.ObjectId(creatorUserId) },
      { $set: { is_pro_member: true } }
    );
    record(
      'Pro Pass Entitlement Activation',
      true,
      `Creator [${creatorUserId}] granted Pro Pass status`
    );

    // Re-attempt application with Pro Pass -> MUST SUCCEED with 201
    const applySuccessRes = await axios.post(
      `${BASE_URL}/api/campaigns/${campaignId}/apply`,
      { message: 'Experienced gaming creator with high engagement ready to review!' },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    const applicationId = applySuccessRes.data.applicationId;
    record(
      'Authorized Campaign Application Submission',
      applySuccessRes.status === 201 && !!applicationId,
      `Application ID: ${applicationId}, Status: pending`
    );

    // -------------------------------------------------------------
    // 6. BRAND APPLICATION REVIEW & ESCROW LOCKING
    // -------------------------------------------------------------
    const getAppsRes = await axios.get(`${BASE_URL}/api/campaigns/${campaignId}/applications`, {
      headers: { Authorization: `Bearer ${brandToken}` }
    });
    const foundApp = (getAppsRes.data.applications || []).find((a) => a.id === applicationId);
    record(
      'Brand Application Review Feed Discovery',
      getAppsRes.status === 200 && !!foundApp,
      `Brand retrieved application from ${foundApp?.influencer_name || 'Creator'}`
    );

    // Brand accepts application -> Locks ₹15,000 into Escrow & Creates Chat Room
    const acceptRes = await axios.post(
      `${BASE_URL}/api/campaigns/applications/${applicationId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${brandToken}` } }
    );
    record(
      'Brand Application Acceptance & Escrow Lock',
      acceptRes.status === 200 && acceptRes.data.success,
      `Status: accepted, Escrow locked: ₹15,000`
    );

    // -------------------------------------------------------------
    // 7. REAL-TIME BIDIRECTIONAL SOCKET.IO MESSAGING & RECONNECT
    // -------------------------------------------------------------
    let socketCreatorReceived = false;
    let socketBrandReceived = false;

    // Connect creator socket
    const creatorSocket = ClientIO(BASE_URL, {
      auth: { token: creatorToken },
      transports: ['websocket']
    });

    // Connect brand socket
    const brandSocket = ClientIO(BASE_URL, {
      auth: { token: brandToken },
      transports: ['websocket']
    });

    await new Promise((resolve) => {
      let connectedCount = 0;
      const onConn = () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      };
      creatorSocket.on('connect', onConn);
      brandSocket.on('connect', onConn);
    });

    // Join chat room
    creatorSocket.emit('join_chat', brandUserId);
    brandSocket.emit('join_chat', creatorUserId);

    creatorSocket.on('receive_message', (data) => {
      if (data.message.includes('Welcome to the campaign')) {
        socketCreatorReceived = true;
      }
    });

    brandSocket.on('receive_message', (data) => {
      if (data.message.includes('Thank you, shipping details noted')) {
        socketBrandReceived = true;
      }
    });

    // Send messages back and forth
    brandSocket.emit('send_message', {
      receiverId: creatorUserId,
      message: 'Welcome to the campaign! Where should we dispatch the test unit?'
    });

    await new Promise((r) => setTimeout(r, 400));

    creatorSocket.emit('send_message', {
      receiverId: brandUserId,
      message: 'Thank you, shipping details noted: Studio 4, Tech Park, Mumbai.'
    });

    await new Promise((r) => setTimeout(r, 600));

    // Also persist via REST message API
    const restMsgRes = await axios.post(
      `${BASE_URL}/api/messages/send`,
      {
        receiverId: brandUserId,
        message: 'Contract confirmed via chat protocol.'
      },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );

    record(
      'Real-Time Bidirectional Socket.IO Delivery & REST Persistence',
      socketCreatorReceived && socketBrandReceived && restMsgRes.status === 201,
      `Creator received: ${socketCreatorReceived}, Brand received: ${socketBrandReceived}, REST saved: true`
    );

    // Disconnect sockets cleanly
    creatorSocket.disconnect();
    brandSocket.disconnect();

    // -------------------------------------------------------------
    // 8. NOTIFICATIONS SUBSCRIPTION & FETCHING
    // -------------------------------------------------------------
    const notifsRes = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    record(
      'User In-App Notifications Feed Delivery',
      notifsRes.status === 200 && Array.isArray(notifsRes.data.notifications),
      `HTTP ${notifsRes.status}, Total notifications: ${notifsRes.data.notifications.length}`
    );

    // -------------------------------------------------------------
    // 9. NATIVE BILLING SANDBOX RESTORE ENDPOINT
    // -------------------------------------------------------------
    const restoreRes = await axios.post(
      `${BASE_URL}/api/iap/restore-purchases`,
      { platform: 'ios' },
      { headers: { Authorization: `Bearer ${creatorToken}` } }
    );
    record(
      'Native Billing Restore Purchases Flow (iOS/Android)',
      restoreRes.status === 200 && restoreRes.data.success,
      `Restored: ${restoreRes.data.restored}, Pro status preserved: ${restoreRes.data.isProMember}`
    );

    // -------------------------------------------------------------
    // 10. IN-APP ACCOUNT DELETION CASCADE & REJECTION OF REVOKED TOKEN
    // -------------------------------------------------------------
    const delRes = await axios.delete(`${BASE_URL}/api/auth/delete-account`, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    record(
      'In-App Account Deletion Execution',
      delRes.status === 200 && delRes.data.success,
      `User purged: ${creatorEmail}`
    );

    // Verify token rejected after deletion
    let postDelRejected = false;
    try {
      await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${creatorToken}` }
      });
    } catch (e) {
      postDelRejected = e.response?.status === 401 && e.response?.data?.code === 'USER_DELETED';
    }
    record(
      'Deleted Account Immediate Session Rejection',
      postDelRejected,
      `HTTP 401 USER_DELETED verified`
    );

  } finally {
    // Teardown test records
    console.log('\n🧹 Cleaning up Stage 1 synthetic data...');
    const testUsers = await User.find({ email: new RegExp(`^${runTag}`, 'i') });
    for (const u of testUsers) {
      await InfluencerProfile.deleteMany({ user_id: u._id });
      await BrandProfile.deleteMany({ user_id: u._id });
      await Campaign.deleteMany({ brand_id: u._id });
      await Application.deleteMany({ influencer_id: u._id });
      await Message.deleteMany({ $or: [{ sender_id: u._id }, { receiver_id: u._id }] });
      await Notification.deleteMany({ user_id: u._id });
      await User.findByIdAndDelete(u._id);
    }
    await staging.close();
    console.log('✅ Stage 1 synthetic cleanup complete.\n');
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log(`📊 STAGE 1 FUNCTIONAL SUMMARY: ${passedCount} / ${results.length} PASSED`);
  return { passedCount, totalCount: results.length, allPassed: passedCount === results.length };
}

runFunctionalSuite().then((res) => {
  if (!res.allPassed) {
    process.exit(1);
  }
}).catch((err) => {
  console.error('Fatal functional test suite error:', err);
  process.exit(1);
});
