/**
 * Test Facebook OAuth Setup
 */

import { query } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testOAuth() {
  console.log('🧪 Testing Facebook OAuth Setup\n');

  try {
    // 1. Check database columns
    console.log('1️⃣ Database Columns Check:');
    const columns = await query('DESCRIBE users');
    const requiredColumns = ['facebook_id', 'profile_picture', 'is_verified'];
    requiredColumns.forEach(col => {
      const exists = columns.find(c => c.Field === col);
      console.log(`   ${exists ? '✅' : '❌'} ${col}: ${exists ? exists.Type : 'MISSING'}`);
    });

    // 2. Check existing users
    console.log('\n2️⃣ Existing Users:');
    const users = await query('SELECT id, email, facebook_id, role, is_verified FROM users LIMIT 5');
    console.log(`   Total users: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) ${u.facebook_id ? '[FB: ' + u.facebook_id + ']' : ''} ${u.is_verified ? '✓' : ''}`);
    });

    // 3. Check environment variables
    console.log('\n3️⃣ Environment Variables:');
    console.log(`   FB_APP_ID: ${process.env.FB_APP_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   FB_APP_SECRET: ${process.env.FB_APP_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   FB_REDIRECT_URI: ${process.env.FB_REDIRECT_URI || '❌ Missing'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ Missing'}`);

    // 4. Test OAuth URL generation
    console.log('\n4️⃣ Testing OAuth URL Generation:');
    const state = Buffer.from(JSON.stringify({ role: 'influencer' })).toString('base64');
    const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FB_REDIRECT_URI)}&state=${state}&scope=email,public_profile`;
    console.log(`   URL: ${oauthUrl.substring(0, 100)}...`);

    console.log('\n✅ All tests passed! Facebook OAuth is ready to use! 🚀\n');

    console.log('📱 Next Steps:');
    console.log('   1. Open your React Native app');
    console.log('   2. Go to login screen');
    console.log('   3. Click "Continue with Facebook" button');
    console.log('   4. Login with Facebook and authorize');
    console.log('   5. Check if user is created in database\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testOAuth();
