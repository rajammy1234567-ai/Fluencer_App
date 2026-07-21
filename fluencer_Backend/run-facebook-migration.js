/**
 * Run Facebook OAuth Migration
 * Adds facebook_id, profile_picture, is_verified columns to users table
 */

import { query } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('🔄 Starting Facebook OAuth migration...\n');

  try {
    // Check if columns already exist
    console.log('1️⃣ Checking existing columns...');
    const columns = await query('DESCRIBE users');
    const existingColumns = columns.map(col => col.Field);
    
    console.log('   Existing columns:', existingColumns.join(', '));
    
    // Add facebook_id if not exists
    if (!existingColumns.includes('facebook_id')) {
      console.log('\n2️⃣ Adding facebook_id column...');
      await query('ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255) UNIQUE AFTER email');
      console.log('   ✅ facebook_id column added');
    } else {
      console.log('\n2️⃣ facebook_id column already exists ✓');
    }

    // Add profile_picture if not exists
    if (!existingColumns.includes('profile_picture')) {
      console.log('\n3️⃣ Adding profile_picture column...');
      await query('ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500) AFTER facebook_id');
      console.log('   ✅ profile_picture column added');
    } else {
      console.log('\n3️⃣ profile_picture column already exists ✓');
    }

    // Add is_verified if not exists
    if (!existingColumns.includes('is_verified')) {
      console.log('\n4️⃣ Adding is_verified column...');
      await query('ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0 AFTER role');
      console.log('   ✅ is_verified column added');
    } else {
      console.log('\n4️⃣ is_verified column already exists ✓');
    }

    // Make password optional (for OAuth users)
    console.log('\n5️⃣ Making password column optional...');
    await query('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL');
    console.log('   ✅ password column is now optional');

    // Add index on facebook_id if not exists
    console.log('\n6️⃣ Adding index on facebook_id...');
    try {
      await query('CREATE INDEX idx_facebook_id ON users(facebook_id)');
      console.log('   ✅ Index created');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ✓ Index already exists');
      } else {
        throw error;
      }
    }

    // Verify changes
    console.log('\n7️⃣ Verifying migration...');
    const updatedColumns = await query('DESCRIBE users');
    console.log('\n📋 Updated users table structure:');
    updatedColumns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });

    console.log('\n✅ Migration completed successfully! 🎉\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

runMigration();
