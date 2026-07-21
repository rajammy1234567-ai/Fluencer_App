import pool from './src/config/database.js';

async function showAllNotifications() {
  try {
    console.log('📋 All notifications in database:\n');
    
    const [notifications] = await pool.query(`
      SELECT * FROM notifications 
      ORDER BY id
    `);
    
    console.log(`Total count: ${notifications.length}\n`);
    
    notifications.forEach(n => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${n.id}`);
      console.log(`Title: ${n.title}`);
      console.log(`Message: ${n.message}`);
      console.log(`Target Type: ${n.target_type}`);
      console.log(`Target ID: ${n.target_id}`);
      console.log(`Created By: ${n.created_by}`);
      console.log(`Is Read: ${n.is_read}`);
      console.log(`Created At: ${n.created_at}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

showAllNotifications();
