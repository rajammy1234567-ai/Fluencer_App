import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';
import BrandProfile from './src/models/BrandProfile.js';
import Campaign from './src/models/Campaign.js';
import './src/config/database.js';

dotenv.config();

async function seedRealCampaigns() {
  try {
    console.log('🌱 Seeding Realistic High-Value Brand Campaigns...');

    // Clean up old test placeholder campaigns
    await Campaign.deleteMany({ campaign_name: { $in: ['Reel banao', 'Application', 'test'] } });
    console.log('🧹 Cleaned up old placeholder test campaigns');

    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // 1. Create or Find Krishna Private Limited
    let krishUser = await User.findOne({ email: 'krishna@fluencer.app' });
    if (!krishUser) {
      krishUser = await User.create({
        email: 'krishna@fluencer.app',
        password: hashedPassword,
        role: 'brand',
        is_verified: true
      });
    }

    let krishBrand = await BrandProfile.findOne({ user_id: krishUser._id.toString() });
    if (!krishBrand) {
      krishBrand = await BrandProfile.create({
        user_id: krishUser._id.toString(),
        company_name: 'Krishna Private Limited',
        category: 'Fashion & Apparel',
        address: 'Krishna Tower, Bandra West, Mumbai 400050',
        website: 'https://krishnagroup.com',
        description: 'Premium Indian fashion, ethnic wear, and luxury lifestyle apparel brand.',
        wallet_balance: 50000,
        escrow_balance: 0
      });
    }

    // 2. Create or Find GlowAura Organic Beauty
    let glowUser = await User.findOne({ email: 'glowaura@fluencer.app' });
    if (!glowUser) {
      glowUser = await User.create({
        email: 'glowaura@fluencer.app',
        password: hashedPassword,
        role: 'brand',
        is_verified: true
      });
    }

    let glowBrand = await BrandProfile.findOne({ user_id: glowUser._id.toString() });
    if (!glowBrand) {
      glowBrand = await BrandProfile.create({
        user_id: glowUser._id.toString(),
        company_name: 'GlowAura Organic Beauty',
        category: 'Cosmetics & Skincare',
        address: 'Beauty Hub, Indiranagar, Bangalore 560038',
        website: 'https://glowaura.in',
        description: '100% Organic, Cruelty-Free skincare and wellness brand.',
        wallet_balance: 40000,
        escrow_balance: 0
      });
    }

    // 3. Create Real Campaigns
    const realCampaigns = [
      {
        brand_id: krishUser._id.toString(),
        campaign_name: 'Summer Ethnic Wear Reel Collection Drop',
        description: 'Looking for top fashion creators to shoot high-energy 30-second outfit transition Reels showcasing our new summer kurtis and sherwanis.',
        campaign_type: 'paid',
        content_type: 'reel',
        number_of_seats: 5,
        cost_per_influencer: 5000,
        total_budget: 25000,
        shooting_location_guide: 'Aesthetic outdoor courtyard, heritage monument, or well-lit studio with natural sunlight.',
        guidelines: '1. Show quick outfit transition in first 3 seconds.\n2. Tag @krishnaprivatelimited.\n3. Use hashtag #KrishnaSummerVibes.',
        sample_reel_url: 'https://instagram.com/reel/C_sample_fashion_ethnic',
        status: 'open'
      },
      {
        brand_id: glowUser._id.toString(),
        campaign_name: 'GlowAura Vitamin C Morning Glow Routine',
        description: 'Creators needed to demonstrate our Vitamin C serum in a clean, morning routine Reel highlighting skin hydration and glow.',
        campaign_type: 'paid',
        content_type: 'reel',
        number_of_seats: 4,
        cost_per_influencer: 7500,
        total_budget: 30000,
        shooting_location_guide: 'Brightly lit bathroom vanity, mirror setup, or clean aesthetic bedroom with morning daylight.',
        guidelines: '1. Show product application step-by-step.\n2. Highlight 100% organic and cruelty-free benefits.\n3. Tag @glowaura_skincare.',
        sample_reel_url: 'https://instagram.com/reel/C_sample_skincare_glow',
        status: 'open'
      },
      {
        brand_id: krishUser._id.toString(),
        campaign_name: 'Urban Denim Street Style Showcase',
        description: 'High-octane urban fashion Reel showcasing our slim-fit premium denim jacket and jeans combo.',
        campaign_type: 'paid',
        content_type: 'reel',
        number_of_seats: 6,
        cost_per_influencer: 6000,
        total_budget: 36000,
        shooting_location_guide: 'Urban streetscape, graffiti wall, rooftop, or city skyline background.',
        guidelines: '1. Wear sunglasses and sneakers to match denim jacket.\n2. Add trending audio beat.\n3. Tag @krishnaprivatelimited.',
        sample_reel_url: 'https://instagram.com/reel/C_sample_denim_street',
        status: 'open'
      }
    ];

    for (const cData of realCampaigns) {
      const exists = await Campaign.findOne({ campaign_name: cData.campaign_name });
      if (!exists) {
        await Campaign.create(cData);
        console.log(`✅ Created Real Campaign: ${cData.campaign_name} (Brand: ${cData.brand_id === krishUser._id.toString() ? 'Krishna Private Limited' : 'GlowAura Organic Beauty'})`);
      } else {
        console.log(`ℹ️ Campaign already exists: ${cData.campaign_name}`);
      }
    }

    console.log('\n🎉 Real Brand Campaigns Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding campaigns:', error);
    process.exit(1);
  }
}

seedRealCampaigns();
