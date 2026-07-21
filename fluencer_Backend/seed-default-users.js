import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seedDefaultUsers() {
  let connection;
  
  try {
    console.log('📡 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    console.log('✅ Connected to database');

    // Default passwords (will be hashed)
    const defaultPassword = 'Test@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // ==================== DEFAULT INFLUENCER ====================
    console.log('\n📝 Creating default influencer account...');
    
    const influencerEmail = 'testinfluencer@fluncer.com';
    
    // Check if influencer already exists
    const [existingInfluencer] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [influencerEmail]
    );

    let influencerId;
    
    if (existingInfluencer.length > 0) {
      console.log('⚠️  Influencer account already exists, updating password...');
      influencerId = existingInfluencer[0].id;
      await connection.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, influencerId]
      );
    } else {
      console.log('➕ Creating new influencer account...');
      const [result] = await connection.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [influencerEmail, hashedPassword, 'influencer']
      );
      influencerId = result.insertId;
    }

    // Create/update influencer profile
    const [existingInfluencerProfile] = await connection.query(
      'SELECT id FROM influencer_profiles WHERE user_id = ?',
      [influencerId]
    );

    const influencerCategories = JSON.stringify(['Fashion', 'Lifestyle', 'Technology']);

    if (existingInfluencerProfile.length > 0) {
      console.log('🔄 Updating influencer profile...');
      await connection.query(
        `UPDATE influencer_profiles SET 
          name = ?,
          gender = ?,
          categories = ?,
          location = ?,
          bio = ?,
          followers_count = ?
        WHERE user_id = ?`,
        [
          'Demo Influencer',
          'male',
          influencerCategories,
          'Mumbai, Maharashtra',
          'Professional content creator and influencer. Passionate about fashion, lifestyle, and technology. Available for brand collaborations and sponsored content.',
          15000,
          influencerId
        ]
      );
    } else {
      console.log('➕ Creating influencer profile...');
      await connection.query(
        `INSERT INTO influencer_profiles 
          (user_id, name, gender, categories, location, bio, followers_count) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          influencerId,
          'Demo Influencer',
          'male',
          influencerCategories,
          'Mumbai, Maharashtra',
          'Professional content creator and influencer. Passionate about fashion, lifestyle, and technology. Available for brand collaborations and sponsored content.',
          15000
        ]
      );
    }

    console.log('✅ Default influencer created successfully!');
    console.log('   📧 Email: testinfluencer@fluncer.com');
    console.log('   🔑 Password: Test@123');

    // ==================== DEFAULT BRAND ====================
    console.log('\n📝 Creating default brand account...');
    
    const brandEmail = 'testbrand@fluncer.com';
    
    // Check if brand already exists
    const [existingBrand] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [brandEmail]
    );

    let brandId;
    
    if (existingBrand.length > 0) {
      console.log('⚠️  Brand account already exists, updating password...');
      brandId = existingBrand[0].id;
      await connection.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, brandId]
      );
    } else {
      console.log('➕ Creating new brand account...');
      const [result] = await connection.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [brandEmail, hashedPassword, 'brand']
      );
      brandId = result.insertId;
    }

    // Create/update brand profile
    const [existingBrandProfile] = await connection.query(
      'SELECT id FROM brand_profiles WHERE user_id = ?',
      [brandId]
    );

    if (existingBrandProfile.length > 0) {
      console.log('🔄 Updating brand profile...');
      await connection.query(
        `UPDATE brand_profiles SET 
          company_name = ?,
          category = ?,
          address = ?,
          website = ?,
          description = ?
        WHERE user_id = ?`,
        [
          'Demo Brand Company',
          'Fashion & Apparel',
          '123 Business Park, Andheri East, Mumbai, Maharashtra 400069',
          'https://demobrand.com',
          'Leading fashion and lifestyle brand looking for influencer collaborations. We create innovative campaigns and value authentic partnerships with content creators.',
          brandId
        ]
      );
    } else {
      console.log('➕ Creating brand profile...');
      await connection.query(
        `INSERT INTO brand_profiles 
          (user_id, company_name, category, address, website, description) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          brandId,
          'Demo Brand Company',
          'Fashion & Apparel',
          '123 Business Park, Andheri East, Mumbai, Maharashtra 400069',
          'https://demobrand.com',
          'Leading fashion and lifestyle brand looking for influencer collaborations. We create innovative campaigns and value authentic partnerships with content creators.'
        ]
      );
    }

    console.log('✅ Default brand created successfully!');
    console.log('   📧 Email: testbrand@fluncer.com');
    console.log('   🔑 Password: Test@123');

    console.log('\n🎉 All default accounts are ready!');
    console.log('\n📋 Summary:');
    console.log('─────────────────────────────────────────');
    console.log('INFLUENCER LOGIN:');
    console.log('  Email: testinfluencer@fluncer.com');
    console.log('  Password: Test@123');
    console.log('');
    console.log('BRAND LOGIN:');
    console.log('  Email: testbrand@fluncer.com');
    console.log('  Password: Test@123');
    console.log('─────────────────────────────────────────');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

seedDefaultUsers();
