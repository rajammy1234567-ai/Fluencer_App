# Default Test Accounts

This document contains the default login credentials for testing the Fluncer application.

## 🔐 Login Credentials

### Influencer Account
- **Email:** `testinfluencer@fluncer.com`
- **Password:** `Test@123`
- **Profile Details:**
  - Name: Demo Influencer
  - Gender: Male
  - Categories: Fashion, Lifestyle, Technology
  - Location: Mumbai, Maharashtra
  - Followers: 15,000
  - Bio: Professional content creator and influencer

### Brand Account
- **Email:** `testbrand@fluncer.com`
- **Password:** `Test@123`
- **Profile Details:**
  - Company: Demo Brand Company
  - Category: Fashion & Apparel
  - Location: Mumbai, Maharashtra
  - Website: https://demobrand.com
  - Description: Leading fashion and lifestyle brand

## 📝 Usage

These accounts are pre-configured with complete profile data and can be used for:
- **App Testing** - Test all features without creating new accounts
- **Play Store Review** - Provide to reviewers for app evaluation
- **Demo Purposes** - Show potential clients/investors app functionality
- **Development** - Quick login during development and debugging

## 🔄 Re-creating Default Accounts

If you need to recreate these accounts or reset their passwords, run:

```bash
npm run seed-defaults
```

Or manually:

```bash
node seed-default-users.js
```

## ⚠️ Important Notes

1. **Production Warning:** These are demo accounts. In production, consider:
   - Using stronger, randomized passwords
   - Limiting access to these accounts
   - Monitoring usage for security

2. **Profile Data:** All profile information is pre-filled, so these accounts can immediately:
   - Influencers: Browse campaigns, apply to campaigns, chat with brands
   - Brands: Create campaigns, view influencer applications, chat with influencers

3. **Password Reset:** You can reset passwords through the forgot-password flow, but they will receive the OTP at these email addresses (which may not be real). Use the seed script to reset if needed.

## 🛠️ Customization

To modify default account details, edit the `seed-default-users.js` file and update:
- Email addresses
- Passwords (will be automatically hashed)
- Profile information (name, bio, categories, etc.)

Then run the seed command again to apply changes.
