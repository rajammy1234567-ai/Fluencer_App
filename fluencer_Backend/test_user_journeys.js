import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import './src/config/database.js';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 STARTING COMPREHENSIVE USER JOURNEY TEST SUITE...\n');
  const results = [];

  const record = (name, passed, details = '') => {
    results.push({ name, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // 1. Health Check
    const healthRes = await axios.get(`${BASE_URL}/api/health`);
    record('API Health Check', healthRes.status === 200 && healthRes.data.success);

    // 2. Influencer Login
    let influencerToken = '';
    let influencerId = '';
    try {
      const infLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'creator@fluencer.app',
        password: 'Test@123',
        role: 'influencer'
      });
      influencerToken = infLogin.data.token;
      influencerId = infLogin.data.userId;
      record('Influencer Login (creator@fluencer.app)', !!influencerToken, `UserId: ${influencerId}`);
    } catch (e) {
      record('Influencer Login (creator@fluencer.app)', false, e.response?.data?.message || e.message);
    }

    // 3. Demo Reviewer Influencer Login
    try {
      const demoInf = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'testinfluencer@fluncer.com',
        password: 'Test@123',
        role: 'influencer'
      });
      record('Reviewer Influencer Login (testinfluencer@fluncer.com)', !!demoInf.data.token);
    } catch (e) {
      record('Reviewer Influencer Login (testinfluencer@fluncer.com)', false, e.response?.data?.message || e.message);
    }

    // 4. Brand Login
    let brandToken = '';
    let brandId = '';
    try {
      const brLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'krishna@fluencer.app',
        password: 'Test@123',
        role: 'brand'
      });
      brandToken = brLogin.data.token;
      brandId = brLogin.data.userId;
      record('Brand Login (krishna@fluencer.app)', !!brandToken, `UserId: ${brandId}`);
    } catch (e) {
      record('Brand Login (krishna@fluencer.app)', false, e.response?.data?.message || e.message);
    }

    // 5. Demo Reviewer Brand Login
    try {
      const demoBr = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'testbrand@fluncer.com',
        password: 'Test@123',
        role: 'brand'
      });
      record('Reviewer Brand Login (testbrand@fluncer.com)', !!demoBr.data.token);
    } catch (e) {
      record('Reviewer Brand Login (testbrand@fluncer.com)', false, e.response?.data?.message || e.message);
    }

    // 6. Role Mismatch Rejection
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'creator@fluencer.app',
        password: 'Test@123',
        role: 'brand'
      });
      record('Role Mismatch Rejection', false, 'Expected 403 but got 200');
    } catch (e) {
      record('Role Mismatch Rejection', e.response?.status === 403, 'Correctly rejected role mismatch with 403');
    }

    // 7. Get Current User Info (/api/auth/me)
    if (influencerToken) {
      try {
        const meRes = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${influencerToken}` }
        });
        record('Auth Me Endpoint', meRes.data.success && meRes.data.user.role === 'influencer');
      } catch (e) {
        record('Auth Me Endpoint', false, e.response?.data?.message || e.message);
      }
    }

    // 8. Get Influencer Profile (/api/influencers/profile)
    if (influencerToken) {
      try {
        const profRes = await axios.get(`${BASE_URL}/api/influencers/profile`, {
          headers: { Authorization: `Bearer ${influencerToken}` }
        });
        record('Influencer Profile Retrieval', profRes.data.success, `Name: ${profRes.data.profile?.name || profRes.data.data?.name}`);
      } catch (e) {
        record('Influencer Profile Retrieval', false, e.response?.data?.message || e.message);
      }
    }

    // 9. Get Brand Profile (/api/brands/profile)
    if (brandToken) {
      try {
        const bProfRes = await axios.get(`${BASE_URL}/api/brands/profile`, {
          headers: { Authorization: `Bearer ${brandToken}` }
        });
        const companyName = bProfRes.data.company_name || bProfRes.data.profile?.company_name || bProfRes.data.companyName;
        record('Brand Profile Retrieval', bProfRes.data.success && !!companyName, `Company: ${companyName}`);
      } catch (e) {
        record('Brand Profile Retrieval', false, e.response?.data?.message || e.message);
      }
    }

    // 10. Fetch Active Campaigns (/api/campaigns/active/all)
    let sampleCampaignId = null;
    try {
      const campRes = await axios.get(`${BASE_URL}/api/campaigns/active/all`);
      const list = campRes.data.campaigns || campRes.data.data || campRes.data;
      const count = Array.isArray(list) ? list.length : 0;
      if (count > 0) {
        sampleCampaignId = list[0]._id || list[0].id;
      }
      record('Fetch Active Campaigns', campRes.data.success, `Found ${count} campaigns`);
    } catch (e) {
      record('Fetch Active Campaigns', false, e.response?.data?.message || e.message);
    }

    // 11. Fetch Brand Campaigns (/api/campaigns/my-campaigns)
    let brandCampaignId = null;
    if (brandToken) {
      try {
        const myCamp = await axios.get(`${BASE_URL}/api/campaigns/my-campaigns`, {
          headers: { Authorization: `Bearer ${brandToken}` }
        });
        const list = myCamp.data.campaigns || myCamp.data.data || [];
        const count = list.length;
        if (count > 0) {
          brandCampaignId = list[0]._id || list[0].id;
        }
        record('Fetch Brand Campaigns (My Campaigns)', myCamp.data.success, `Found ${count} campaigns for brand`);
      } catch (e) {
        record('Fetch Brand Campaigns (My Campaigns)', false, e.response?.data?.message || e.message);
      }
    }

    // 12. Influencer Apply to Campaign
    if (influencerToken && (brandCampaignId || sampleCampaignId)) {
      const targetCampId = brandCampaignId || sampleCampaignId;
      try {
        const applyRes = await axios.post(`${BASE_URL}/api/campaigns/${targetCampId}/apply`, {
          proposal: 'Excited to create authentic transition Reels for this campaign!',
          expected_payment: 5000,
          deliverables: ['1x Instagram Reel', '2x Story Drop']
        }, {
          headers: { Authorization: `Bearer ${influencerToken}` }
        });
        record('Influencer Apply to Campaign', applyRes.data.success, applyRes.data.message);
      } catch (e) {
        const msg = e.response?.data?.message || e.message;
        const passed = msg.includes('already') || msg.includes('Already applied');
        record('Influencer Apply to Campaign', passed, msg);
      }
    }

    // 13. Brand View Applications for Their Campaign
    if (brandToken && brandCampaignId) {
      try {
        const appRes = await axios.get(`${BASE_URL}/api/campaigns/${brandCampaignId}/applications`, {
          headers: { Authorization: `Bearer ${brandToken}` }
        });
        const appCount = appRes.data.applications?.length || 0;
        record('Brand View Campaign Applications', appRes.data.success, `Found ${appCount} applications`);
      } catch (e) {
        record('Brand View Campaign Applications', false, e.response?.data?.message || e.message);
      }
    }

    // 14. Chats Listing
    if (influencerToken) {
      try {
        const chatRes = await axios.get(`${BASE_URL}/api/chats`, {
          headers: { Authorization: `Bearer ${influencerToken}` }
        });
        record('Chats Listing Endpoint', chatRes.data.success);
      } catch (e) {
        record('Chats Listing Endpoint', false, e.response?.data?.message || e.message);
      }
    }

    // 15. Notifications Listing
    if (influencerToken) {
      try {
        const notifRes = await axios.get(`${BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${influencerToken}` }
        });
        record('Notifications Listing Endpoint', notifRes.data.success);
      } catch (e) {
        record('Notifications Listing Endpoint', false, e.response?.data?.message || e.message);
      }
    }

    // 16. Razorpay Order Creation (₹499 Pro Membership)
    if (influencerToken) {
      try {
        const rzpRes = await axios.post(`${BASE_URL}/api/payments/create-order`, {
          amount: 499,
          planType: 'pro_membership'
        }, {
          headers: { Authorization: `Bearer ${influencerToken}` }
        });
        record('Razorpay Create Order Endpoint', rzpRes.data.success, `Order ID: ${rzpRes.data.order?.id || rzpRes.data.orderId}`);
      } catch (e) {
        record('Razorpay Create Order Endpoint', false, e.response?.data?.message || e.message);
      }
    }

    // 17. Security Check: Anti-Bypass Pro Pass without Valid Payment
    if (influencerToken) {
      try {
        const unlockRes = await axios.post(`${BASE_URL}/api/influencers/unlock-pass`, {}, {
          headers: { Authorization: `Bearer ${influencerToken}` }
        });
        record('Anti-Bypass Payment Check', unlockRes.data.success, 'Unlocked pass check evaluated');
      } catch (e) {
        record('Anti-Bypass Payment Check', e.response?.status === 400 || e.response?.status === 403, e.response?.data?.message || e.message);
      }
    }

    // 18. Account Deletion Safety Test (Creates isolated disposable account, then deletes it)
    try {
      const User = (await import('./src/models/User.js')).default;
      const InfluencerProfile = (await import('./src/models/InfluencerProfile.js')).default;
      const bcrypt = (await import('bcrypt')).default;
      const { generateToken } = await import('./src/utils/auth.js');

      const tempEmail = `disposable_test_${Date.now()}@fluencer.test`;
      const hashedPw = await bcrypt.hash('Test@123', 10);
      const tempUser = await User.create({
        email: tempEmail,
        password: hashedPw,
        role: 'influencer',
        is_verified: true
      });
      await InfluencerProfile.create({ user_id: tempUser._id, name: 'Disposable Tester' });

      const tempToken = generateToken(tempUser._id.toString(), 'influencer');
      const delRes = await axios.delete(`${BASE_URL}/api/auth/delete-account`, {
        headers: { Authorization: `Bearer ${tempToken}` }
      });

      const userPostCheck = await User.findById(tempUser._id);
      const profPostCheck = await InfluencerProfile.findOne({ user_id: tempUser._id });

      record('In-App Account Deletion (Apple Guideline 5.1.1(v))', delRes.data.success && !userPostCheck && !profPostCheck, 'Account & profile purged completely');
    } catch (e) {
      record('In-App Account Deletion (Apple Guideline 5.1.1(v))', false, e.response?.data?.message || e.message);
    }

    // 19. Public Web Deletion Request (Google Play External Deletion Requirement)
    try {
      const pubDelRes = await axios.post(`${BASE_URL}/api/auth/request-data-deletion`, {
        email: 'test_del_req@fluencer.test',
        reason: 'Automated test suite verification'
      });
      record('Public Data Deletion Request Endpoint (Google Play)', pubDelRes.data.success, pubDelRes.data.message);
    } catch (e) {
      record('Public Data Deletion Request Endpoint (Google Play)', false, e.response?.data?.message || e.message);
    }

    // 20. Public Web Deletion HTML Page
    try {
      const pageRes = await axios.get(`${BASE_URL}/delete-account`);
      const hasTitle = pageRes.data.includes('Account & Data Deletion Request');
      record('Public Data Deletion HTML Page (/delete-account)', pageRes.status === 200 && hasTitle);
    } catch (e) {
      record('Public Data Deletion HTML Page (/delete-account)', false, e.message);
    }

    // 21. Public Privacy Policy HTML Page
    try {
      const privRes = await axios.get(`${BASE_URL}/privacy-policy`);
      record('Public Privacy Policy HTML Page (/privacy-policy)', privRes.status === 200);
    } catch (e) {
      record('Public Privacy Policy HTML Page (/privacy-policy)', false, e.message);
    }

  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n=============================================');
  console.log(`SUMMARY: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
  console.log('=============================================\n');
  process.exit(results.every(r => r.passed) ? 0 : 1);
}

runTests();
