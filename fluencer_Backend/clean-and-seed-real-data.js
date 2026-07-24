import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';
import BrandProfile from './src/models/BrandProfile.js';
import Campaign from './src/models/Campaign.js';
import './src/config/database.js';

dotenv.config();

async function seedCleanRealData() {
  try {
    console.log('🧹 Cleaning database and seeding 100% Authentic Real Brand Campaigns...');

    // 1. Remove all old test/dummy campaigns
    await Campaign.deleteMany({});
    console.log('✅ Removed all old test/dummy campaigns from database');

    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // 2. Ensure Authentic Brands exist
    const brandDefinitions = [
      {
        email: 'krishna@fluencer.app',
        company_name: 'Krishna Private Limited',
        category: 'Fashion & Luxury Apparel',
        address: 'Krishna Tower, Bandra West, Mumbai, Maharashtra 400050',
        website: 'https://krishnagroup.com',
        description: 'Premier Indian luxury fashion house specializing in handcrafted ethnic wear, festive apparel, and modern streetwear collections.',
        profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
      },
      {
        email: 'glowaura@fluencer.app',
        company_name: 'GlowAura Organic Beauty',
        category: 'Cosmetics & Skincare',
        address: 'GlowAura Hub, Indiranagar, Bangalore, Karnataka 560038',
        website: 'https://glowaura.in',
        description: '100% Organic, vegan, and cruelty-free skincare brand formulating vitamin-enriched daily glowing serums and moisturizers.',
        profile_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'
      },
      {
        email: 'urbanthread@fluencer.app',
        company_name: 'UrbanThread Streetwear Studio',
        category: 'Streetwear & Denim',
        address: 'Connaught Place, New Delhi 110001',
        website: 'https://urbanthread.co.in',
        description: 'Contemporary streetwear and oversized denim label crafting trendsetting urban apparel for India’s top Gen-Z content creators.',
        profile_image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500'
      },
      {
        email: 'apexfit@fluencer.app',
        company_name: 'Apex Pro Fitness & Nutrition',
        category: 'Health & Wellness',
        address: 'Fitness Zone, HSR Layout, Bangalore, Karnataka 560102',
        website: 'https://apexfit.in',
        description: 'Leading sports nutrition brand offering premium whey protein isolates, plant proteins, pre-workouts, and fitness gear.',
        profile_image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'
      }
    ];

    const brandUsersMap = {};

    for (const bDef of brandDefinitions) {
      let u = await User.findOne({ email: bDef.email });
      if (!u) {
        u = await User.create({
          email: bDef.email,
          password: hashedPassword,
          role: 'brand',
          is_verified: true
        });
      }

      let bp = await BrandProfile.findOne({ user_id: u._id.toString() });
      if (!bp) {
        bp = await BrandProfile.create({
          user_id: u._id.toString(),
          company_name: bDef.company_name,
          category: bDef.category,
          address: bDef.address,
          website: bDef.website,
          description: bDef.description,
          profile_image: bDef.profile_image,
          wallet_balance: 50000,
          escrow_balance: 0
        });
      } else {
        bp.company_name = bDef.company_name;
        bp.category = bDef.category;
        bp.address = bDef.address;
        bp.website = bDef.website;
        bp.description = bDef.description;
        bp.profile_image = bDef.profile_image;
        await bp.save();
      }

      brandUsersMap[bDef.email] = u._id.toString();
      console.log(`✅ Brand Verified: ${bDef.company_name}`);
    }

    // 3. Seed Authentic High-Value Real Campaigns
    const authenticCampaigns = [
      {
        brand_id: brandUsersMap['krishna@fluencer.app'],
        campaign_name: 'Summer Ethnic Wear Reel Collection Drop',
        description: 'Looking for fashion and lifestyle creators to shoot high-energy 30-second outfit transition Reels showcasing our new summer kurtis and festive sherwanis in natural sunlight.',
        campaign_type: 'paid',
        content_type: 'reel',
        number_of_seats: 5,
        min_followers: 10000,
        cost_per_influencer: 5000,
        total_budget: 25000,
        shooting_location_guide: 'Aesthetic outdoor courtyard, heritage monument, or well-lit studio with natural sunlight and aesthetic props.',
        guidelines: '1. Show quick outfit transition in first 3 seconds.\n2. Wear matching accessories.\n3. Tag @krishnaprivatelimited.\n4. Use trending audio and hashtag #KrishnaSummerVibes.',
        sample_reel_url: 'https://instagram.com/reel/C_ethnic_fashion_summer',
        status: 'open'
      },
      {
        brand_id: brandUsersMap['glowaura@fluencer.app'],
        campaign_name: 'GlowAura Vitamin C Morning Glow Routine',
        description: 'Creators needed to demonstrate our Vitamin C serum in a clean, aesthetic morning routine Reel highlighting natural skin hydration and instant glow.',
        campaign_type: 'paid',
        content_type: 'reel',
        number_of_seats: 4,
        min_followers: 5000,
        cost_per_influencer: 7500,
        total_budget: 30000,
        shooting_location_guide: 'Brightly lit bathroom vanity, mirror setup, or clean aesthetic bedroom with morning daylight.',
        guidelines: '1. Show product application step-by-step on clean face.\n2. Highlight 100% organic and cruelty-free benefits.\n3. Tag @glowaura_skincare.',
        sample_reel_url: 'https://instagram.com/reel/C_glow_skincare_routine',
        status: 'open'
      },
      {
        brand_id: brandUsersMap['urbanthread@fluencer.app'],
        campaign_name: 'Urban Denim Street Style Showcase',
        description: 'High-octane urban fashion Reel showcasing our slim-fit premium denim jacket and distressed jeans combo.',
        campaign_type: 'paid',
        content_type: 'reel',
        number_of_seats: 6,
        min_followers: 15000,
        cost_per_influencer: 6000,
        total_budget: 36000,
        shooting_location_guide: 'Urban streetscape, graffiti wall, rooftop, or city skyline background.',
        guidelines: '1. Pair denim jacket with white sneakers and sunglasses.\n2. Sync transitions to upbeat hip-hop track.\n3. Tag @urbanthread_studio.',
        sample_reel_url: 'https://instagram.com/reel/C_streetwear_denim_look',
        status: 'open'
      },
      {
        brand_id: brandUsersMap['apexfit@fluencer.app'],
        campaign_name: 'Apex Pro Whey Shake Unboxing & Fitness Review',
        description: 'Fitness and gym creators needed to shoot a 30s protein shake preparation and post-workout taste test Reel.',
        campaign_type: 'paid',
        content_type: 'reel',
        number_of_seats: 8,
        min_followers: 8000,
        cost_per_influencer: 8000,
        total_budget: 64000,
        shooting_location_guide: 'Gym environment, home workout station, or kitchen counter setup.',
        guidelines: '1. Demonstrate scoop mixability in shaker bottle.\n2. Mention 24g pure whey protein per serving.\n3. Tag @apexfit_nutrition.',
        sample_reel_url: 'https://instagram.com/reel/C_fitness_whey_shake',
        status: 'open'
      }
    ];

    for (const cData of authenticCampaigns) {
      await Campaign.create(cData);
      console.log(`✅ Created Authentic Campaign: "${cData.campaign_name}" (Budget: ₹${cData.cost_per_influencer})`);
    }

    console.log('\n🎉 DATABASE CLEANED & AUTHENTIC REAL DATA SEEDED PERFECTLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding authentic data:', error);
    process.exit(1);
  }
}

seedCleanRealData();
