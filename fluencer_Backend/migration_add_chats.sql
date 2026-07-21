-- Migration Script: Add Chat System and Update Campaigns
-- Run this script to add the chat system without losing existing data

-- 1. Add new columns to campaigns table if they don't exist
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_available TINYINT(1) DEFAULT 1;

-- 2. Update status enum if needed (check current values first)
-- If you have existing 'active' campaigns, they will become 'open'
-- UPDATE campaigns SET status = 'open' WHERE status = 'active';

-- 3. Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  brand_id INT NOT NULL,
  influencer_id INT NOT NULL,
  message_count INT DEFAULT 0,
  max_messages INT DEFAULT 10,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  FOREIGN KEY (influencer_id) REFERENCES influencers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_chat (campaign_id, influencer_id),
  INDEX idx_brand_id (brand_id),
  INDEX idx_influencer_id (influencer_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT NOT NULL,
  sender_id INT NOT NULL,
  sender_role ENUM('brand', 'influencer') NOT NULL,
  message TEXT NOT NULL,
  message_type ENUM('text', 'image', 'video', 'link') DEFAULT 'text',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  INDEX idx_chat_id (chat_id),
  INDEX idx_sender (sender_id, sender_role),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Add chat_id to campaign_applications if it doesn't exist
ALTER TABLE campaign_applications
ADD COLUMN IF NOT EXISTS chat_id INT NULL,
ADD CONSTRAINT fk_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE SET NULL;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_deleted ON campaigns(is_deleted);
CREATE INDEX IF NOT EXISTS idx_campaigns_available ON campaigns(is_available);
CREATE INDEX IF NOT EXISTS idx_campaigns_active_filter ON campaigns(status, is_deleted, is_available);

-- 7. Update existing data
-- Set all existing campaigns as not deleted and available
UPDATE campaigns 
SET is_deleted = 0, is_available = 1 
WHERE is_deleted IS NULL OR is_available IS NULL;

-- Display summary
SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS total_campaigns FROM campaigns;
SELECT COUNT(*) AS active_campaigns FROM campaigns WHERE status = 'open' AND is_deleted = 0 AND is_available = 1;
SELECT COUNT(*) AS total_chats FROM chats;
