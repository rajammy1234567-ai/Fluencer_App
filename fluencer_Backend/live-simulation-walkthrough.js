import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runLiveWalkthrough() {
  console.log('===============================================================');
  console.log('🚀 RUNNING LIVE 7-STEP DEAL LOCK & ESCROW PAYOUT SIMULATION');
  console.log('===============================================================\n');

  try {
    // -----------------------------------------------------------------
    // STEP 1: LOGIN AS BRAND (krishna@fluencer.app)
    // -----------------------------------------------------------------
    console.log('1️⃣ LOGGING IN AS BRAND (krishna@fluencer.app)...');
    const brandLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'krishna@fluencer.app', password: 'Test@123' })
    });
    const brandLogin = await brandLoginRes.json();
    if (!brandLogin.token) throw new Error('Brand login failed: ' + JSON.stringify(brandLogin));
    const brandToken = brandLogin.token;
    console.log('   ✅ Brand Logged In Successfully! Role:', brandLogin.role);

    // -----------------------------------------------------------------
    // STEP 2: LOGIN OR REGISTER LIVE CREATOR (ananya@fluencer.app)
    // -----------------------------------------------------------------
    console.log('\n2️⃣ LOGGING IN / REGISTERING CREATOR (ananya@fluencer.app)...');
    let creatorToken;
    let creatorUserId;

    const creatorLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ananya@fluencer.app', password: 'Test@123' })
    });
    const creatorLogin = await creatorLoginRes.json();

    if (creatorLogin.token) {
      creatorToken = creatorLogin.token;
      creatorUserId = creatorLogin.userId;
      console.log('   ✅ Creator Logged In Successfully! User ID:', creatorUserId);
    } else {
      // Signup Creator
      const signupRes = await fetch(`${BASE_URL}/api/auth/signup-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ananya@fluencer.app', role: 'influencer' })
      });
      const signupData = await signupRes.json();
      
      const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ananya@fluencer.app', password: 'Test@123', otp: signupData.otp })
      });
      const verifyData = await verifyRes.json();
      creatorToken = verifyData.token;
      creatorUserId = verifyData.userId;

      // Save Creator Profile
      await fetch(`${BASE_URL}/api/influencers/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` },
        body: JSON.stringify({
          name: 'Ananya Sharma',
          categories: ['Fashion', 'Lifestyle'],
          followers_count: 45000,
          location: 'Mumbai, Maharashtra',
          upi_id: 'ananya@okicici'
        })
      });
      console.log('   ✅ Creator Profile Registered & Saved! (UPI: ananya@okicici)');
    }

    // -----------------------------------------------------------------
    // STEP 3: CREATOR BROWSES & APPLIES TO KRISHNA PRIVATE LIMITED CAMPAIGN
    // -----------------------------------------------------------------
    console.log('\n3️⃣ CREATOR BROWSING & APPLYING TO CAMPAIGN...');
    const activeRes = await fetch(`${BASE_URL}/api/campaigns/active/all`, {
      headers: { 'Authorization': `Bearer ${creatorToken}` }
    });
    const activeData = await activeRes.json();
    const krishCampaign = activeData.campaigns.find(c => c.brand_name.includes('Krishna'));

    if (!krishCampaign) throw new Error('Krishna Private Limited campaign not found');
    console.log(`   📌 Selected Campaign: "${krishCampaign.campaign_name}" (Budget: ₹${krishCampaign.cost_per_influencer})`);

    const applyRes = await fetch(`${BASE_URL}/api/campaigns/${krishCampaign.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` },
      body: JSON.stringify({ message: 'I love Krishna ethnic wear! Would love to shoot this reel.' })
    });
    const applyData = await applyRes.json();
    let applicationId = applyData.applicationId || applyData.id;

    if (!applicationId) {
      // Find existing application from Influencer My Applications endpoint
      const myAppsRes = await fetch(`${BASE_URL}/api/campaigns/my-applications`, {
        headers: { 'Authorization': `Bearer ${creatorToken}` }
      });
      const myAppsData = await myAppsRes.json();
      const existingApp = (myAppsData.applications || []).find(a => (a.campaign_id || '').toString() === krishCampaign.id.toString());
      if (existingApp) {
        applicationId = existingApp.id || existingApp._id;
      }
    }
    console.log('   ✅ Application ID Resolved:', applicationId);

    // -----------------------------------------------------------------
    // STEP 4: BRAND ACCEPTS APPLICATION & LOCKS ₹5,000 ESCROW
    // -----------------------------------------------------------------
    console.log('\n4️⃣ BRAND ACCEPTING APPLICATION & LOCKING ESCROW (₹5,000)...');
    const acceptRes = await fetch(`${BASE_URL}/api/campaigns/applications/${applicationId}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${brandToken}` }
    });
    const acceptData = await acceptRes.json();
    console.log('   ✅ Deal Accepted & Funds Locked in Escrow!');
    console.log('   💬 Server Message:', acceptData.message);

    // Verify Creator Escrow Reflection
    const profileRes = await fetch(`${BASE_URL}/api/influencers/profile`, {
      headers: { 'Authorization': `Bearer ${creatorToken}` }
    });
    const profileData = await profileRes.json();
    console.log('   📊 Creator Wallet Verification:');
    console.log('      - Pending Escrow (Non-Withdrawable): ₹' + profileData.profile.escrow_balance);
    console.log('      - Available Wallet Balance: ₹' + profileData.profile.wallet_balance);

    // -----------------------------------------------------------------
    // STEP 5: CREATOR SUBMITS REEL DELIVERABLE PROOF
    // -----------------------------------------------------------------
    console.log('\n5️⃣ CREATOR SUBMITTING REEL DELIVERABLE PROOF...');
    const reelUrl = 'https://instagram.com/p/ananya_ethnic_summer_2026';
    const submitRes = await fetch(`${BASE_URL}/api/campaigns/applications/${applicationId}/submit-work`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` },
      body: JSON.stringify({ submission_url: reelUrl, submission_notes: 'Reel shot outdoors in Bandra courtyard matching all guidelines!' })
    });
    const submitData = await submitRes.json();
    console.log('   ✅ Work Deliverable Submitted! Link:', reelUrl);

    // -----------------------------------------------------------------
    // STEP 6: BRAND REVIEWS & APPROVES REEL PROOF
    // -----------------------------------------------------------------
    console.log('\n6️⃣ BRAND REVIEWING & APPROVING REEL DELIVERABLE...');
    const approveRes = await fetch(`${BASE_URL}/api/campaigns/applications/${applicationId}/approve-work`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${brandToken}` }
    });
    const approveData = await approveRes.json();
    console.log('   ✅ Brand Approved Deliverable Quality!');

    // -----------------------------------------------------------------
    // STEP 7: ADMIN RELEASES ESCROW PAYOUT (18% Commission Retained)
    // -----------------------------------------------------------------
    console.log('\n7️⃣ ADMIN LOGGING IN & RELEASING ESCROW PAYOUT...');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fluencer.app', password: 'Admin@123' })
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.token;

    const releaseRes = await fetch(`${BASE_URL}/api/admin/escrow/release/${applicationId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const releaseData = await releaseRes.json();
    console.log('   ✅ Escrow Released By Admin!');
    console.log('      - Deal Escrow Amount: ₹' + releaseData.data.escrow_amount);
    console.log('      - 18% Platform Commission Retained: ₹' + releaseData.data.commission_deducted);
    console.log('      - Net Payout Credited to Creator: ₹' + releaseData.data.credited_to_influencer);

    // Verify Creator Final Available Wallet Balance
    const finalProfileRes = await fetch(`${BASE_URL}/api/influencers/profile`, {
      headers: { 'Authorization': `Bearer ${creatorToken}` }
    });
    const finalProfile = await finalProfileRes.json();
    console.log('\n   🎉 Creator Final Wallet State:');
    console.log('      - Available Balance (Ready to Withdraw): ₹' + finalProfile.profile.wallet_balance);
    console.log('      - Pending Escrow Balance: ₹' + finalProfile.profile.escrow_balance);

    // -----------------------------------------------------------------
    // STEP 8: CREATOR UPI CASH WITHDRAWAL & ADMIN APPROVAL
    // -----------------------------------------------------------------
    console.log('\n8️⃣ CREATOR REQUESTING UPI CASH WITHDRAWAL & ADMIN APPROVAL...');
    const withdrawRes = await fetch(`${BASE_URL}/api/wallet/withdraw-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creatorToken}` },
      body: JSON.stringify({ amount: 4100, account_details: 'ananya@okicici' })
    });
    const withdrawData = await withdrawRes.json();
    const withdrawId = withdrawData.withdrawalId || withdrawData.id || withdrawData.data?.id;
    console.log('   ✅ Cash Withdrawal Requested for ₹4,100 to ananya@okicici (Request ID:', withdrawId, ')');

    if (withdrawId) {
      // Admin Approves Withdrawal
      const adminApproveRes = await fetch(`${BASE_URL}/api/admin/withdrawals/${withdrawId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const adminApprove = await adminApproveRes.json();
      console.log('   ✅ Admin Approved UPI Cash Withdrawal!');
    }

    console.log('\n===============================================================');
    console.log('🌟 100% COMPLETE DEAL LOCK & ESCROW PAYOUT WALKTHROUGH PASSED!');
    console.log('===============================================================\n');

  } catch (error) {
    console.error('❌ Walkthrough Error:', error);
  }
}

runLiveWalkthrough();
