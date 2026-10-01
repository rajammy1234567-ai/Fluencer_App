import mongoose from 'mongoose';

async function inspectLive() {
  const uri = 'mongodb://127.0.0.1:52455/test';
  await mongoose.connect(uri);

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Active collections in local staging DB:');
  
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(` - ${c.name.padEnd(20)}: ${count} documents`);
  }

  // Inspect messages
  const messageCol = mongoose.connection.db.collection('messages');
  const totalMessages = await messageCol.countDocuments();
  console.log(`\nTotal stored messages: ${totalMessages}`);

  if (totalMessages > 0) {
    const sample = await messageCol.find({}).sort({ created_at: -1 }).limit(3).toArray();
    console.log('\nLatest 3 messages sample:');
    console.log(sample.map(m => ({ id: m._id, sender: m.sender_id, receiver: m.receiver_id, msg: m.message, at: m.created_at })));

    // Duplicate message check: group by sender_id and message text
    const duplicates = await messageCol.aggregate([
      { $group: { _id: { sender: "$sender_id", msg: "$message" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 10 }
    ]).toArray();

    console.log(`\nDuplicate message check (same sender + identical payload): ${duplicates.length} duplicate patterns found.`);
    if (duplicates.length > 0) {
      console.log('Sample duplicates:', duplicates);
    }
  }

  await mongoose.disconnect();
}

inspectLive().catch(err => {
  console.error('Inspection error:', err.message);
  process.exit(1);
});
