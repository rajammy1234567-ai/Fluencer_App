-- Migration: Add Facebook OAuth support to users table
-- Date: 2026-01-28

-- Add facebook_id column
ALTER TABLE users 
ADD COLUMN facebook_id VARCHAR(255) UNIQUE AFTER email,
ADD COLUMN profile_picture VARCHAR(500) AFTER facebook_id,
ADD COLUMN is_verified TINYINT(1) DEFAULT 0 AFTER role;

-- Make password optional (for OAuth users)
ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;

-- Add index on facebook_id
CREATE INDEX idx_facebook_id ON users(facebook_id);

-- Migration complete
SELECT 'Facebook OAuth columns added successfully' as status;
