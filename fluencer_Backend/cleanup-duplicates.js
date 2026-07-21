import pool from './src/config/database.js';

async function cleanupDuplicateNotifications() {
  try {
    console.log('🧹 Cleaning up duplicate notifications...');
    
    // Delete duplicate notifications, keeping only the oldest one for each title
    const query = `
      DELETE n1 FROM notifications n1
      INNER JOIN notifications n2 
      WHERE n1.id > n2.id 
      AND n1.title = n2.title 
      AND n1.message = n2.message
      AND n1.target_type = n2.target_type
    `;
    
    const [result] = await pool.query(query);
    
    console.log(`✅ Removed ${result.affectedRows} duplicate notifications!`);
    
    // Show remaining notifications
    const [remaining] = await pool.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`📊 Total notifications remaining: ${remaining[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error);
    process.exit(1);
  }
}

cleanupDuplicateNotifications();
