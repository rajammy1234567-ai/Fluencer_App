import pool from './src/config/database.js';

async function viewAndCleanNotifications() {
  try {
    console.log('📋 Checking all notifications...\n');
    
    // Show all notifications
    const [allNotifs] = await pool.query(`
      SELECT id, title, LEFT(message, 50) as message_preview, target_type, created_at
      FROM notifications 
      ORDER BY id
    `);
    
    console.log('All notifications:');
    allNotifs.forEach(n => {
      console.log(`ID: ${n.id}, Title: "${n.title}", Type: ${n.target_type}, Created: ${n.created_at}`);
    });
    
    console.log('\n🧹 Cleaning up sample notifications from init script...');
    
    // Delete the specific sample notifications that were added during init
    const deleteQuery = `
      DELETE FROM notifications 
      WHERE title IN (
        'Welcome to Influish!',
        'New Feature Update',
        'Payment Update'
      )
    `;
    
    const [result] = await pool.query(deleteQuery);
    
    console.log(`✅ Removed ${result.affectedRows} sample notifications!`);
    
    // Show remaining
    const [remaining] = await pool.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`📊 Total notifications remaining: ${remaining[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

viewAndCleanNotifications();
