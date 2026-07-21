-- Complete Database Schema for Influish Platform
-- This schema includes all necessary tables for campaigns, applications, and chat functionality

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('influencer', 'brand') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_email (email)
);

-- OTP Verifications Table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  otp VARCHAR(6) NOT NULL,
  otp_expiry TIMESTAMP,
  role ENUM('influencer', 'brand') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Influencer Profiles Table
CREATE TABLE IF NOT EXISTS influencer_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  categories JSON NOT NULL,
  location VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_image VARCHAR(500),
  followers_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_location (location),
  INDEX idx_followers (followers_count)
);

-- Brand Profiles Table
CREATE TABLE IF NOT EXISTS brand_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  address TEXT,
  profile_image VARCHAR(500),
  website VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Campaigns Table (UPDATED with is_deleted and is_available)
CREATE TABLE IF NOT EXISTS campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  brand_id INT NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,
  influencer_location VARCHAR(255),
  campaign_type ENUM('paid', 'barter') NOT NULL,
  content_type ENUM('reel', 'post', 'story') NOT NULL,
  number_of_seats INT NOT NULL,
  min_followers INT DEFAULT 0,
  cost_per_influencer DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  status ENUM('open', 'closed', 'paused') DEFAULT 'open',
  is_deleted TINYINT(1) DEFAULT 0,
  is_available TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_brand (brand_id),
  INDEX idx_status (status),
  INDEX idx_available (is_available, is_deleted),
  INDEX idx_created (created_at)
);

-- Campaign Applications Table
CREATE TABLE IF NOT EXISTS campaign_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  influencer_id INT NOT NULL,
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (influencer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (campaign_id, influencer_id),
  INDEX idx_campaign (campaign_id),
  INDEX idx_influencer (influencer_id),
  INDEX idx_status (status)
);

-- Chats Table (NEW - links campaign application to chat)
CREATE TABLE IF NOT EXISTS chats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  application_id INT NOT NULL UNIQUE,
  brand_id INT NOT NULL,
  influencer_id INT NOT NULL,
  message_count INT DEFAULT 0,
  max_messages INT DEFAULT 10,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES campaign_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (influencer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_brand (brand_id),
  INDEX idx_influencer (influencer_id),
  INDEX idx_active (is_active)
);

-- Chat Messages Table (NEW)
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chat_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  message_type ENUM('text', 'image', 'file') DEFAULT 'text',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chat (chat_id),
  INDEX idx_sender (sender_id),
  INDEX idx_created (created_at)
);

-- Messages Table (Keep for general messaging)
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  message_type ENUM('text', 'image', 'file') DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_sender (sender_id),
  INDEX idx_messages_receiver (receiver_id),
  INDEX idx_messages_created_at (created_at)
);

-- Payment Orders Table
CREATE TABLE IF NOT EXISTS payment_orders (
  payment_order_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  payment_id VARCHAR(255),
  user_id INT NOT NULL,
  campaign_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('created', 'completed', 'failed', 'refunded') DEFAULT 'created',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
  INDEX idx_payment_orders_user_id (user_id),
  INDEX idx_payment_orders_order_id (order_id),
  INDEX idx_payment_orders_status (status)
);
