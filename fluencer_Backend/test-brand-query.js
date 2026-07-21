import pool from './src/config/database.js';

async function testBrandNotificationQuery() {
  try {
    console.log('🧪 Testing brand notification query...\n');
    
    // Simulate a brand user with id=6 and role='brand'
    const userId = 6;
    const userType = 'brand';
    
    const query = `
      SELECT DISTINCT
        id,
        title,
        message,
        target_type,
        target_id,
        created_at,
        is_read
      FROM notifications
      WHERE target_type = 'all'
         OR (target_type = ? AND target_id = ?)
         OR (target_type = 'all_brands' AND ? = 'brand')
         OR (target_type = 'all_influencers' AND ? = 'influencer')
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    console.log('Query parameters:', [userType, userId, userType, userType]);
    
    const [notifications] = await pool.query(query, [
      userType,
      userId,
      userType,
      userType
    ]);
    
    console.log(`\n✅ Found ${notifications.length} notifications for brand user (id=${userId}):\n`);
    
    notifications.forEach(n => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${n.id}`);
      console.log(`Title: ${n.title}`);
      console.log(`Target Type: ${n.target_type}`);
      console.log(`Is Read: ${n.is_read}`);
      console.log(`Created: ${n.created_at}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testBrandNotificationQuery();
