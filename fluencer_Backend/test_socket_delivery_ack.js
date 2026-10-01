import { io as ClientIO } from 'socket.io-client';
import axios from 'axios';
import mongoose from 'mongoose';
import { startStagingServer } from './src/staging/stagingServer.js';
import User from './src/models/User.js';
import Message from './src/models/Message.js';
import { generateToken } from './src/utils/auth.js';

async function testSocketDeliveryAndRetries() {
  console.log('================================================================');
  console.log('🧪 DEDICATED SOCKET DELIVERY, ACKNOWLEDGEMENT & RETRY TEST SUITE');
  console.log('================================================================\n');

  const PORT = 5056;
  const BASE_URL = `http://127.0.0.1:${PORT}`;
  const staging = await startStagingServer(PORT);

  try {
    // 1. Create two test accounts
    const creator = await User.create({ email: 'ack_creator@test.local', password: 'Pass123!', role: 'influencer' });
    const brand = await User.create({ email: 'ack_brand@test.local', password: 'Pass123!', role: 'brand' });

    const creatorToken = generateToken(creator._id.toString(), 'influencer', 0);
    const brandToken = generateToken(brand._id.toString(), 'brand', 0);

    // 2. Connect both sockets
    console.log('🔌 Connecting Creator & Brand Sockets...');
    const creatorSocket = ClientIO(BASE_URL, { auth: { token: creatorToken }, transports: ['websocket'] });
    const brandSocket = ClientIO(BASE_URL, { auth: { token: brandToken }, transports: ['websocket'] });

    await new Promise(r => setTimeout(r, 200));

    // 3. Test Room Joining (join_chat)
    console.log('🚪 Testing room joining via join_chat event...');
    creatorSocket.emit('join_chat', brand._id.toString());
    brandSocket.emit('join_chat', creator._id.toString());

    await new Promise(r => setTimeout(r, 200));

    // 4. Test Recipient Real-Time Delivery with ACK
    console.log('📨 Testing Real-Time Message Delivery to Recipient...');
    let recipientReceived = false;
    let receivedPayload = null;
    let deliveryLatencyMs = 0;
    const sendTimestamp = Date.now();

    brandSocket.on('receive_message', (data) => {
      deliveryLatencyMs = Date.now() - sendTimestamp;
      recipientReceived = true;
      receivedPayload = data;
    });

    creatorSocket.emit('send_message', {
      receiverId: brand._id.toString(),
      message: 'Hello Brand, confirming delivery ACK',
      messageType: 'text'
    });

    await new Promise(r => setTimeout(r, 500));

    console.log(`   Delivery Received: ${recipientReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Delivery Latency:  ${deliveryLatencyMs}ms`);
    console.log(`   Payload Match:     ${receivedPayload?.message === 'Hello Brand, confirming delivery ACK' ? '✅ YES' : '❌ NO'}`);

    // 5. Test REST Message Persistence & Deduplication
    console.log('\n💾 Testing REST Persistence & Idempotency / Retry Handling...');
    const messagePayload = {
      receiverId: brand._id.toString(),
      message: 'Critical inquiry with client idempotency ID #1001'
    };

    // First Send
    const res1 = await axios.post(`${BASE_URL}/api/messages/send`, messagePayload, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    console.log(`   First Send Status: HTTP ${res1.status}, Created Message ID: ${res1.data.messageId}`);

    // Second Send (Simulated Network Retry of exact same logical message)
    const res2 = await axios.post(`${BASE_URL}/api/messages/send`, messagePayload, {
      headers: { Authorization: `Bearer ${creatorToken}` }
    });
    console.log(`   Retry Send Status: HTTP ${res2.status}, Created Message ID: ${res2.data.messageId}`);

    // Check DB for duplicate documents
    const storedCount = await Message.countDocuments({
      sender_id: creator._id,
      receiver_id: brand._id,
      message: 'Critical inquiry with client idempotency ID #1001'
    });

    console.log(`   Database Stored Documents for Same Payload: ${storedCount}`);
    if (storedCount > 1) {
      console.log('   ⚠️ CONFIRMED VULNERABILITY: Backend lacks message idempotency / retry deduplication.');
      console.log('      Retrying POST /api/messages/send created a 2nd duplicate document in DB.');
    } else {
      console.log('   ✅ Deduplication active: Single document stored.');
    }

    creatorSocket.disconnect();
    brandSocket.disconnect();

  } finally {
    await staging.close();
  }
}

testSocketDeliveryAndRetries().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
