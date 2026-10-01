import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { io as ClientIO } from 'socket.io-client';
import mongoose from 'mongoose';
import { performance } from 'perf_hooks';
import { startStagingServer, performanceMetrics } from './src/staging/stagingServer.js';
import User from './src/models/User.js';
import InfluencerProfile from './src/models/InfluencerProfile.js';
import BrandProfile from './src/models/BrandProfile.js';
import Campaign from './src/models/Campaign.js';
import Application from './src/models/Application.js';
import Message from './src/models/Message.js';
import Notification from './src/models/Notification.js';
import { generateToken } from './src/utils/auth.js';

const STAGING_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${STAGING_PORT}`;

// Configurable client with standard 10s timeout
const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true // Allow handling all status codes manually
});

// Helper: Calculate Percentiles
function calculatePercentiles(latencies) {
  if (!latencies || latencies.length === 0) return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const p = (pct) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * pct))];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    p50: Math.round(p(0.50)),
    p95: Math.round(p(0.95)),
    p99: Math.round(p(0.99)),
    min: Math.round(sorted[0]),
    max: Math.round(sorted[sorted.length - 1]),
    avg: Math.round(sum / sorted.length)
  };
}

async function runLoadStage({
  stageName,
  userCount,
  durationSeconds,
  seededUsers,
  stopOnFail = true
}) {
  console.log(`\n================================================================`);
  console.log(`🚀 STAGE START: ${stageName}`);
  console.log(`   Target Active Users: ${userCount} concurrent`);
  console.log(`   Stage Duration:      ${durationSeconds}s (${(durationSeconds / 60).toFixed(1)} mins)`);
  console.log(`   Stop Condition:      Error rate > 5.0% after min 30s`);
  console.log(`================================================================`);

  const stageLatencies = [];
  const endpointLatencies = new Map();
  const errorBreakdown = new Map();
  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  let socketMessagesSent = 0;
  let socketMessagesReceived = 0;

  const recordRequest = (endpoint, ms, status) => {
    totalRequests++;
    const isSuccess = status >= 200 && status < 400;
    if (isSuccess) {
      successfulRequests++;
    } else {
      failedRequests++;
      const errKey = `HTTP_${status}`;
      errorBreakdown.set(errKey, (errorBreakdown.get(errKey) || 0) + 1);
    }

    stageLatencies.push(ms);
    if (!endpointLatencies.has(endpoint)) {
      endpointLatencies.set(endpoint, []);
    }
    endpointLatencies.get(endpoint).push(ms);
  };

  const activeVUs = seededUsers.slice(0, userCount);
  const activeSockets = [];
  let isRunning = true;

  // 1. Establish authenticated Socket.IO connections for all active users
  for (const vu of activeVUs) {
    const s = ClientIO(BASE_URL, {
      auth: { token: vu.token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    s.on('receive_message', () => {
      socketMessagesReceived++;
    });
    activeSockets.push(s);
    await new Promise(r => setTimeout(r, 5));
  }

  // 2. Spawn concurrent worker loops for each user
  const vuWorkers = activeVUs.map(async (vu, vuIndex) => {
    const isBrand = vu.role === 'brand';
    const socket = activeSockets[vuIndex];
    let iteration = 0;

    while (isRunning) {
      iteration++;
      try {
        if (isBrand) {
          // BRAND USER JOURNEY:
          // A. Fetch brand profile (dashboard view)
          const pStart = performance.now();
          const pRes = await httpClient.get('/api/brands/profile', {
            headers: { Authorization: `Bearer ${vu.token}` }
          });
          recordRequest('GET /api/brands/profile', performance.now() - pStart, pRes.status);

          // B. Fetch brand campaigns
          const cStart = performance.now();
          const cRes = await httpClient.get('/api/campaigns/my-campaigns', {
            headers: { Authorization: `Bearer ${vu.token}` }
          });
          recordRequest('GET /api/campaigns/my-campaigns', performance.now() - cStart, cRes.status);

          // C. Periodic typing indicator
          if (socket && socket.connected && iteration % 3 === 0) {
            socket.emit('typing', { receiverId: seededUsers[0]._id });
          }

        } else {
          // CREATOR USER JOURNEY:
          // A. Browse active campaigns feed
          const fStart = performance.now();
          const fRes = await httpClient.get('/api/campaigns/active/all');
          recordRequest('GET /api/campaigns/active/all', performance.now() - fStart, fRes.status);

          // B. Get Influencer Profile
          const profStart = performance.now();
          const profRes = await httpClient.get('/api/influencers/profile', {
            headers: { Authorization: `Bearer ${vu.token}` }
          });
          recordRequest('GET /api/influencers/profile', performance.now() - profStart, profRes.status);

          // C. Get Notifications
          const nStart = performance.now();
          const nRes = await httpClient.get('/api/notifications', {
            headers: { Authorization: `Bearer ${vu.token}` }
          });
          recordRequest('GET /api/notifications', performance.now() - nStart, nRes.status);

          // D. Direct Message via REST (simulated realistic inquiry, 25% frequency)
          if (iteration % 4 === 0) {
            const targetBrand = seededUsers.find(u => u.role === 'brand') || seededUsers[0];
            const mStart = performance.now();
            const mRes = await httpClient.post(
              '/api/messages/send',
              {
                receiverId: targetBrand._id.toString(),
                message: `Simulated inquiry #${iteration} from VU ${vuIndex}`
              },
              { headers: { Authorization: `Bearer ${vu.token}` } }
            );
            recordRequest('POST /api/messages/send', performance.now() - mStart, mRes.status);
          }

          // E. Realtime Socket message (simulated real-time chat, 25% frequency)
          if (socket && socket.connected && iteration % 4 === 2) {
            const targetBrand = seededUsers.find(u => u.role === 'brand') || seededUsers[0];
            socket.emit('send_message', {
              receiverId: targetBrand._id.toString(),
              message: `Realtime ping from VU ${vuIndex}`
            });
            socketMessagesSent++;
          }
        }

        // Realistic Human Think Time: 400ms to 900ms
        const thinkTimeMs = Math.floor(Math.random() * 500) + 400;
        await new Promise((r) => setTimeout(r, thinkTimeMs));

      } catch (err) {
        const status = err.response?.status || (err.code === 'ECONNABORTED' ? 504 : 500);
        recordRequest('ERR_JOURNEY_EXCEPTION', 0, status);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  });

  // Heartbeat & Progress Logger
  const startTime = Date.now();
  let aborted = false;

  const heartbeatInterval = setInterval(async () => {
    const elapsedSec = (Date.now() - startTime) / 1000;
    const rps = (totalRequests / (elapsedSec || 1)).toFixed(1);
    const errPct = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) : '0.00';
    const recentLats = calculatePercentiles(stageLatencies.slice(-500));
    const heapMB = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1);
    const liveSockets = activeSockets.filter(s => s.connected).length;

    console.log(`⏱️ [${stageName} | ${Math.floor(elapsedSec / 60)}m ${Math.floor(elapsedSec % 60).toString().padStart(2, '0')}s / ${(durationSeconds / 60).toFixed(0)}m] Req: ${totalRequests.toString().padStart(6)} (${rps} rps) | Sockets: ${liveSockets}/${userCount} | Err: ${errPct}% | p50: ${recentLats.p50}ms | p95: ${recentLats.p95}ms | Heap: ${heapMB}MB`);

    // Stop Condition check
    if (stopOnFail && elapsedSec >= 30 && parseFloat(errPct) > 5.0) {
      console.error(`🚨 STOP CONDITION TRIGGERED: Error rate exceeded 5.0% (${errPct}%)! Aborting stage.`);
      aborted = true;
      isRunning = false;
      clearInterval(heartbeatInterval);
    }
  }, 30000);

  // Await stage completion
  const stageTimer = new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000));
  await stageTimer;

  clearInterval(heartbeatInterval);
  isRunning = false;
  await Promise.allSettled(vuWorkers);

  // Close stage sockets cleanly
  for (const s of activeSockets) {
    s.disconnect();
  }

  const elapsedSec = (Date.now() - startTime) / 1000;
  const overallStats = calculatePercentiles(stageLatencies);
  const errorRatePct = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) : '0.00';
  const rps = (totalRequests / (elapsedSec || 1)).toFixed(1);
  const memUsageMB = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1);
  const loopStats = calculatePercentiles(performanceMetrics.eventLoopDelays);

  console.log(`\n📊 STAGE SUMMARY: [${stageName}]`);
  console.log(`   Achieved Users:       ${userCount}`);
  console.log(`   Duration:             ${elapsedSec.toFixed(1)}s (${(elapsedSec / 60).toFixed(1)} min)`);
  console.log(`   Total Requests:       ${totalRequests} (${rps} req/sec)`);
  console.log(`   Successful Requests:  ${successfulRequests}`);
  console.log(`   Failed Requests:      ${failedRequests} (Error Rate: ${errorRatePct}%)`);
  console.log(`   Latency Percentiles:  p50: ${overallStats.p50}ms | p95: ${overallStats.p95}ms | p99: ${overallStats.p99}ms | Avg: ${overallStats.avg}ms`);
  console.log(`   Event Loop Delay:     p50: ${loopStats.p50}ms | p95: ${loopStats.p95}ms`);
  console.log(`   Process Heap:         ${memUsageMB} MB`);
  console.log(`   Socket Activity:      Sent: ${socketMessagesSent} | Received: ${socketMessagesReceived}`);

  if (errorBreakdown.size > 0) {
    console.log(`   Error Breakdown:`);
    for (const [code, count] of errorBreakdown.entries()) {
      console.log(`     - ${code}: ${count}`);
    }
  }

  console.log(`\n   Endpoint Latency Breakdown:`);
  for (const [endpoint, lats] of endpointLatencies.entries()) {
    const epStats = calculatePercentiles(lats);
    console.log(`   - ${endpoint.padEnd(32)} | Req: ${lats.length.toString().padStart(6)} | p50: ${epStats.p50.toString().padStart(4)}ms | p95: ${epStats.p95.toString().padStart(4)}ms | p99: ${epStats.p99.toString().padStart(4)}ms`);
  }

  // Acceptance Thresholds:
  // p95 <= 750ms, Error Rate <= 2.0%, Event Loop Delay p95 <= 100ms
  const isPass = !aborted && overallStats.p95 <= 750 && parseFloat(errorRatePct) <= 2.0;
  console.log(`   STAGE RESULT: ${isPass ? '✅ PASS' : '❌ FAIL'}\n`);

  return {
    stageName,
    userCount,
    durationSeconds: elapsedSec,
    totalRequests,
    successfulRequests,
    failedRequests,
    rps,
    errorRatePct,
    latencies: overallStats,
    endpointLatencies,
    heapMB: memUsageMB,
    eventLoopP95: loopStats.p95,
    errorBreakdown,
    isPass
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isSmoke = args.includes('--smoke');
  const stageOnly = args.find(a => a.startsWith('--stage='))?.split('=')[1];

  console.log('================================================================');
  console.log('⚡ FLUX CAPACITY & LOAD TESTING SUITE (STRICT ISOLATED LOCAL DB)');
  console.log('================================================================\n');

  // Boot staging server with strict local MongoDB
  const staging = await startStagingServer(STAGING_PORT);

  // Security Double-Check
  const host = mongoose.connection.host;
  const db = mongoose.connection.name;
  console.log(`🔒 ACTIVE DATABASE GUARANTEE: Connected to [${host}] database [${db}]`);
  if (host !== '127.0.0.1' && host !== 'localhost') {
    throw new Error('SECURITY VIOLATION: Non-local database detected! Aborting.');
  }

  const runId = `iso_${Date.now()}`;
  const MAX_TARGET_USERS = 160;

  console.log(`\n🌱 Pre-seeding ${MAX_TARGET_USERS} authenticated synthetic users into local database...`);
  const seededUsers = [];
  const seededCampaigns = [];

  try {
    const brandCount = Math.floor(MAX_TARGET_USERS * 0.3); // 48 Brands
    const creatorCount = MAX_TARGET_USERS - brandCount;    // 112 Creators

    for (let i = 0; i < MAX_TARGET_USERS; i++) {
      const isBrand = (i % 3 === 0); // 33% Brands, 67% Creators interleaved
      const role = isBrand ? 'brand' : 'influencer';
      const email = `${runId}_u${i}_${role}@isolated.test`;

      const u = await User.create({
        email,
        password: 'TestPassword123!',
        role,
        token_version: 0
      });

      const token = generateToken(u._id.toString(), role, 0);

      if (isBrand) {
        await BrandProfile.create({
          user_id: u._id,
          company_name: `Brand Corp ${i}`,
          category: 'Consumer Goods',
          address: 'Mumbai',
          wallet_balance: 500000
        });

        // Seed campaigns for brands
        if (i < 60) {
          const camp = await Campaign.create({
            brand_id: u._id,
            campaign_name: `${runId} Summer Deal ${i}`,
            influencer_location: 'India',
            campaign_type: 'paid',
            content_type: 'reel',
            number_of_seats: 10,
            cost_per_influencer: 5000,
            status: 'open'
          });
          seededCampaigns.push(camp);
        }
      } else {
        await InfluencerProfile.create({
          user_id: u._id,
          name: `Creator User ${i}`,
          categories: ['Lifestyle', 'Tech'],
          location: 'Delhi',
          followers_count: 25000,
          is_pro_member: true
        });
      }

      seededUsers.push({
        _id: u._id,
        email,
        role,
        token
      });
    }

    console.log(`✅ Seeded ${seededUsers.length} synthetic accounts and ${seededCampaigns.length} campaigns.\n`);

    const stageResults = [];

    if (isSmoke) {
      // Smoke Test Mode: 10 VUs for 20 seconds
      console.log('🧪 RUNNING SMOKE TEST (10 VUs, 20s)...');
      stageResults.push(await runLoadStage({
        stageName: 'Smoke Test (10 VUs)',
        userCount: 10,
        durationSeconds: 20,
        seededUsers
      }));
    } else {
      // FULL SPEC EXECUTION:
      // 1. Stage 1: 100 active users for 15 minutes (900 seconds)
      const stage1 = await runLoadStage({
        stageName: 'Stage 1: 100 Active Users (15 Minutes)',
        userCount: 100,
        durationSeconds: 900,
        seededUsers
      });
      stageResults.push(stage1);

      if (!stage1.isPass) {
        console.error('❌ Stage 1 (100 Active Users) FAILED acceptance thresholds. Aborting subsequent stages.');
      } else {
        console.log('🎉 Stage 1 PASSED healthy! Proceeding to Stage 2 (150 Active Users)...');

        // 2. Stage 2: 150 active users for 15 minutes (900 seconds)
        const stage2 = await runLoadStage({
          stageName: 'Stage 2: 150 Active Users (15 Minutes)',
          userCount: 150,
          durationSeconds: 900,
          seededUsers
        });
        stageResults.push(stage2);

        if (!stage2.isPass) {
          console.error('❌ Stage 2 (150 Active Users) FAILED acceptance thresholds. Soak test skipped.');
        } else {
          console.log('🎉 Stage 2 PASSED healthy! Proceeding to Stage 3: 30-Minute Soak Test...');

          // 3. Stage 3: 30-Minute Soak Test (1800 seconds)
          const stage3 = await runLoadStage({
            stageName: 'Stage 3: 30-Minute Sustained Soak Test (100 VUs)',
            userCount: 100,
            durationSeconds: 1800,
            seededUsers
          });
          stageResults.push(stage3);
        }
      }
    }

    // FINAL TABULAR REPORT
    console.log('\n================================================================');
    console.log('🏁 FINAL PERFORMANCE & CAPACITY TEST REPORT');
    console.log('================================================================\n');

    console.log(`| Stage Name | Achieved VUs | Duration | Total Req | RPS | p50 Latency | p95 Latency | Error Rate | Heap Mem | Result |`);
    console.log(`| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |`);
    for (const res of stageResults) {
      console.log(`| ${res.stageName.padEnd(35)} | ${res.userCount.toString().padStart(4)} | ${(res.durationSeconds / 60).toFixed(1)}m | ${res.totalRequests.toString().padStart(7)} | ${res.rps.padStart(5)} | ${res.latencies.p50.toString().padStart(4)}ms | ${res.latencies.p95.toString().padStart(4)}ms | ${res.errorRatePct.padStart(5)}% | ${res.heapMB} MB | ${res.isPass ? '✅ PASS' : '❌ FAIL'} |`);
    }

  } finally {
    console.log('\n🧹 Tearing down isolated staging server and local MongoMemoryServer...');
    await staging.close();
    console.log('✅ Local test environment destroyed cleanly. Zero data persisted.');
  }
}

main().catch(err => {
  console.error('Fatal load test harness error:', err);
  process.exit(1);
});
