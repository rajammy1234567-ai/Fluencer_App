import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import app from './src/app.js';
import User from './src/models/User.js';
import InfluencerProfile from './src/models/InfluencerProfile.js';
import Application from './src/models/Application.js';
import Notification from './src/models/Notification.js';
import Payment from './src/models/Payment.js';
import OTP from './src/models/OTP.js';
import ChatMessage from './src/models/ChatMessage.js';
import Message from './src/models/Message.js';
import IAPTransaction from './src/models/IAPTransaction.js';
import { generateToken } from './src/utils/auth.js';

let server;
let baseUrl;

async function makeRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const status = response.status;
  let body = {};
  try {
    body = await response.json();
  } catch (e) {
    body = { raw: await response.text() };
  }
  return { status, body };
}

async function runRigorousHttpTests() {
  console.log('================================================================');
  console.log('🧪 RIGOROUS REAL HTTP ROUTE INTEGRATION & SEEDED DATA CASCADE TEST');
  console.log('================================================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Start ephemeral server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`🚀 Ephemeral test server live at: ${baseUrl}\n`);
        resolve();
      });
    });

    const results = [];
    const recordResult = (title, passed, details) => {
      results.push({ title, passed });
      console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${title}`);
      if (details) console.log(`   ${details}\n`);
    };

    // -------------------------------------------------------------------------
    // TEST 1: IN-APP DELETION VIA REAL HTTP (DELETE /api/auth/delete-account)
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: In-App Deletion with Fully Seeded Relational Data ---');
    const email1 = `test_inapp_${Date.now()}@fluencer.test`;
    const hashedPw1 = await bcrypt.hash('TestPw!123', 8);
    const user1 = await User.create({
      email: email1,
      password: hashedPw1,
      role: 'influencer',
      token_version: 0
    });
    const token1 = generateToken(user1._id.toString(), 'influencer', 0);

    // Seed Profile
    await InfluencerProfile.create({
      user_id: user1._id,
      name: 'Test Seeded Influencer',
      bio: 'Seeded test bio with sensitive personal information',
      social_links: { instagram: '@test_seeded_creator' }
    });

    // Seed 1 Pending App (purged) and 1 Accepted App (anonymized)
    const dummyCampaignId1 = new mongoose.Types.ObjectId();
    const dummyCampaignId2 = new mongoose.Types.ObjectId();
    const dummyBrandId = new mongoose.Types.ObjectId();

    await Application.create({
      campaign_id: dummyCampaignId1,
      influencer_id: user1._id,
      brand_id: dummyBrandId,
      status: 'pending',
      message: 'Secret pending proposal pitch'
    });

    const acceptedApp1 = await Application.create({
      campaign_id: dummyCampaignId2,
      influencer_id: user1._id,
      brand_id: dummyBrandId,
      status: 'accepted',
      message: 'Confidential commercial proposal terms'
    });

    // Seed 2 Notifications
    await Notification.create([
      { target_id: user1._id, title: 'Seeded Notif 1', message: 'You got an offer' },
      { target_id: user1._id, title: 'Seeded Notif 2', message: 'Campaign updated' }
    ]);

    // Seed 2 ChatMessages and 2 Direct Messages
    const dummyChatId = new mongoose.Types.ObjectId();
    await ChatMessage.create([
      { chat_id: dummyChatId, sender_id: user1._id, message: 'Private campaign negotiation message 1' },
      { chat_id: dummyChatId, sender_id: user1._id, message: 'Private campaign negotiation message 2' }
    ]);

    const otherUser = await User.create({
      email: `other_partner_${Date.now()}@fluencer.test`,
      password: hashedPw1,
      role: 'brand'
    });

    await Message.create([
      { sender_id: user1._id, receiver_id: otherUser._id, message: '1-on-1 private DM 1' },
      { sender_id: user1._id, receiver_id: otherUser._id, message: '1-on-1 private DM 2' }
    ]);

    // Seed 1 Payment
    const payment1 = await Payment.create({
      user_id: user1._id,
      order_id: `ord_seed_${Date.now()}`,
      payment_id: `pay_seed_${Date.now()}`,
      amount: 499,
      status: 'completed',
      description: `₹499 Pro Pass for customer ${email1}`
    });

    // Seed 1 OTP
    await OTP.create({
      email: email1,
      otp: '654321',
      otp_expiry: new Date(Date.now() + 600000),
      purpose: 'login'
    });

    // VERIFY SEEDED COUNTS BEFORE DELETION
    const countBefore1 = {
      users: await User.countDocuments({ _id: user1._id }),
      profiles: await InfluencerProfile.countDocuments({ user_id: user1._id }),
      pendingApps: await Application.countDocuments({ influencer_id: user1._id, status: 'pending' }),
      acceptedApps: await Application.countDocuments({ influencer_id: user1._id, status: 'accepted' }),
      notifs: await Notification.countDocuments({ target_id: user1._id }),
      chatMsgs: await ChatMessage.countDocuments({ sender_id: user1._id }),
      dms: await Message.countDocuments({ sender_id: user1._id }),
      payments: await Payment.countDocuments({ user_id: user1._id }),
      otps: await OTP.countDocuments({ email: email1 })
    };

    console.log('   📊 Seeded Records BEFORE Deletion:');
    console.log(`      Users: ${countBefore1.users}, Profiles: ${countBefore1.profiles}, Pending Apps: ${countBefore1.pendingApps}, Accepted Apps: ${countBefore1.acceptedApps}`);
    console.log(`      Notifications: ${countBefore1.notifs}, Chat Messages: ${countBefore1.chatMsgs}, DMs: ${countBefore1.dms}, Payments: ${countBefore1.payments}, OTPs: ${countBefore1.otps}`);

    // EXECUTE IN-APP DELETION VIA REAL HTTP
    const delRes1 = await makeRequest('/api/auth/delete-account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` }
    });

    console.log(`   📡 HTTP DELETE /api/auth/delete-account Response: Status ${delRes1.status}`, delRes1.body);

    // VERIFY SEEDED COUNTS AFTER DELETION
    const countAfter1 = {
      users: await User.countDocuments({ _id: user1._id }),
      profiles: await InfluencerProfile.countDocuments({ user_id: user1._id }),
      pendingApps: await Application.countDocuments({ influencer_id: user1._id, status: 'pending' }),
      acceptedApps: await Application.countDocuments({ influencer_id: user1._id, status: 'accepted' }),
      notifs: await Notification.countDocuments({ target_id: user1._id }),
      otps: await OTP.countDocuments({ email: email1 })
    };

    // Check Anonymization Contents
    const checkedAcceptedApp = await Application.findById(acceptedApp1._id);
    const checkedChatMsgs = await ChatMessage.find({ sender_id: user1._id });
    const checkedDms = await Message.find({ sender_id: user1._id });
    const checkedPayment = await Payment.findById(payment1._id);

    const isCascadePurged = 
      countAfter1.users === 0 &&
      countAfter1.profiles === 0 &&
      countAfter1.pendingApps === 0 &&
      countAfter1.notifs === 0 &&
      countAfter1.otps === 0;

    const isAnonymized = 
      checkedAcceptedApp.message === '[Proposal redacted upon account deletion]' &&
      checkedChatMsgs.every(m => m.message === '[Message redacted upon account deletion]') &&
      checkedDms.every(m => m.message === '[Message redacted upon account deletion]') &&
      checkedPayment.description === '[Financial record retained for statutory tax compliance; customer reference redacted]';

    recordResult(
      'In-App HTTP Deletion & Seeded Relational Cascade',
      delRes1.status === 200 && delRes1.body.success && isCascadePurged && isAnonymized,
      `Before: ${JSON.stringify(countBefore1)} -> After: ${JSON.stringify(countAfter1)}. Cascade Purged: ${isCascadePurged}, Content Anonymized: ${isAnonymized}`
    );

    // Verify subsequent request with old token is rejected via HTTP
    const postDelReq = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${token1}` }
    });
    recordResult(
      'Deleted User Session Rejected via Real HTTP',
      postDelReq.status === 401 && postDelReq.body.success === false,
      `HTTP Status: ${postDelReq.status}, Body: ${JSON.stringify(postDelReq.body)}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: PUBLIC WEB OTP-CONFIRMED DELETION & OTP SECURITY VIA REAL HTTP
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Public OTP-Confirmed Deletion with Edge-Case Testing ---');
    const email2 = `test_public_${Date.now()}@fluencer.test`;
    const user2 = await User.create({
      email: email2,
      password: hashedPw1,
      role: 'influencer',
      token_version: 0
    });

    await InfluencerProfile.create({
      user_id: user2._id,
      name: 'Public Deletion Test User'
    });
    await Notification.create({ target_id: user2._id, title: 'Notif for User 2', message: 'Hi' });

    // 2A: Non-Existent Account Request (Anti-Enumeration Protection)
    const nonExistentReq = await makeRequest('/api/auth/request-data-deletion', {
      method: 'POST',
      body: JSON.stringify({ email: 'non_existent_account_999@fluencer.test' })
    });
    recordResult(
      'Public Deletion: Non-Existent Account Handled Securely (Anti-Enumeration)',
      nonExistentReq.status === 200 && nonExistentReq.body.message.includes('If an active account'),
      `HTTP Status: ${nonExistentReq.status}, Message: "${nonExistentReq.body.message}"`
    );

    // 2B: Valid OTP Request
    const validOtpReq = await makeRequest('/api/auth/request-data-deletion', {
      method: 'POST',
      body: JSON.stringify({ email: email2 })
    });
    recordResult(
      'Public Deletion: Valid OTP Request Dispatched',
      validOtpReq.status === 200 && validOtpReq.body.success === true,
      `HTTP Status: ${validOtpReq.status}, Message: "${validOtpReq.body.message}"`
    );

    // 2C: Rate Limiting / Resend Cooldown (Immediate Second Request)
    const cooldownReq = await makeRequest('/api/auth/request-data-deletion', {
      method: 'POST',
      body: JSON.stringify({ email: email2 })
    });
    recordResult(
      'Public Deletion: 60-Second Resend Cooldown Enforced',
      cooldownReq.status === 429 && cooldownReq.body.code === 'RATE_LIMITED',
      `HTTP Status: ${cooldownReq.status}, Code: "${cooldownReq.body.code}", Message: "${cooldownReq.body.message}"`
    );

    // Retrieve the generated OTP from database for controlled edge case tests
    const generatedOtpRecord = await OTP.findOne({ email: email2, purpose: 'account_deletion' });
    const realCode = generatedOtpRecord.otp;

    // 2D: Expired OTP Rejection
    generatedOtpRecord.otp_expiry = new Date(Date.now() - 30000); // Set 30s in past
    await generatedOtpRecord.save();

    const expiredConfirmReq = await makeRequest('/api/auth/confirm-data-deletion', {
      method: 'POST',
      body: JSON.stringify({ email: email2, otp: realCode })
    });
    recordResult(
      'Public Deletion: Expired OTP Rejected via Real HTTP',
      expiredConfirmReq.status === 400 && expiredConfirmReq.body.code === 'OTP_EXPIRED',
      `HTTP Status: ${expiredConfirmReq.status}, Code: "${expiredConfirmReq.body.code}", Message: "${expiredConfirmReq.body.message}"`
    );

    // 2E: Wrong Attempt Counter & Lockout
    // Create a fresh OTP for wrong attempt testing
    await OTP.deleteMany({ email: email2 });
    const freshOtp = await OTP.create({
      email: email2,
      otp: '334455',
      otp_expiry: new Date(Date.now() + 300000),
      purpose: 'account_deletion',
      attempts: 0,
      max_attempts: 5
    });

    const wrongCodeReq1 = await makeRequest('/api/auth/confirm-data-deletion', {
      method: 'POST',
      body: JSON.stringify({ email: email2, otp: '000000' })
    });
    const otpAfterWrong1 = await OTP.findById(freshOtp._id);

    recordResult(
      'Public Deletion: Wrong Attempt Counter Incremented',
      wrongCodeReq1.status === 400 && otpAfterWrong1.attempts === 1,
      `HTTP Status: ${wrongCodeReq1.status}, Attempts in DB: ${otpAfterWrong1?.attempts}, Response: "${wrongCodeReq1.body.message}"`
    );

    // Force attempts to 5 (lockout)
    otpAfterWrong1.attempts = 5;
    await otpAfterWrong1.save();

    const lockedOutReq = await makeRequest('/api/auth/confirm-data-deletion', {
      method: 'POST',
      body: JSON.stringify({ email: email2, otp: '334455' })
    });
    recordResult(
      'Public Deletion: Maximum Attempts Lockout Enforced',
      lockedOutReq.status === 429 && lockedOutReq.body.code === 'MAX_ATTEMPTS_EXCEEDED',
      `HTTP Status: ${lockedOutReq.status}, Code: "${lockedOutReq.body.code}", Message: "${lockedOutReq.body.message}"`
    );

    // 2F: Valid Confirmation & Deletion Execution
    await OTP.deleteMany({ email: email2 });
    await OTP.create({
      email: email2,
      otp: '789123',
      otp_expiry: new Date(Date.now() + 300000),
      purpose: 'account_deletion',
      attempts: 0,
      max_attempts: 5
    });

    const validConfirmReq = await makeRequest('/api/auth/confirm-data-deletion', {
      method: 'POST',
      body: JSON.stringify({ email: email2, otp: '789123', reason: 'Public Portal Confirmed' })
    });

    const user2InDbAfter = await User.findById(user2._id);
    const profile2InDbAfter = await InfluencerProfile.findOne({ user_id: user2._id });
    const notifs2InDbAfter = await Notification.countDocuments({ target_id: user2._id });

    recordResult(
      'Public Deletion: Successful OTP Confirmation & Full Cascade Purge',
      validConfirmReq.status === 200 && validConfirmReq.body.success === true && !user2InDbAfter && !profile2InDbAfter && notifs2InDbAfter === 0,
      `HTTP Status: ${validConfirmReq.status}, User Purged: ${!user2InDbAfter}, Profile Purged: ${!profile2InDbAfter}, Notifs Purged: ${notifs2InDbAfter === 0}`
    );

    // 2G: Simultaneous Confirmation / Reuse Prevention
    const reuseConfirmReq = await makeRequest('/api/auth/confirm-data-deletion', {
      method: 'POST',
      body: JSON.stringify({ email: email2, otp: '789123' })
    });
    recordResult(
      'Public Deletion: Simultaneous/Reused OTP Blocked',
      [400, 404].includes(reuseConfirmReq.status) && reuseConfirmReq.body.success !== true,
      `HTTP Status: ${reuseConfirmReq.status}, Message: "${reuseConfirmReq.body.message}"`
    );

    // -------------------------------------------------------------------------
    // TEST 3: IAP CRYPTOGRAPHIC SERVER-SIDE SECURITY
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: IAP Server-Side Security Controls ---');
    const user3 = await User.create({
      email: `test_iap_${Date.now()}@fluencer.test`,
      password: hashedPw1,
      role: 'influencer'
    });
    const token3 = generateToken(user3._id.toString(), 'influencer', 0);

    // 3A: Missing Store Keys Blocks Sandbox Verification
    const blockedIapReq = await makeRequest('/api/iap/verify-purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token3}` },
      body: JSON.stringify({
        platform: 'ios',
        productId: 'fluencer_pro_lifetime',
        transactionId: `tx_${Date.now()}`
      })
    });
    recordResult(
      'IAP: Missing Store Keys Correctly Blocks Sandbox Verification',
      blockedIapReq.status === 503 && blockedIapReq.body.isBlocked === true,
      `HTTP Status: ${blockedIapReq.status}, Code: "${blockedIapReq.body.code}", Blocked: ${blockedIapReq.body.isBlocked}`
    );

    // 3B: App Identity Mismatch
    const appMismatchReq = await makeRequest('/api/iap/verify-purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token3}` },
      body: JSON.stringify({
        platform: 'ios',
        productId: 'fluencer_pro_lifetime',
        bundleId: 'com.unauthorized.fakeapp',
        transactionId: `tx_fake_${Date.now()}`
      })
    });
    recordResult(
      'IAP: App Identity Mismatch Rejected',
      appMismatchReq.status === 403 && appMismatchReq.body.code === 'APP_IDENTITY_MISMATCH',
      `HTTP Status: ${appMismatchReq.status}, Code: "${appMismatchReq.body.code}"`
    );

    // 3C: Replay Attack Protection (Transaction already claimed by another user)
    const claimedTxId = `tx_claimed_${Date.now()}`;
    await IAPTransaction.create({
      transaction_id: claimedTxId,
      user_id: otherUser._id, // Belongs to other user
      platform: 'ios',
      product_id: 'fluencer_pro_lifetime',
      bundle_id: 'com.fluencers.app',
      status: 'purchased'
    });

    const replayReq = await makeRequest('/api/iap/verify-purchase', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token3}` },
      body: JSON.stringify({
        platform: 'ios',
        productId: 'fluencer_pro_lifetime',
        transactionId: claimedTxId
      })
    });
    recordResult(
      'IAP: Replay Attack Blocked (Transaction Claimed by Other User)',
      replayReq.status === 409 && replayReq.body.code === 'TRANSACTION_ALREADY_CLAIMED',
      `HTTP Status: ${replayReq.status}, Code: "${replayReq.body.code}", Message: "${replayReq.body.message}"`
    );

    // Clean up temporary other user & IAP transaction
    await User.findByIdAndDelete(otherUser._id);
    await User.findByIdAndDelete(user3._id);
    await IAPTransaction.deleteOne({ transaction_id: claimedTxId });

    console.log('================================================================');
    console.log(`FINAL RESULT: ${results.filter(r => r.passed).length} / ${results.length} TESTS PASSED`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Fatal Test Suite Error:', err);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runRigorousHttpTests();
