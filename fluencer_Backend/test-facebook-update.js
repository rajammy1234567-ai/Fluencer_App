/**
 * Test Facebook Profile Update
 * Simulates updating user profile with Facebook data
 */

import { query } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testFacebookUpdate() {
  console.log('🧪 Testing Facebook Profile Update\n');

  try {
    // Get a test user (first influencer)
    const users = await query(
      'SELECT id, email, role FROM users WHERE role = ? LIMIT 1',
      ['influencer']
    );

    if (users.length === 0) {
      console.log('❌ No influencer users found in database');
      process.exit(1);
    }

    const testUser = users[0];
    console.log(`📋 Test User: ${testUser.email} (ID: ${testUser.id})`);

    // Simulate Facebook data
    const fbData = {
      id: 'FB_TEST_12345',
      name: 'Test Facebook User',
      picture: 'https://graph.facebook.com/12345/picture?type=large'
    };

    console.log('\n1️⃣ Updating users table...');
    await query(
      'UPDATE users SET facebook_id = ?, profile_picture = ?, is_verified = 1 WHERE id = ?',
      [fbData.id, fbData.picture, testUser.id]
    );
    console.log('   ✅ Users table updated');

    console.log('\n2️⃣ Checking influencer profile...');
    const profileCheck = await query(
      'SELECT id FROM influencer_profiles WHERE user_id = ?',
      [testUser.id]
    );

    if (profileCheck.length > 0) {
      console.log('   📝 Profile exists, updating...');
      await query(
        'UPDATE influencer_profiles SET name = ?, profile_picture = ? WHERE user_id = ?',
        [fbData.name, fbData.picture, testUser.id]
      );
      console.log('   ✅ Profile updated');
    } else {
      console.log('   📝 Profile doesn\'t exist, creating...');
      await query(
        'INSERT INTO influencer_profiles (user_id, name, profile_picture) VALUES (?, ?, ?)',
        [testUser.id, fbData.name, fbData.picture]
      );
      console.log('   ✅ Profile created');
    }

    console.log('\n3️⃣ Verifying updates...');
    const updatedUser = await query(
      'SELECT * FROM users WHERE id = ?',
      [testUser.id]
    );
    
    const updatedProfile = await query(
      'SELECT * FROM influencer_profiles WHERE user_id = ?',
      [testUser.id]
    );

    console.log('\n📊 Updated Data:');
    console.log('   Users Table:');
    console.log(`   - facebook_id: ${updatedUser[0].facebook_id}`);
    console.log(`   - profile_picture: ${updatedUser[0].profile_picture}`);
    console.log(`   - is_verified: ${updatedUser[0].is_verified}`);
    
    if (updatedProfile.length > 0) {
      console.log('\n   Profile Table:');
      console.log(`   - name: ${updatedProfile[0].name}`);
      console.log(`   - profile_picture: ${updatedProfile[0].profile_picture}`);
    }

    console.log('\n✅ Facebook profile update test completed! 🎉\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error:', error);
    process.exit(1);
  }
}

testFacebookUpdate();
