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
import Message from './src/models/Message.js';
import { generateToken } from './src/utils/auth.js';

const STAGING_PORT = 5057;
const BASE_URL = `http://127.0.0.1:${STAGING_PORT}`;

const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true
});

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

async function run150UserSoak() {
  console.log('================================================================');
  console.log('⚡ 30-MINUTE SUSTAINED SOAK TEST (150 CONCURRENT ACTIVE USERS)');
  console.log('================================================================\n');

  const staging = await startStagingServer(STAGING_PORT);

  const runId = `soak_${Date.now()}`;
  const TOTAL_USERS = 150;
  const SOAK_DURATION_SEC = 1800; // 30 minutes

  console.log(`🌱 Seeding ${TOTAL_USERS} authenticated users in local MongoDB...`);
  const seededUsers = [];
  const seededCampaigns = [];

  for (let i = 0; i < TOTAL_USERS; i++) {
    const isBrand = (i % 3 === 0);
    const role = isBrand ? 'brand' : 'influencer';
    const email = `${runId}_u${i}_${role}@soak.test`;

    const u = await User.create({ email, password: 'SoakPassword123!', role, token_version: 0 });
    const token = generateToken(u._id.toString(), role, 0);

    if (isBrand) {
      await BrandProfile.create({
        user_id: u._id,
        company_name: `Soak Brand ${i}`,
        category: 'Tech',
        address: 'Bangalore',
        wallet_balance: 1000000
      });

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
        name: `Soak Creator ${i}`,
        categories: ['Tech', 'Lifestyle'],
        location: 'Mumbai',
        followers_count: 50000,
        is_pro_member: true
      });
    }

    seededUsers.push({ _id: u._id, email, role, token });
  }

  console.log(`✅ Seeded ${seededUsers.length} synthetic accounts and ${seededCampaigns.length} campaigns.\n`);

  // Target brand for messaging
  const defaultTargetBrand = seededUsers.find(u => u.role === 'brand') || seededUsers[0];

  // Exact ID-Level Message Tracking
  const acceptedMessageIds = new Set();
  const sentMessageCountByVU = new Map();

  const stageLatencies = [];
  const endpointLatencies = new Map();
  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  let socketMessagesSent = 0;
  let socketMessagesReceived = 0;

  const recordRequest = (endpoint, ms, status) => {
    totalRequests++;
    if (status >= 200 && status < 400) successfulRequests++;
    else failedRequests++;

    stageLatencies.push(ms);
    if (!endpointLatencies.has(endpoint)) endpointLatencies.set(endpoint, []);
    endpointLatencies.get(endpoint).push(ms);
  };

  const activeSockets = [];
  let isRunning = true;

  console.log('🔌 Connecting 150 authenticated Socket.IO connections with join_chat room subscriptions...');
  for (let i = 0; i < seededUsers.length; i++) {
    const vu = seededUsers[i];
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

    // Explicitly join the chat room with the default target brand
    s.emit('join_chat', defaultTargetBrand._id.toString());

    activeSockets.push(s);
    await new Promise(r => setTimeout(r, 5));
  }

  console.log('🚀 Spawning 150 concurrent active user loops...');
  const vuWorkers = seededUsers.map(async (vu, vuIndex) => {
    const isBrand = vu.role === 'brand';
    const socket = activeSockets[vuIndex];
    let iteration = 0;

    while (isRunning) {
      iteration++;
      try {
        if (isBrand) {
          const pStart = performance.now();
          const pRes = await httpClient.get('/api/brands/profile', { headers: { Authorization: `Bearer ${vu.token}` } });
          recordRequest('GET /api/brands/profile', performance.now() - pStart, pRes.status);

          const cStart = performance.now();
          const cRes = await httpClient.get('/api/campaigns/my-campaigns', { headers: { Authorization: `Bearer ${vu.token}` } });
          recordRequest('GET /api/campaigns/my-campaigns', performance.now() - cStart, cRes.status);

          if (socket && socket.connected && iteration % 4 === 0) {
            socket.emit('typing', { receiverId: defaultTargetBrand._id.toString() });
          }
        } else {
          const fStart = performance.now();
          const fRes = await httpClient.get('/api/campaigns/active/all');
          recordRequest('GET /api/campaigns/active/all', performance.now() - fStart, fRes.status);

          const profStart = performance.now();
          const profRes = await httpClient.get('/api/influencers/profile', { headers: { Authorization: `Bearer ${vu.token}` } });
          recordRequest('GET /api/influencers/profile', performance.now() - profStart, profRes.status);

          const nStart = performance.now();
          const nRes = await httpClient.get('/api/notifications', { headers: { Authorization: `Bearer ${vu.token}` } });
          recordRequest('GET /api/notifications', performance.now() - nStart, nRes.status);

          // REST Message with unique iteration ID
          if (iteration % 4 === 0) {
            const mStart = performance.now();
            const clientMsgPayload = `Soak inquiry run=${runId} vu=${vuIndex} iter=${iteration}`;
            const mRes = await httpClient.post(
              '/api/messages/send',
              { receiverId: defaultTargetBrand._id.toString(), message: clientMsgPayload },
              { headers: { Authorization: `Bearer ${vu.token}` } }
            );
            recordRequest('POST /api/messages/send', performance.now() - mStart, mRes.status);

            if (mRes.status === 201 && mRes.data?.messageId) {
              acceptedMessageIds.add(mRes.data.messageId);
              sentMessageCountByVU.set(vuIndex, (sentMessageCountByVU.get(vuIndex) || 0) + 1);
            }
          }

          // Socket Message
          if (socket && socket.connected && iteration % 4 === 2) {
            socket.emit('send_message', {
              receiverId: defaultTargetBrand._id.toString(),
              message: `Soak socket ping vu=${vuIndex} iter=${iteration}`
            });
            socketMessagesSent++;
          }
        }

        const thinkTimeMs = Math.floor(Math.random() * 500) + 400;
        await new Promise(r => setTimeout(r, thinkTimeMs));

      } catch (err) {
        recordRequest('ERR_JOURNEY_EXCEPTION', 0, 500);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  });

  const startTime = Date.now();
  let peakHeapMB = 0;

  const heartbeat = setInterval(() => {
    const elapsedSec = (Date.now() - startTime) / 1000;
    const rps = (totalRequests / (elapsedSec || 1)).toFixed(1);
    const errPct = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) : '0.00';
    const recentLats = calculatePercentiles(stageLatencies.slice(-500));
    const heapMB = parseFloat((process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1));
    if (heapMB > peakHeapMB) peakHeapMB = heapMB;
    const liveSockets = activeSockets.filter(s => s.connected).length;

    console.log(`⏱️ [150-User Soak | ${Math.floor(elapsedSec / 60)}m ${Math.floor(elapsedSec % 60).toString().padStart(2, '0')}s / 30m] Req: ${totalRequests.toString().padStart(7)} (${rps} rps) | Sockets: ${liveSockets}/150 | Err: ${errPct}% | p50: ${recentLats.p50}ms | p95: ${recentLats.p95}ms | Heap: ${heapMB}MB | Recv Sockets: ${socketMessagesReceived}`);
  }, 60000);

  // Wait 30 minutes
  await new Promise(resolve => setTimeout(resolve, SOAK_DURATION_SEC * 1000));

  clearInterval(heartbeat);
  isRunning = false;
  await Promise.allSettled(vuWorkers);

  for (const s of activeSockets) s.disconnect();

  const elapsedSec = (Date.now() - startTime) / 1000;
  const overallStats = calculatePercentiles(stageLatencies);
  const errorRatePct = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) : '0.00';
  const rps = (totalRequests / (elapsedSec || 1)).toFixed(1);
  const loopStats = calculatePercentiles(performanceMetrics.eventLoopDelays);

  console.log('\n================================================================');
  console.log('📊 30-MINUTE SOAK TEST RESULTS (150 CONCURRENT ACTIVE USERS)');
  console.log('================================================================');
  console.log(`   Achieved Users:       ${TOTAL_USERS}`);
  console.log(`   Duration:             ${elapsedSec.toFixed(1)}s (${(elapsedSec / 60).toFixed(1)} min)`);
  console.log(`   Total Requests:       ${totalRequests} (${rps} req/sec)`);
  console.log(`   Successful Requests:  ${successfulRequests}`);
  console.log(`   Failed Requests:      ${failedRequests} (Error Rate: ${errorRatePct}%)`);
  console.log(`   Raw Latency (p50):    ${overallStats.p50}ms`);
  console.log(`   Raw Latency (p95):    ${overallStats.p95}ms (SLA: <=750ms -> ${overallStats.p95 <= 750 ? 'PASS' : 'FAIL'})`);
  console.log(`   Raw Latency (p99):    ${overallStats.p99}ms`);
  console.log(`   Peak Heap Memory:     ${peakHeapMB} MB`);
  console.log(`   Event Loop Delay p95: ${loopStats.p95}ms`);
  console.log(`   Socket Activity:      Sent: ${socketMessagesSent} | Recipient Received ACKs: ${socketMessagesReceived}`);

  console.log('\n   Endpoint Latency Breakdown:');
  for (const [endpoint, lats] of endpointLatencies.entries()) {
    const epStats = calculatePercentiles(lats);
    console.log(`   - ${endpoint.padEnd(32)} | Req: ${lats.length.toString().padStart(6)} | p50: ${epStats.p50.toString().padStart(4)}ms | p95: ${epStats.p95.toString().padStart(4)}ms | p99: ${epStats.p99.toString().padStart(4)}ms`);
  }

  // 6. EXACT MESSAGE RECONCILIATION AUDIT
  console.log('\n----------------------------------------------------------------');
  console.log('🔍 EXACT MESSAGE PERSISTENCE AUDIT (ID-LEVEL RECONCILIATION)');
  console.log('----------------------------------------------------------------');
  console.log(`   Total Accepted HTTP 201 Messages: ${acceptedMessageIds.size}`);

  const idArray = Array.from(acceptedMessageIds).map(id => new mongoose.Types.ObjectId(id));
  const foundInDbCount = await Message.countDocuments({ _id: { $in: idArray } });

  console.log(`   Exact Stored Documents Verified in DB: ${foundInDbCount}`);
  console.log(`   Missing / Dropped Messages: ${acceptedMessageIds.size - foundInDbCount}`);
  console.log(`   Zero Loss Confirmed: ${acceptedMessageIds.size === foundInDbCount ? '✅ 100% MATCH' : '❌ DISCREPANCY'}`);

  // 7. POST-LOAD QUIESCENCE & RECOVERY OBSERVATION (60 SECONDS)
  console.log('\n----------------------------------------------------------------');
  console.log('🧘 POST-LOAD RECOVERY OBSERVATION (60-SECOND QUIESCENCE)');
  console.log('----------------------------------------------------------------');
  for (let sec = 10; sec <= 60; sec += 10) {
    await new Promise(r => setTimeout(r, 10000));
    if (global.gc) global.gc();
    const idleHeapMB = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1);
    console.log(`   Quiescence T+${sec}s: Process Heap = ${idleHeapMB} MB`);
  }

  await staging.close();
  console.log('\n✅ Soak environment torn down cleanly.');
}

run150UserSoak().catch(err => {
  console.error('Fatal soak error:', err);
  process.exit(1);
});
