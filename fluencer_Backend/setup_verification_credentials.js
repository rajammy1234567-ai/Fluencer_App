import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI;

async function setupVerificationAccounts() {
  try {
    if (!MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    const reviewerPassword = process.env.REVIEWER_PASSWORD;
    if (!reviewerPassword || reviewerPassword.length < 12) {
      console.error('❌ Error: REVIEWER_PASSWORD environment variable must be set with at least 12 characters.');
      console.error('   Usage: REVIEWER_PASSWORD="YourStrongPassword123!" node setup_verification_credentials.js');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('📡 Connected to MongoDB Atlas...');

    const User = mongoose.connection.collection('users');
    const InfluencerProfile = mongoose.connection.collection('influencerprofiles');
    const BrandProfile = mongoose.connection.collection('brandprofiles');

    const hashedPassword = await bcrypt.hash(reviewerPassword, 12);

    // 1. Setup Influencer Reviewer Account
    let creator = await User.findOne({ email: 'creator@fluencer.app' });
    if (!creator) {
      const res = await User.insertOne({
        email: 'creator@fluencer.app',
        password: hashedPassword,
        role: 'influencer',
        is_verified: true,
        created_at: new Date()
      });
      creator = { _id: res.insertedId };
    } else {
      await User.updateOne({ _id: creator._id }, { $set: { password: hashedPassword, is_verified: true } });
    }

    let cProfile = await InfluencerProfile.findOne({ $or: [{ user_id: creator._id }, { user_id: creator._id.toString() }] });
    if (!cProfile) {
      await InfluencerProfile.insertOne({
        user_id: creator._id,
        name: 'Ananya Sharma (Demo Creator)',
        niche: 'Fashion & Lifestyle',
        location: 'Mumbai, Maharashtra',
        phone: '+91 9876543210',
        wallet_balance: 0,
        escrow_balance: 0,
        followers_count: 125000,
        is_pro_member: true,
        pro_unlocked_at: new Date(),
        created_at: new Date()
      });
    } else {
      await InfluencerProfile.updateOne(
        { _id: cProfile._id },
        { $set: { user_id: creator._id, is_pro_member: true, pro_unlocked_at: new Date() } }
      );
    }

    // 2. Setup Brand Reviewer Account
    let brand = await User.findOne({ email: 'krishna@fluencer.app' });
    if (!brand) {
      const res = await User.insertOne({
        email: 'krishna@fluencer.app',
        password: hashedPassword,
        role: 'brand',
        is_verified: true,
        created_at: new Date()
      });
      brand = { _id: res.insertedId };
    } else {
      await User.updateOne({ _id: brand._id }, { $set: { password: hashedPassword, is_verified: true } });
    }

    let bProfile = await BrandProfile.findOne({ $or: [{ user_id: brand._id }, { user_id: brand._id.toString() }] });
    if (!bProfile) {
      await BrandProfile.insertOne({
        user_id: brand._id,
        brand_name: 'UrbanStyle Co.',
        category: 'Fashion & Apparel',
        location: 'Bengaluru, India',
        phone: '+91 9123456780',
        wallet_balance: 50000,
        escrow_balance: 15000,
        campaigns_count: 4,
        created_at: new Date()
      });
    } else {
      await BrandProfile.updateOne(
        { _id: bProfile._id },
        { $set: { user_id: brand._id, wallet_balance: 50000 } }
      );
    }

    // 3. Setup Secondary Reviewer Creator
    let testInfluencer = await User.findOne({ email: 'testinfluencer@fluncer.com' });
    if (!testInfluencer) {
      const res = await User.insertOne({
        email: 'testinfluencer@fluncer.com',
        password: hashedPassword,
        role: 'influencer',
        is_verified: true,
        created_at: new Date()
      });
      testInfluencer = { _id: res.insertedId };
    } else {
      await User.updateOne({ _id: testInfluencer._id }, { $set: { password: hashedPassword, is_verified: true } });
    }

    let tiProfile = await InfluencerProfile.findOne({ $or: [{ user_id: testInfluencer._id }, { user_id: testInfluencer._id.toString() }] });
    if (!tiProfile) {
      await InfluencerProfile.insertOne({
        user_id: testInfluencer._id,
        name: 'Rohan Verma (Demo Influencer)',
        niche: 'Fitness & Health',
        location: 'Delhi, India',
        phone: '+91 9988776655',
        wallet_balance: 0,
        escrow_balance: 0,
        followers_count: 15000,
        is_pro_member: true,
        pro_unlocked_at: new Date(),
        created_at: new Date()
      });
    } else {
      await InfluencerProfile.updateOne(
        { _id: tiProfile._id },
        { $set: { user_id: testInfluencer._id, is_pro_member: true, pro_unlocked_at: new Date() } }
      );
    }

    // 4. Setup Secondary Reviewer Brand
    let testBrand = await User.findOne({ email: 'testbrand@fluncer.com' });
    if (!testBrand) {
      const res = await User.insertOne({
        email: 'testbrand@fluncer.com',
        password: hashedPassword,
        role: 'brand',
        is_verified: true,
        created_at: new Date()
      });
      testBrand = { _id: res.insertedId };
    } else {
      await User.updateOne({ _id: testBrand._id }, { $set: { password: hashedPassword, is_verified: true } });
    }

    let tbProfile = await BrandProfile.findOne({ $or: [{ user_id: testBrand._id }, { user_id: testBrand._id.toString() }] });
    if (!tbProfile) {
      await BrandProfile.insertOne({
        user_id: testBrand._id,
        brand_name: 'PureGlow Organics',
        category: 'Beauty & Skincare',
        location: 'Mumbai, India',
        phone: '+91 9876501234',
        wallet_balance: 50000,
        escrow_balance: 0,
        campaigns_count: 2,
        created_at: new Date()
      });
    } else {
      await BrandProfile.updateOne(
        { _id: tbProfile._id },
        { $set: { user_id: testBrand._id } }
      );
    }

    console.log('\n=============================================================');
    console.log('🎉 REVIEWER DEMO ACCOUNTS UPDATED SUCCESSFULLY!');
    console.log('   1. CREATOR ACCOUNT (Pro Pass Pre-Unlocked):');
    console.log('      - Email: creator@fluencer.app');
    console.log('      - Password: [CONFIGURED VIA REVIEWER_PASSWORD]');
    console.log('   2. BRAND ACCOUNT (Active Wallet Balance):');
    console.log('      - Email: krishna@fluencer.app');
    console.log('      - Password: [CONFIGURED VIA REVIEWER_PASSWORD]');
    console.log('=============================================================\n');

  } catch (err) {
    console.error('❌ Error setting up verification accounts:', err);
  } finally {
    await mongoose.disconnect();
  }
}

setupVerificationAccounts();
