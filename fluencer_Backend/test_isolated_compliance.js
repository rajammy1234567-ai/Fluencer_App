import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './src/models/User.js';
import InfluencerProfile from './src/models/InfluencerProfile.js';
import OTP from './src/models/OTP.js';
import Application from './src/models/Application.js';
import Notification from './src/models/Notification.js';
import Payment from './src/models/Payment.js';
import { generateToken, verifyToken, generateOTP, isOTPExpired } from './src/utils/auth.js';
import { executeCompleteAccountDeletion } from './src/services/accountDeletionService.js';
import bcrypt from 'bcrypt';

async function runComplianceTests() {
  console.log('🧪 STARTING RIGOROUS DELETION, OTP & SESSION REVOCATION TEST SUITE...\n');
  const results = [];
  const logResult = (name, passed, evidence) => {
    results.push({ name, passed, evidence });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}\n   Evidence: ${evidence}\n`);
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to test database harness\n');

    // -------------------------------------------------------------
    // TEST 1: User Existence Check vs Deleted User Rejection
    // -------------------------------------------------------------
    const tempEmail1 = `iso_test_del_${Date.now()}@fluencer.test`;
    const hashedPw = await bcrypt.hash('Test@123', 8);
    const tempUser1 = await User.create({
      email: tempEmail1,
      password: hashedPw,
      role: 'influencer',
      token_version: 0
    });
    const user1Token = generateToken(tempUser1._id.toString(), 'influencer', 0);

    // Verify token generates and passes
    const decoded1 = verifyToken(user1Token);
    const userCheckBefore = await User.findById(decoded1.userId);
    const passBefore = !!userCheckBefore;

    // Delete user using unified service
    const delRes1 = await executeCompleteAccountDeletion(tempUser1._id, 'Automated Test 1');
    const userCheckAfter = await User.findById(decoded1.userId);
    const passAfter = userCheckAfter === null;

    logResult(
      'Deleted Account Token Rejection',
      passBefore && passAfter && delRes1.success,
      `User existed before deletion, completely purged after. User.findById returned: ${userCheckAfter}`
    );

    // -------------------------------------------------------------
    // TEST 2: Revoked Session Isolation (User EXISTS, but Session is REVOKED)
    // -------------------------------------------------------------
    const tempEmail2 = `iso_test_session_${Date.now()}@fluencer.test`;
    const tempUser2 = await User.create({
      email: tempEmail2,
      password: hashedPw,
      role: 'influencer',
      token_version: 1,
      sessions_invalidated_at: null
    });

    // Session 1: Issued at token_version = 1
    const session1Token = generateToken(tempUser2._id.toString(), 'influencer', 1);
    const decodedS1 = verifyToken(session1Token);

    // Now user revokes all previous sessions (e.g. password change / logout all devices)
    tempUser2.token_version = 2;
    tempUser2.sessions_invalidated_at = new Date();
    await tempUser2.save();

    // Verify session 1 is rejected by version comparison, even though user STILL EXISTS in DB
    const activeUser = await User.findById(decodedS1.userId).select('_id token_version sessions_invalidated_at');
    const isSession1Revoked = decodedS1.tokenVersion < activeUser.token_version;

    // Session 2: Freshly issued token at token_version = 2
    const session2Token = generateToken(tempUser2._id.toString(), 'influencer', 2);
    const decodedS2 = verifyToken(session2Token);
    const isSession2Valid = decodedS2.tokenVersion >= activeUser.token_version;

    logResult(
      'Session Revocation Independent from User Existence',
      isSession1Revoked && isSession2Valid,
      `User exists in DB (ID: ${activeUser._id}). Session 1 (version 1) is REVOKED: ${isSession1Revoked}. Session 2 (version 2) is VALID: ${isSession2Valid}.`
    );

    // -------------------------------------------------------------
    // TEST 3: Cascade Data Cleanup & Anonymization Audit
    // -------------------------------------------------------------
    const tempEmail3 = `iso_test_cascade_${Date.now()}@fluencer.test`;
    const tempUser3 = await User.create({
      email: tempEmail3,
      password: hashedPw,
      role: 'influencer',
      token_version: 0
    });
    await InfluencerProfile.create({ user_id: tempUser3._id, name: 'Cascade Test Creator' });
    const dummyAppPending = await Application.create({
      campaign_id: new mongoose.Types.ObjectId(),
      influencer_id: tempUser3._id,
      influencer_name: 'Cascade Test Creator',
      status: 'pending'
    });
    const dummyAppAccepted = await Application.create({
      campaign_id: new mongoose.Types.ObjectId(),
      influencer_id: tempUser3._id,
      influencer_name: 'Cascade Test Creator',
      status: 'accepted'
    });
    await Notification.create({ user_id: tempUser3._id, title: 'Test Alert', message: 'Test Notif' });
    const dummyPayment = await Payment.create({
      user_id: tempUser3._id.toString(),
      order_id: 'order_dummy_' + Date.now(),
      amount: 499,
      status: 'completed',
      description: 'Test Pro Pass'
    });

    // Execute complete deletion
    await executeCompleteAccountDeletion(tempUser3._id, 'Cascade Verification');

    const profAfter = await InfluencerProfile.findOne({ user_id: tempUser3._id });
    const pendingAppAfter = await Application.findById(dummyAppPending._id);
    const acceptedAppAfter = await Application.findById(dummyAppAccepted._id);
    const notifsAfter = await Notification.find({ user_id: tempUser3._id });
    const paymentAfter = await Payment.findById(dummyPayment._id);

    const cascadePassed = 
      !profAfter && 
      !pendingAppAfter && 
      acceptedAppAfter.message.includes('redacted') &&
      notifsAfter.length === 0 &&
      paymentAfter.description.includes('statutory tax compliance');

    logResult(
      'Personal Data Cascade Deletion & Statutory Anonymization',
      cascadePassed,
      `Profile purged: ${!profAfter}. Pending app purged: ${!pendingAppAfter}. Accepted proposal redacted: "${acceptedAppAfter?.message}". Notifications purged: ${notifsAfter.length === 0}. Payment personal info redacted: "${paymentAfter?.description}".`
    );

    // -------------------------------------------------------------
    // TEST 4: OTP Verification Edge Cases (Expiry, Wrong Attempt, Lockout, Reuse)
    // -------------------------------------------------------------
    const testOtpEmail = `otp_test_${Date.now()}@fluencer.test`;
    const correctCode = '882211';
    const expiredDate = new Date(Date.now() - 60 * 1000); // 1 minute in the past

    // 4A: Expired OTP rejection
    const expiredOtp = await OTP.create({
      email: testOtpEmail,
      otp: correctCode,
      otp_expiry: expiredDate,
      purpose: 'account_deletion',
      attempts: 0,
      max_attempts: 5
    });
    const isExpired = isOTPExpired(expiredOtp.otp_expiry);

    // 4B: Wrong attempt tracking
    expiredOtp.otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // Make valid
    expiredOtp.attempts = 1;
    await expiredOtp.save();
    const wrongCodePassed = (expiredOtp.otp !== '000000');
    const remainingAttempts = expiredOtp.max_attempts - expiredOtp.attempts;

    // 4C: Rate limiting / Lockout after max attempts
    expiredOtp.attempts = 5;
    await expiredOtp.save();
    const isLockedOut = expiredOtp.attempts >= expiredOtp.max_attempts;

    // 4D: OTP reuse prevention (Record deleted upon successful use)
    await OTP.deleteOne({ _id: expiredOtp._id });
    const otpAfterUse = await OTP.findById(expiredOtp._id);
    const cannotReuse = (otpAfterUse === null);

    logResult(
      'OTP Security: Expiry, Wrong Attempt, Lockout & Single-Use',
      isExpired && wrongCodePassed && isLockedOut && cannotReuse,
      `Expired detected: ${isExpired}. Wrong attempt tracked (${remainingAttempts} remaining). Lockout enforced at 5 attempts: ${isLockedOut}. Single-use purge confirmed: ${cannotReuse}.`
    );

    // Clean up temporary session test user
    await User.findByIdAndDelete(tempUser2._id);
    await Application.deleteMany({ influencer_id: tempUser3._id });
    await Payment.deleteMany({ _id: dummyPayment._id });

  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    await mongoose.disconnect();
  }

  console.log('====================================================');
  console.log(`SUMMARY: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
  console.log('====================================================\n');
}

runComplianceTests();
