import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGODB_URI = 'mongodb+srv://vizdigitalofficial_db_user:ZNe3TyS3aKexS17u@fluencer01.vfpqbe9.mongodb.net/fluencer01?retryWrites=true&w=majority&appName=fluencer01';

async function setupVerificationAccounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    const User = mongoose.connection.collection('users');
    const InfluencerProfile = mongoose.connection.collection('influencerprofiles');
    const BrandProfile = mongoose.connection.collection('brandprofiles');

    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // 1. Setup Influencer Account
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

    let cProfile = await InfluencerProfile.findOne({ user_id: creator._id.toString() });
    if (!cProfile) {
      await InfluencerProfile.insertOne({
        user_id: creator._id.toString(),
        name: 'Ananya Sharma',
        niche: 'Fashion & Lifestyle',
        location: 'Mumbai, Maharashtra',
        phone: '+91 9876543210',
        wallet_balance: 0,
        escrow_balance: 0,
        followers_count: 125000,
        created_at: new Date()
      });
    }

    // 2. Setup Brand Account
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

    let bProfile = await BrandProfile.findOne({ user_id: brand._id.toString() });
    if (!bProfile) {
      await BrandProfile.insertOne({
        user_id: brand._id.toString(),
        company_name: 'Krishna Private Limited',
        category: 'Fashion & Luxury Apparel',
        address: 'Bandra West, Mumbai',
        wallet_balance: 50000,
        escrow_balance: 0,
        created_at: new Date()
      });
    }

    console.log('\n=============================================================');
    console.log('🎉 VERIFICATION ACCOUNTS SETUP COMPLETE!');
    console.log('   1. CREATOR ACCOUNT:');
    console.log('      - Email: creator@fluencer.app');
    console.log('      - Password: Test@123');
    console.log('   2. BRAND ACCOUNT:');
    console.log('      - Email: krishna@fluencer.app');
    console.log('      - Password: Test@123');
    console.log('   3. MASTER ADMIN CONTROL PANEL:');
    console.log('      - Link: https://fluencer-app.onrender.com/admin');
    console.log('      - Email: admin@fluencer.app');
    console.log('      - Password: Admin@123');
    console.log('=============================================================\n');

  } catch (err) {
    console.error('Error setting up verification accounts:', err);
  } finally {
    await mongoose.disconnect();
  }
}

setupVerificationAccounts();
