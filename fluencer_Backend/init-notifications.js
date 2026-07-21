import pool from './src/config/database.js';

async function initNotificationsTable() {
  try {
    console.log('Creating notifications table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        target_type ENUM('all', 'all_brands', 'all_influencers', 'brand', 'influencer') NOT NULL DEFAULT 'all',
        target_id INT NULL COMMENT 'Specific brand_id or influencer_id if target_type is brand/influencer',
        is_read BOOLEAN DEFAULT FALSE,
        created_by INT NULL COMMENT 'Admin user ID who sent the notification',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_target (target_type, target_id),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Notifications table created successfully!');
    
    // Add sample notifications
    const insertQuery = `
      INSERT INTO notifications (title, message, target_type, created_by) VALUES
      ('Welcome to Fluncer!', 'Thank you for joining our platform. Start creating amazing campaigns!', 'all_brands', 1),
      ('New Feature Update', 'We have added new analytics dashboard for better campaign tracking.', 'all', 1),
      ('Payment Update', 'Your payment has been processed successfully.', 'all_influencers', 1)
      ON DUPLICATE KEY UPDATE id=id;
    `;
    
    await pool.query(insertQuery);
    console.log('✅ Sample notifications added!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    process.exit(1);
  }
}

initNotificationsTable();
