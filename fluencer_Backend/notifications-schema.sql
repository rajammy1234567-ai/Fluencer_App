-- Notifications table for admin to send notifications to brands/influencers

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

-- Add some sample notifications
INSERT INTO notifications (title, message, target_type, created_by) VALUES
('Welcome to Influish!', 'Thank you for joining our platform. Start creating amazing campaigns!', 'all_brands', 1),
('New Feature Update', 'We have added new analytics dashboard for better campaign tracking.', 'all', 1),
('Payment Update', 'Your payment has been processed successfully.', 'all_influencers', 1);
