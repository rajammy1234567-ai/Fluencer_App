import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function checkSharedDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log('--- DATABASE INSPECTION ---');
  console.log('Database Name:', db.databaseName);

  const testRegex = /^(func_|conc_|load_|iso_|test_)/i;

  // 1. Users
  const totalUsers = await db.collection('users').countDocuments();
  const testUsers = await db.collection('users').find({ email: testRegex }, { projection: { email: 1, role: 1, created_at: 1 } }).toArray();
  console.log('\n[USERS]');
  console.log('Total Users:', totalUsers);
  console.log('Test-prefixed users remaining:', testUsers.length);
  if (testUsers.length > 0) {
    console.log('Remaining test users:', testUsers);
  }

  // 2. Applications
  const totalApps = await db.collection('applications').countDocuments();
  console.log('\n[APPLICATIONS]');
  console.log('Total Applications:', totalApps);

  // 3. Wallet Transactions
  const totalTx = await db.collection('wallettransactions').countDocuments();
  const recentTx = await db.collection('wallettransactions').find({
    created_at: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
  }).toArray();
  console.log('\n[WALLET TRANSACTIONS]');
  console.log('Total Transactions:', totalTx);
  console.log('Transactions in last 6 hours:', recentTx.length);
  console.log('Recent Tx List:', recentTx.map(t => ({
    id: t._id.toString(),
    user: t.user_id ? t.user_id.toString() : 'null',
    desc: t.description,
    type: t.type,
    amount: t.amount,
    time: t.created_at
  })));

  // 4. Pre-existing Reviewer Profiles
  const reviewerCreator = await db.collection('influencerprofiles').findOne({ name: /Ananya/i });
  const reviewerBrand = await db.collection('brandprofiles').findOne({ $or: [{ company_name: /Krishna|UrbanStyle/i }, { brand_name: /Krishna|UrbanStyle/i }] });
  console.log('\n[REVIEWER SEED PROFILES]');
  console.log('Creator (Ananya):', reviewerCreator ? { id: reviewerCreator._id, is_pro: reviewerCreator.is_pro_member, wallet: reviewerCreator.wallet_balance } : 'null');
  console.log('Brand (UrbanStyle/Krishna):', reviewerBrand ? { id: reviewerBrand._id, wallet: reviewerBrand.wallet_balance, escrow: reviewerBrand.escrow_balance } : 'null');

  // 5. Campaigns
  const totalCamps = await db.collection('campaigns').countDocuments();
  const testCamps = await db.collection('campaigns').countDocuments({ campaign_name: testRegex });
  console.log('\n[CAMPAIGNS]');
  console.log('Total Campaigns:', totalCamps);
  console.log('Test-prefixed campaigns remaining:', testCamps);

  // 6. Messages
  const totalMsgs = await db.collection('messages').countDocuments();
  console.log('\n[MESSAGES]');
  console.log('Total Messages:', totalMsgs);

  await mongoose.disconnect();
}

checkSharedDb().catch(console.error);
