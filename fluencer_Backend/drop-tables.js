import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabase() {
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
    
    // Disable foreign key checks
    console.log('🔓 Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop all tables
    console.log('🗑️  Dropping existing tables...');
    await connection.query('DROP TABLE IF EXISTS payment_orders');
    await connection.query('DROP TABLE IF EXISTS messages');
    await connection.query('DROP TABLE IF EXISTS campaign_applications');
    await connection.query('DROP TABLE IF EXISTS applications');
    await connection.query('DROP TABLE IF EXISTS campaigns');
    await connection.query('DROP TABLE IF EXISTS brand_profiles');
    await connection.query('DROP TABLE IF EXISTS influencer_profiles');
    await connection.query('DROP TABLE IF EXISTS otp_verifications');
    await connection.query('DROP TABLE IF EXISTS users');
    
    // Re-enable foreign key checks
    console.log('🔒 Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ All tables dropped');
    console.log('🔄 Now run: npm run init-db');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

fixDatabase();
