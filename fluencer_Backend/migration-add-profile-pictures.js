/**
 * Add profile_picture column to influencer_profiles and brand_profiles
 */

import { query } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function addProfilePictureColumns() {
  console.log('🔄 Adding profile_picture columns...\n');

  try {
    // Check influencer_profiles columns
    console.log('1️⃣ Checking influencer_profiles table...');
    const influencerCols = await query('DESCRIBE influencer_profiles');
    const hasInfluencerPic = influencerCols.some(col => col.Field === 'profile_picture');

    if (!hasInfluencerPic) {
      console.log('   Adding profile_picture to influencer_profiles...');
      await query(
        'ALTER TABLE influencer_profiles ADD COLUMN profile_picture VARCHAR(500) AFTER name'
      );
      console.log('   ✅ Column added');
    } else {
      console.log('   ✓ profile_picture already exists');
    }

    // Check brand_profiles columns
    console.log('\n2️⃣ Checking brand_profiles table...');
    const brandCols = await query('DESCRIBE brand_profiles');
    const hasBrandLogo = brandCols.some(col => col.Field === 'logo');

    // Brand profiles might use 'logo' instead of 'profile_picture'
    if (!hasBrandLogo) {
      console.log('   Adding logo to brand_profiles...');
      await query(
        'ALTER TABLE brand_profiles ADD COLUMN logo VARCHAR(500) AFTER company_name'
      );
      console.log('   ✅ Column added');
    } else {
      console.log('   ✓ logo already exists');
    }

    // Verify
    console.log('\n3️⃣ Verifying changes...');
    const updatedInfluencer = await query('DESCRIBE influencer_profiles');
    const updatedBrand = await query('DESCRIBE brand_profiles');

    console.log('\n📋 influencer_profiles columns:');
    updatedInfluencer.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    console.log('\n📋 brand_profiles columns:');
    updatedBrand.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    console.log('\n✅ Migration completed successfully! 🎉\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error:', error);
    process.exit(1);
  }
}

addProfilePictureColumns();
