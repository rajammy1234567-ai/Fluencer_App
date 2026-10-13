import { startStagingServer } from './src/staging/stagingServer.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';

async function verifyBackendIsolation() {
  console.log('================================================================');
  console.log('🔍 VERIFYING BACKEND EXCLUSIVE LOCAL MONGODB ISOLATION & GUARDS');
  console.log('================================================================\n');

  console.log('Test 1: Starting stagingServer with local MongoMemoryServer default...');
  const staging = await startStagingServer(5058);

  const activeHost = mongoose.connection.host;
  const activePort = mongoose.connection.port;
  const activeDb = mongoose.connection.name;

  console.log(`\nActive Connection Attributes:`);
  console.log(`   Host:     ${activeHost}`);
  console.log(`   Port:     ${activePort}`);
  console.log(`   Database: ${activeDb}`);

  if (activeHost !== '127.0.0.1' && activeHost !== 'localhost') {
    throw new Error(`SECURITY CHECK FAILED: Host is ${activeHost}, not local!`);
  }
  if (activeDb.includes('fluencer01')) {
    throw new Error(`SECURITY CHECK FAILED: Database is ${activeDb}, points to shared Atlas!`);
  }
  console.log('✅ PASS: Backend is verified connected strictly to isolated local MongoDB.');

  // Test 2: Insert a canary record into local MongoDB
  console.log('\nTest 2: Inserting canary record into isolated database...');
  const canaryUser = await User.create({
    email: 'local_canary_test@isolated.local',
    password: 'CanaryPassword123!',
    role: 'brand'
  });
  console.log('✅ PASS: Local write succeeded, ID:', canaryUser._id.toString());

  // Test 3: Close staging server and verify teardown
  console.log('\nTest 3: Tearing down staging server...');
  await staging.close();
  console.log('✅ PASS: Staging server and MongoMemoryServer stopped cleanly.');

  // Test 4: Verification of security guard against remote Atlas fallback
  console.log('\nTest 4: Verifying Atlas rejection guard...');
  let guardTriggered = false;
  try {
    await startStagingServer({
      port: 5059,
      customMongoUri: 'mongodb+srv://admin:pass@fluencer01.vfpqbe9.mongodb.net/fluencer01'
    });
  } catch (err) {
    if (err.message.includes('FATAL SECURITY VIOLATION') || err.message.includes('Atlas')) {
      guardTriggered = true;
      console.log('✅ PASS: Atlas connection rejected with security violation:');
      console.log('   Error:', err.message);
    } else {
      throw err;
    }
  }

  if (!guardTriggered) {
    throw new Error('SECURITY CHECK FAILED: Server failed to reject remote Atlas URI!');
  }

  console.log('\n================================================================');
  console.log('🎉 ALL ISOLATION & ZERO-FALLBACK GUARDS 100% VERIFIED');
  console.log('================================================================\n');
}

verifyBackendIsolation().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
