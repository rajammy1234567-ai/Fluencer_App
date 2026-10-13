import mongoose from 'mongoose';

async function reconcileMessages() {
  const uri = 'mongodb://127.0.0.1:52455/test';
  await mongoose.connect(uri);

  const messageCol = mongoose.connection.db.collection('messages');
  
  // Cutoff time of Stage 1 was approx 11:00:22 UTC (16:30:22 local)
  // Let's inspect the distribution of timestamps around 11:00:20 - 11:00:30 UTC
  const stage1Count = await messageCol.countDocuments({
    created_at: { $lte: new Date('2026-09-30T11:00:22.000Z') }
  });

  const totalNow = await messageCol.countDocuments({});

  console.log('--- RECONCILIATION AUDIT ---');
  console.log(`Stored messages with created_at <= 11:00:22 UTC (Stage 1 Cutoff): ${stage1Count}`);
  console.log(`Total messages stored in DB currently: ${totalNow}`);

  // Check min and max created_at for Stage 1 messages
  const firstMsg = await messageCol.find({}).sort({ created_at: 1 }).limit(1).toArray();
  const lastStage1Msg = await messageCol.find({ created_at: { $lte: new Date('2026-09-30T11:00:22.000Z') } }).sort({ created_at: -1 }).limit(1).toArray();

  if (firstMsg.length > 0) {
    console.log(`First message timestamp: ${firstMsg[0].created_at.toISOString()}`);
  }
  if (lastStage1Msg.length > 0) {
    console.log(`Last Stage 1 message timestamp: ${lastStage1Msg[0].created_at.toISOString()} | Msg: "${lastStage1Msg[0].message}"`);
  }

  // Check if any message failed or is missing an ID or timestamp
  const nullTimestamps = await messageCol.countDocuments({ created_at: { $exists: false } });
  const nullIds = await messageCol.countDocuments({ _id: { $exists: false } });
  console.log(`Records missing created_at: ${nullTimestamps}`);
  console.log(`Records missing _id: ${nullIds}`);

  await mongoose.disconnect();
}

reconcileMessages().catch(err => {
  console.error('Reconciliation error:', err.message);
  process.exit(1);
});
