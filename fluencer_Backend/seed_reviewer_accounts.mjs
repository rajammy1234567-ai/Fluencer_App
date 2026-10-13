/**
 * Script: seed_reviewer_accounts.mjs
 * Purpose: Securely and idempotently seed dedicated App Store & Google Play reviewer accounts.
 * 
 * Safety Controls:
 * 1. ZERO HARDCODED PASSWORDS: Passwords must be provided via environment variables.
 * 2. EXPLICIT CONFIRMATION GUARD: Requires `--confirm-live-seed` to write, or `--dry-run` to preview.
 * 3. NO SILENT OVERWRITE: Existing matching accounts are NOT overwritten unless `--force-update-passwords` is specified.
 * 4. PURCHASE TESTER PROTECTION: If the purchase tester already bought Pro in Sandbox, `is_pro_member` is NOT reset on rerun unless `--reset-purchase-tester` is specified.
 * 5. SANITIZED TARGET DB DISPLAY: Extracts host and database name without exposing passwords or credentials.
 * 
 * Usage:
 *   Dry-run (Read-Only Preview):
 *     node seed_reviewer_accounts.mjs --dry-run
 * 
 *   Live Seeding:
 *     $env:REVIEWER_CREATOR_PASSWORD="<Password>"; ...; node seed_reviewer_accounts.mjs --confirm-live-seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import InfluencerProfile from './src/models/InfluencerProfile.js';
import BrandProfile from './src/models/BrandProfile.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREATOR_EMAIL = (process.env.REVIEWER_CREATOR_EMAIL || 'reviewer.creator@fluencer.app').toLowerCase();
const BRAND_EMAIL = (process.env.REVIEWER_BRAND_EMAIL || 'reviewer.brand@fluencer.app').toLowerCase();
const PURCHASE_EMAIL = (process.env.REVIEWER_PURCHASE_EMAIL || 'reviewer.purchase@fluencer.app').toLowerCase();

const isDryRun = process.argv.includes('--dry-run');
const hasConfirmFlag = process.argv.includes('--confirm-live-seed');
const forceUpdatePasswords = process.argv.includes('--force-update-passwords');
const resetPurchaseTester = process.argv.includes('--reset-purchase-tester');

const creatorPassword = process.env.REVIEWER_CREATOR_PASSWORD;
const brandPassword = process.env.REVIEWER_BRAND_PASSWORD;
const purchasePassword = process.env.REVIEWER_PURCHASE_PASSWORD;

function getSanitizedDbTarget(uri) {
  if (!uri) return { host: 'UNKNOWN', database: 'UNKNOWN' };
  try {
    const hostMatch = uri.match(/@([^/?]+)/);
    const dbMatch = uri.match(/\/([^/?]+)(\?|$)/);
    return {
      host: hostMatch ? hostMatch[1] : 'localhost',
      database: dbMatch ? dbMatch[1] : 'default',
    };
  } catch (e) {
    return { host: 'protected-host', database: 'protected-db' };
  }
}

async function run() {
  console.log('========================================================================');
  console.log(`🛡️ REVIEWER ACCOUNTS SEED SCRIPT (${isDryRun ? 'DRY-RUN READ-ONLY' : 'LIVE SEED'})`);
  console.log('========================================================================\n');

  console.log(`📁 Backend Directory : ${__dirname}`);

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ ERROR: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  const { host, database } = getSanitizedDbTarget(uri);
  console.log(`🎯 Target Database    : Host [${host}], Database [${database}] (Secrets hidden)\n`);

  if (!isDryRun && !hasConfirmFlag) {
    console.error('❌ SAFETY ABORT: Neither `--dry-run` nor `--confirm-live-seed` was specified.');
    console.log('To preview changes without writing to database:');
    console.log('  node seed_reviewer_accounts.mjs --dry-run\n');
    console.log('To perform live database seeding:');
    console.log('  node seed_reviewer_accounts.mjs --confirm-live-seed\n');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  await mongoose.connect(uri);
  console.log('✅ Connected successfully.\n');

  // Check state of each account
  const existingCreator = await User.findOne({ email: CREATOR_EMAIL }).lean();
  const existingBrand = await User.findOne({ email: BRAND_EMAIL }).lean();
  const existingPurchase = await User.findOne({ email: PURCHASE_EMAIL }).lean();

  let creatorProfile = null;
  let brandProfile = null;
  let purchaseProfile = null;

  if (existingCreator) creatorProfile = await InfluencerProfile.findOne({ user_id: existingCreator._id }).lean();
  if (existingBrand) brandProfile = await BrandProfile.findOne({ user_id: existingBrand._id }).lean();
  if (existingPurchase) purchaseProfile = await InfluencerProfile.findOne({ user_id: existingPurchase._id }).lean();

  console.log('--- Account State Inspection ---');
  console.log(`1. Pro Creator Account [${CREATOR_EMAIL}]:`);
  if (existingCreator) {
    console.log(`   - Status : EXISTS (ID: ${existingCreator._id}, Role: ${existingCreator.role})`);
    console.log(`   - Profile: ${creatorProfile ? 'Present (Pro Member: ' + (creatorProfile.is_pro_member ? 'Active' : 'Inactive') + ')' : 'Missing'}`);
    console.log(`   - Action : ${forceUpdatePasswords ? 'UPDATE (Password will be updated)' : 'SKIP / PRESERVE (Existing password and role preserved)'}`);
  } else {
    console.log('   - Status : NOT FOUND');
    console.log('   - Action : CREATE (Will create new Creator user with Pro Member active)');
  }

  console.log(`\n2. Brand Reviewer Account [${BRAND_EMAIL}]:`);
  if (existingBrand) {
    console.log(`   - Status : EXISTS (ID: ${existingBrand._id}, Role: ${existingBrand.role})`);
    console.log(`   - Profile: ${brandProfile ? 'Present (' + brandProfile.company_name + ')' : 'Missing'}`);
    console.log(`   - Action : ${forceUpdatePasswords ? 'UPDATE (Password will be updated)' : 'SKIP / PRESERVE (Existing password and role preserved)'}`);
  } else {
    console.log('   - Status : NOT FOUND');
    console.log('   - Action : CREATE (Will create new Brand user)');
  }

  console.log(`\n3. Non-Pro Purchase Tester [${PURCHASE_EMAIL}]:`);
  if (existingPurchase) {
    console.log(`   - Status : EXISTS (ID: ${existingPurchase._id}, Role: ${existingPurchase.role})`);
    const isPro = purchaseProfile?.is_pro_member || false;
    console.log(`   - Profile: ${purchaseProfile ? 'Present (Pro Member: ' + isPro + ')' : 'Missing'}`);
    if (isPro && !resetPurchaseTester) {
      console.log('   - Action : PRESERVE PRO (User previously purchased Pro in Sandbox; will NOT reset to non-Pro without --reset-purchase-tester)');
    } else {
      console.log(`   - Action : ${forceUpdatePasswords ? 'UPDATE (Password updated)' : 'PRESERVE (Existing password preserved)'}`);
    }
  } else {
    console.log('   - Status : NOT FOUND');
    console.log('   - Action : CREATE (Will create new Creator user with Pro Member: false for Sandbox testing)');
  }

  if (isDryRun) {
    console.log('\n========================================================================');
    console.log('🔍 DRY-RUN COMPLETE: Zero database writes were performed.');
    console.log('========================================================================\n');
    await mongoose.disconnect();
    return;
  }

  // --- LIVE EXECUTION (Only reached when --confirm-live-seed is provided) ---
  console.log('\n--- Executing Live Seeding ---');

  // Verify passwords for accounts that require creation or forced update
  const needCreatorPw = !existingCreator || forceUpdatePasswords;
  const needBrandPw = !existingBrand || forceUpdatePasswords;
  const needPurchasePw = !existingPurchase || forceUpdatePasswords;

  if (needCreatorPw && (!creatorPassword || creatorPassword.length < 10)) {
    console.error('❌ ERROR: REVIEWER_CREATOR_PASSWORD is required (min 10 characters) for Creator account creation/update.');
    process.exit(1);
  }
  if (needBrandPw && (!brandPassword || brandPassword.length < 10)) {
    console.error('❌ ERROR: REVIEWER_BRAND_PASSWORD is required (min 10 characters) for Brand account creation/update.');
    process.exit(1);
  }
  if (needPurchasePw && (!purchasePassword || purchasePassword.length < 10)) {
    console.error('❌ ERROR: REVIEWER_PURCHASE_PASSWORD is required (min 10 characters) for Purchase Tester account creation/update.');
    process.exit(1);
  }

  // 1. Creator Account
  if (!existingCreator || forceUpdatePasswords) {
    const creatorSalt = await bcrypt.genSalt(12);
    const hashedCreatorPw = await bcrypt.hash(creatorPassword, creatorSalt);
    const creatorUser = await User.findOneAndUpdate(
      { email: CREATOR_EMAIL },
      { $set: { email: CREATOR_EMAIL, password: hashedCreatorPw, role: 'influencer' } },
      { upsert: true, new: true }
    );
    await InfluencerProfile.findOneAndUpdate(
      { user_id: creatorUser._id },
      {
        $set: {
          user_id: creatorUser._id,
          name: 'App Reviewer (Creator)',
          bio: 'Dedicated creator review account for App Store and Google Play Store verification.',
          is_pro_member: true,
          category: 'Fashion & Lifestyle',
          instagram_handle: 'appstore_review',
          followers_count: 50000,
          profile_image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=600&h=600&q=80',
        }
      },
      { upsert: true, new: true }
    );
    console.log(`✅ [CREATED/UPDATED] Creator Account: ${CREATOR_EMAIL}`);
  } else {
    console.log(`⏭️ [SKIPPED] Creator Account: ${CREATOR_EMAIL} (Password & role preserved)`);
  }

  // 2. Brand Account
  if (!existingBrand || forceUpdatePasswords) {
    const brandSalt = await bcrypt.genSalt(12);
    const hashedBrandPw = await bcrypt.hash(brandPassword, brandSalt);
    const brandUser = await User.findOneAndUpdate(
      { email: BRAND_EMAIL },
      { $set: { email: BRAND_EMAIL, password: hashedBrandPw, role: 'brand' } },
      { upsert: true, new: true }
    );
    await BrandProfile.findOneAndUpdate(
      { user_id: brandUser._id },
      {
        $set: {
          user_id: brandUser._id,
          company_name: 'App Store Review Brand',
          category: 'Fashion & Apparel',
          website: 'https://fluencer.app',
          address: 'Mumbai, Maharashtra, India',
          description: 'Dedicated brand review account for App Store and Google Play Store compliance testing.',
          profile_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&h=600&q=80',
          verified: true,
        }
      },
      { upsert: true, new: true }
    );
    console.log(`✅ [CREATED/UPDATED] Brand Account: ${BRAND_EMAIL}`);
  } else {
    console.log(`⏭️ [SKIPPED] Brand Account: ${BRAND_EMAIL} (Password & role preserved)`);
  }

  // 3. Non-Pro Purchase Tester Account
  if (!existingPurchase || forceUpdatePasswords) {
    const purchaseSalt = await bcrypt.genSalt(12);
    const hashedPurchasePw = await bcrypt.hash(purchasePassword, purchaseSalt);
    const purchaseUser = await User.findOneAndUpdate(
      { email: PURCHASE_EMAIL },
      { $set: { email: PURCHASE_EMAIL, password: hashedPurchasePw, role: 'influencer' } },
      { upsert: true, new: true }
    );
    
    // Determine is_pro_member state: preserve existing if already bought unless explicitly reset
    const proStateToSet = existingPurchase && purchaseProfile?.is_pro_member && !resetPurchaseTester
      ? true
      : false;

    await InfluencerProfile.findOneAndUpdate(
      { user_id: purchaseUser._id },
      {
        $set: {
          user_id: purchaseUser._id,
          name: 'StoreKit Purchase Tester',
          bio: 'Dedicated creator test account for verifying in-app purchases and restore flows in Sandbox.',
          is_pro_member: proStateToSet,
          category: 'Tech & Gaming',
          instagram_handle: 'iap_sandbox_test',
          followers_count: 10000,
          profile_image: 'https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=600&h=600&q=80',
        }
      },
      { upsert: true, new: true }
    );
    console.log(`✅ [CREATED/UPDATED] Purchase Tester Account: ${PURCHASE_EMAIL} (Pro Member: ${proStateToSet})`);
  } else {
    console.log(`⏭️ [SKIPPED] Purchase Tester Account: ${PURCHASE_EMAIL} (Password & Pro status preserved)`);
  }

  console.log('\n🔒 Live seeding completed cleanly. No unrelated database records were modified.');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
