import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function initDatabase() {
  let connection;
  
  try {
    console.log('📡 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true,
    });

    console.log('✅ Connected to database');
    console.log('📄 Reading schema.sql...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔨 Creating tables...');
    await connection.query(schema);

    console.log('✅ Database initialized successfully!');
    console.log('\n📊 Tables created:');
    console.log('  - users');
    console.log('  - otp_verifications');
    console.log('  - influencer_profiles');
    console.log('  - brand_profiles');
    console.log('  - campaigns');
    console.log('  - campaign_applications');
    console.log('  - messages');
    console.log('  - payment_orders');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

initDatabase();
