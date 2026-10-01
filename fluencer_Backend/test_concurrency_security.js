import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import mongoose from 'mongoose';
import { startStagingServer } from './src/staging/stagingServer.js';
import User from './src/models/User.js';
import InfluencerProfile from './src/models/InfluencerProfile.js';
import BrandProfile from './src/models/BrandProfile.js';
import Campaign from './src/models/Campaign.js';
import Application from './src/models/Application.js';
import Message from './src/models/Message.js';
import { generateToken } from './src/utils/auth.js';

const STAGING_PORT = 5052;
const BASE_URL = `http://127.0.0.1:${STAGING_PORT}`;

async function runConcurrencySecuritySuite() {
  console.log('================================================================');
  console.log('🧪 STAGE 2: RIGOROUS CONCURRENCY & SECURITY INTEGRITY TEST SUITE');
  console.log('================================================================\n');

  const staging = await startStagingServer(STAGING_PORT);
  const runTag = `conc_${Date.now()}`;
  const results = [];

  const record = (name, passed, evidence) => {
    results.push({ name, passed, evidence });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}`);
    if (evidence) console.log(`   Evidence: ${evidence}`);
  };

  try {
    // Setup 1 Brand and 2 Creators
    const brandUser = await User.create({
      email: `${runTag}_brand@test.conc`,
      password: 'HashPassword123!',
      role: 'brand',
      token_version: 0
    });
    const brandToken = generateToken(brandUser._id.toString(), 'brand', 0);
    await BrandProfile.create({
      user_id: brandUser._id,
      company_name: 'Security Brand Ltd',
      category: 'Security Testing',
      address: 'Cyber City',
      wallet_balance: 100000
    });

    const creatorUser1 = await User.create({
      email: `${runTag}_creator1@test.conc`,
      password: 'HashPassword123!',
      role: 'influencer',
      token_version: 0
    });
    const creatorToken1 = generateToken(creatorUser1._id.toString(), 'influencer', 0);
    await InfluencerProfile.create({
      user_id: creatorUser1._id,
      name: 'Creator One',
      categories: ['Lifestyle'],
      location: 'Delhi',
      is_pro_member: true
    });

    const creatorUser2 = await User.create({
      email: `${runTag}_creator2@test.conc`,
      password: 'HashPassword123!',
      role: 'influencer',
      token_version: 0
    });
    const creatorToken2 = generateToken(creatorUser2._id.toString(), 'influencer', 0);
    await InfluencerProfile.create({
      user_id: creatorUser2._id,
      name: 'Creator Two',
      categories: ['Tech'],
      location: 'Bangalore',
      is_pro_member: false // Un-entitled
    });

    const campaign = await Campaign.create({
      brand_id: brandUser._id,
      campaign_name: `${runTag} Security Test Campaign`,
      influencer_location: 'India',
      campaign_type: 'paid',
      content_type: 'reel',
      number_of_seats: 2,
      min_followers: 5000,
      cost_per_influencer: 10000,
      status: 'open'
    });

    // -------------------------------------------------------------
    // CHECK 1: SIMULTANEOUS DUPLICATE APPLICATIONS (RACE CONDITION)
    // -------------------------------------------------------------
    // Firing 10 identical application requests from Creator 1 simultaneously
    console.log('⚡ Firing 10 simultaneous application requests (Race Condition Burst)...');
    const burstPromises = Array.from({ length: 10 }).map((_, idx) =>
      axios.post(
        `${BASE_URL}/api/campaigns/${campaign._id}/apply`,
        { message: `Simultaneous attempt #${idx}` },
        { headers: { Authorization: `Bearer ${creatorToken1}` } }
      ).then(res => ({ status: res.status, data: res.data }))
       .catch(err => ({ status: err.response?.status, data: err.response?.data }))
    );

    const burstResponses = await Promise.all(burstPromises);
    const createdCount = burstResponses.filter(r => r.status === 201).length;
    const rejectedCount = burstResponses.filter(r => r.status === 400 && r.data?.already_applied).length;
    const actualAppsInDb = await Application.countDocuments({
      campaign_id: campaign._id,
      influencer_id: creatorUser1._id
    });

    record(
      'Race Condition: Simultaneous Applications Guarded',
      createdCount === 1 && rejectedCount === 9 && actualAppsInDb === 1,
      `201 Created: ${createdCount}, 400 Rejected: ${rejectedCount}, Exactly 1 record in DB: ${actualAppsInDb === 1}`
    );

    // -------------------------------------------------------------
    // CHECK 2: SIMULTANEOUS ATTEMPT TO BYPASS PRO PASS
    // -------------------------------------------------------------
    // Creator 2 (is_pro_member: false) fires 5 simultaneous apply requests
    const unauthBurst = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        axios.post(
          `${BASE_URL}/api/campaigns/${campaign._id}/apply`,
          { message: 'Bypass attempt' },
          { headers: { Authorization: `Bearer ${creatorToken2}` } }
        ).then(res => res.status)
         .catch(err => err.response?.status)
      )
    );
    const allRejected403 = unauthBurst.every(s => s === 403);
    record(
      'Simultaneous Requests Cannot Bypass Entitlement Barrier',
      allRejected403,
      `All 5 concurrent requests rejected with HTTP 403: ${allRejected403}`
    );

    // -------------------------------------------------------------
    // CHECK 3: ROLE ISOLATION & PRIVILEGE ESCALATION PREVENTION
    // -------------------------------------------------------------
    // Creator attempts to call Brand-only campaign creation
    let creatorCreateCampStatus = 0;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/campaigns`,
        { campaign_name: 'Hacked Campaign', campaign_type: 'paid', content_type: 'reel', number_of_seats: 1 },
        { headers: { Authorization: `Bearer ${creatorToken1}` } }
      );
      creatorCreateCampStatus = res.status;
    } catch (e) {
      creatorCreateCampStatus = e.response?.status;
    }

    // Brand attempts to call Creator-only application submission
    let brandApplyStatus = 0;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/campaigns/${campaign._id}/apply`,
        { message: 'Brand applying' },
        { headers: { Authorization: `Bearer ${brandToken}` } }
      );
      brandApplyStatus = res.status;
    } catch (e) {
      brandApplyStatus = e.response?.status;
    }

    record(
      'Role Enforcement: Bidirectional Escalation Rejection',
      creatorCreateCampStatus === 403 && brandApplyStatus === 403,
      `Creator -> Brand Route: HTTP ${creatorCreateCampStatus}, Brand -> Creator Route: HTTP ${brandApplyStatus}`
    );

    // -------------------------------------------------------------
    // CHECK 4: DATA ISOLATION - CANNOT READ ANOTHER USER'S PRIVATE MESSAGES
    // -------------------------------------------------------------
    // Brand and Creator 1 have a message
    await Message.create({
      sender_id: brandUser._id,
      receiver_id: creatorUser1._id,
      message: 'Private Negotiation Details NDA #991'
    });

    // Creator 2 tries to fetch messages with Brand
    const creator2MessagesRes = await axios.get(
      `${BASE_URL}/api/messages/${brandUser._id}`,
      { headers: { Authorization: `Bearer ${creatorToken2}` } }
    );
    const leakedMessages = (creator2MessagesRes.data.messages || []).filter(
      m => m.message.includes('NDA #991')
    );

    record(
      'Data Isolation: Zero Cross-Account Message Leakage',
      creator2MessagesRes.status === 200 && leakedMessages.length === 0,
      `Target messages found in 3rd party query: ${leakedMessages.length}`
    );

    // -------------------------------------------------------------
    // CHECK 5: SIMULTANEOUS WALLET ESCROW ATOMICITY
    // -------------------------------------------------------------
    // Create an application for Creator 1 and accept it
    const appRecord = await Application.findOne({
      campaign_id: campaign._id,
      influencer_id: creatorUser1._id
    });

    const initBrandProfile = await BrandProfile.findOne({ user_id: brandUser._id });
    const initialWallet = initBrandProfile.wallet_balance;

    // Firing 5 concurrent acceptance requests on the same application
    const acceptPromises = Array.from({ length: 5 }).map(() =>
      axios.post(
        `${BASE_URL}/api/campaigns/applications/${appRecord._id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${brandToken}` } }
      ).then(r => r.status).catch(e => e.response?.status)
    );
    await Promise.all(acceptPromises);

    const finalBrandProfile = await BrandProfile.findOne({ user_id: brandUser._id });
    const deductedAmount = initialWallet - finalBrandProfile.wallet_balance;

    record(
      'Escrow Deduction Atomicity: No Duplicate Charges on Concurrent Acceptance',
      deductedAmount === campaign.cost_per_influencer,
      `Expected deduction: ₹${campaign.cost_per_influencer}, Actual deduction: ₹${deductedAmount}`
    );

  } finally {
    console.log('\n🧹 Cleaning up Stage 2 synthetic test records...');
    const testUsers = await User.find({ email: new RegExp(`^${runTag}`, 'i') });
    for (const u of testUsers) {
      await InfluencerProfile.deleteMany({ user_id: u._id });
      await BrandProfile.deleteMany({ user_id: u._id });
      await Campaign.deleteMany({ brand_id: u._id });
      await Application.deleteMany({ $or: [{ influencer_id: u._id }, { campaign_id: { $in: await Campaign.find({ brand_id: u._id }).distinct('_id') } }] });
      await Message.deleteMany({ $or: [{ sender_id: u._id }, { receiver_id: u._id }] });
      await User.findByIdAndDelete(u._id);
    }
    await staging.close();
    console.log('✅ Stage 2 synthetic cleanup complete.\n');
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log(`📊 STAGE 2 CONCURRENCY SUMMARY: ${passedCount} / ${results.length} PASSED`);
  return { passedCount, totalCount: results.length, allPassed: passedCount === results.length };
}

runConcurrencySecuritySuite().then((res) => {
  if (!res.allPassed) process.exit(1);
}).catch(err => {
  console.error('Fatal concurrency suite error:', err);
  process.exit(1);
});
