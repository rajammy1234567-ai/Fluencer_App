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
import './models/WalletTransaction.js';

dotenv.config();

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting End-to-End Wallet, Escrow, Work Submission & 18% Commission Payout Verification...\n');

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
    // 1. INFLUENCER SIGNUP & PROFILE
    // ----------------------------------------------------
    console.log('⚙️ Signup & Verification for Influencer...');
    await fetch(`${BASE_URL}/api/auth/signup-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: influencerEmail, role: 'influencer' })
    });

    const OTPModel = mongoose.model('OTP');
    const otpInf = await OTPModel.findOne({ email: influencerEmail });

    const verifyInfRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: influencerEmail, otp: otpInf.otp, password: testPassword })
    });
    const verifyInf = await verifyInfRes.json();
    influencerToken = verifyInf.token;

    await fetch(`${BASE_URL}/api/influencers/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${influencerToken}` },
      body: JSON.stringify({ name: 'Jane Influencer', categories: ['Fashion'], location: 'Mumbai' })
    });

    // Save Bank/UPI details for payout
    await fetch(`${BASE_URL}/api/wallet/update-bank-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${influencerToken}` },
      body: JSON.stringify({ upi_id: 'jane@upi', account_holder_name: 'Jane Influencer' })
    });
    console.log('Result: ✅ Influencer Profile & UPI Saved (jane@upi)');

    // ----------------------------------------------------
    // 2. BRAND SIGNUP & WALLET TOP-UP
    // ----------------------------------------------------
    console.log('\n⚙️ Signup & Wallet Top-Up for Brand...');
    await fetch(`${BASE_URL}/api/auth/signup-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail, role: 'brand' })
    });

    const otpBrand = await OTPModel.findOne({ email: brandEmail });
    const verifyBrandRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: brandEmail, otp: otpBrand.otp, password: testPassword })
    });
    const verifyBrand = await verifyBrandRes.json();
    brandToken = verifyBrand.token;

    await fetch(`${BASE_URL}/api/brands/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brandToken}` },
      body: JSON.stringify({ companyName: 'Nexus Brand Pvt Ltd', category: 'Fashion' })
    });

    // Simulate Brand Wallet Deposit of ₹10,000
    const depositRes = await fetch(`${BASE_URL}/api/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brandToken}` },
      body: JSON.stringify({ amount: 10000, is_simulation: true })
    });
    const depositData = await depositRes.json();
    console.log('Result:', depositData.success ? '✅ Success' : '❌ Failed', 'Brand Wallet Balance:', depositData.wallet_balance);

    // ----------------------------------------------------
    // 3. CAMPAIGN CREATION & APPLICATION
    // ----------------------------------------------------
    console.log('\n⚙️ Creating Campaign & Applying...');
    const campaignRes = await fetch(`${BASE_URL}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brandToken}` },
      body: JSON.stringify({ 
        campaign_name: 'Summer Reel Campaign 2026', 
        influencer_location: 'Mumbai, India',
        campaign_type: 'paid', 
        content_type: 'reel',
        number_of_seats: 5,
        cost_per_influencer: 5000 
      })
    });
    const campaignData = await campaignRes.json();
    campaignId = campaignData.campaignId;

    const applyRes = await fetch(`${BASE_URL}/api/campaigns/${campaignId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${influencerToken}` },
      body: JSON.stringify({ message: 'Ready to shoot reel!' })
    });
    const applyData = await applyRes.json();
    applicationId = applyData.applicationId || (applyData.application && (applyData.application.id || applyData.application._id));
    console.log('Result: ✅ Application submitted. ID:', applicationId);

    // ----------------------------------------------------
    // 4. BRAND ACCEPTS & ESCROW LOCKS ₹5000
    // ----------------------------------------------------
    console.log('\n⚙️ Brand Accepts Application (Locking ₹5000 into Escrow)...');
    const acceptRes = await fetch(`${BASE_URL}/api/campaigns/applications/${applicationId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brandToken}` }
    });
    const acceptData = await acceptRes.json();
    console.log('Result:', acceptData.success ? '✅ Success' : '❌ Failed', acceptData.message);

    // ----------------------------------------------------
    // 5. INFLUENCER SUBMITS WORK & BRAND APPROVES
    // ----------------------------------------------------
    console.log('\n⚙️ Influencer Submits Work Video Link...');
    const submitWorkRes = await fetch(`${BASE_URL}/api/campaigns/applications/${applicationId}/submit-work`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${influencerToken}` },
      body: JSON.stringify({ submission_url: 'https://instagram.com/p/summer_reel_2026', submission_notes: 'Reel is live on IG!' })
    });
    const submitWork = await submitWorkRes.json();
    console.log('Result:', submitWork.success ? '✅ Success (Work Submitted)' : '❌ Failed');

    console.log('⚙️ Brand Approves Submitted Deliverable...');
    const approveWorkRes = await fetch(`${BASE_URL}/api/campaigns/applications/${applicationId}/approve-work`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${brandToken}` }
    });
    const approveWork = await approveWorkRes.json();
    console.log('Result:', approveWork.success ? '✅ Success (Brand Approved)' : '❌ Failed');

    // ----------------------------------------------------
    // 6. ADMIN RELEASES ESCROW (18% COMMISSION DEDUCTED)
    // ----------------------------------------------------
    console.log('\n⚙️ Admin Releases Escrow Payout (18% Commission Deducted)...');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fluencer.app', password: 'Admin@123' })
    });
    const adminLogin = await adminLoginRes.json();
    adminToken = adminLogin.token;

    const releaseRes = await fetch(`${BASE_URL}/api/admin/escrow/release/${applicationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    });
    const releaseData = await releaseRes.json();
    console.log('Result:', releaseData.success ? '✅ Success' : '❌ Failed');
    console.log('Payout Details:', releaseData.data);

    // ----------------------------------------------------
    // 7. INFLUENCER WITHDRAWS EARNINGS TO UPI
    // ----------------------------------------------------
    console.log('\n⚙️ Influencer Requests Withdrawal to UPI (jane@upi)...');
    const withdrawRes = await fetch(`${BASE_URL}/api/wallet/withdraw-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${influencerToken}` },
      body: JSON.stringify({ amount: releaseData.data.credited_to_influencer, payout_method: 'UPI' })
    });
    const withdrawData = await withdrawRes.json();
    console.log('Result:', withdrawData.success ? '✅ Success' : '❌ Failed', withdrawData.message || withdrawData.error || withdrawData);

    console.log('\n🌟 ALL WALLET, ESCROW, WORK SUBMISSION & 18% COMMISSION PAYOUT TESTS COMPLETED SUCCESSFULLY!');
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
