import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

async function testLocalMongo() {
  console.log('⏳ Starting isolated local MongoMemoryServer...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'fluencer_isolated_staging'
    }
  });

  const uri = mongod.getUri();
  console.log('📍 Isolated Local MongoDB URI:', uri);

  // Strict Guard: Must be localhost only
  if (!uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    throw new Error('❌ SECURITY VIOLATION: Database URI is not localhost! Aborting.');
  }
  if (uri.includes('mongodb.net') || uri.includes('fluencer01')) {
    throw new Error('❌ SECURITY VIOLATION: Connected to shared Atlas cluster! Aborting.');
  }

  await mongoose.connect(uri);
  const adminDb = mongoose.connection.db.admin();
  const ping = await adminDb.ping();
  const status = await adminDb.serverStatus();

  console.log('✅ Connected to isolated local MongoDB successfully!');
  console.log('   Ping:', ping);
  console.log('   Version:', status.version);
  console.log('   Host:', status.host);
  console.log('   Connections current:', status.connections.current);

  await mongoose.disconnect();
  await mongod.stop();
  console.log('🛑 Local MongoDB stopped cleanly.');
}

testLocalMongo().catch(err => {
  console.error('Local Mongo Test Error:', err);
  process.exit(1);
});
