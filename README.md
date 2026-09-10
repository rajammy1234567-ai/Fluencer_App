# 🚀 Fluencer Platform

A comprehensive, full-stack Influencer & Brand collaboration ecosystem consisting of a **React Native Mobile App (Expo SDK 57)**, an **Express.js & MongoDB Atlas Backend**, and a **React 19 + Vite Marketing Web App**.

---

## 📑 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Environment Setup & Configuration](#-environment-setup--configuration)
- [Quick Start Guide (Development Workflow)](#-quick-start-guide-development-workflow)
- [Key Features & Business Workflows](#-key-features--business-workflows)
- [Payment Gateway & Anti-Bypass Architecture](#-payment-gateway--anti-bypass-architecture)
- [Demo Test Accounts](#-demo-test-accounts)
- [Production Deployment](#-production-deployment)
- [Troubleshooting & Common Pitfalls](#-troubleshooting--common-pitfalls)

---

## 🏛️ Architecture Overview

The project is structured as a unified monorepo with three specialized sub-projects:

```
Fluencer/
├── fluencer_Backend/     # Node.js + Express.js + MongoDB REST API & Socket.IO
├── Influish_Frontend/    # React Native (Expo SDK 57) iOS & Android Mobile Application
├── fluencer_web/         # Vite + React 19 + Tailwind CSS 4 Web Landing Page & Portal
└── render.yaml           # Deployment manifest for Render Cloud
```

| Component | Port / Host | Role |
| :--- | :--- | :--- |
| **`fluencer_Backend`** | `http://localhost:3000` / `https://fluencer-app.onrender.com` | REST API, MongoDB connection, Razorpay processing, WebSocket events, Email OTPs |
| **`Influish_Frontend`** | Expo Metro (`http://localhost:8081`) | Main mobile application for Influencers and Brands (Android APK, iOS, Web) |
| **`fluencer_web`** | Vite Dev Server (`http://localhost:5173`) | Marketing website, legal policies, interactive brand/influencer deal flow simulators |

---

## 💻 Tech Stack

### Backend (`fluencer_Backend`)
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4.18
- **Database:** MongoDB Atlas via Mongoose 9.7 (with automatic connection fallback)
- **Real-Time Engine:** Socket.IO 4.8
- **Payment Gateway:** Razorpay SDK 2.9 (Official Live production integration)
- **Authentication:** JSON Web Tokens (JWT) + bcrypt password hashing
- **File Storage:** Cloudinary + Multer + Streamifier
- **Mailing:** Nodemailer (Gmail SMTP for OTP verification)

### Mobile App (`Influish_Frontend`)
- **Framework:** React Native 0.86 + Expo SDK 57
- **Routing:** Expo Router 57 (File-based routing)
- **Styling:** NativeWind 4 (Tailwind CSS for React Native)
- **Icons & UI:** MaterialCommunityIcons (`@expo/vector-icons`), Expo Linear Gradient, React Native Reanimated
- **Payment Modal:** Official Razorpay Checkout for Web + `expo-web-browser` with strict status polling for Native Android/iOS
- **Build Tools:** EAS CLI (Expo Application Services)

### Marketing Web App (`fluencer_web`)
- **Framework:** React 19 + Vite 8.2
- **Styling:** Tailwind CSS 4 + Lucide React Icons

---

## ⚙️ Environment Setup & Configuration

### 1. Backend Configuration (`fluencer_Backend/.env`)
Create a `.env` file in `fluencer_Backend/`:

```env
PORT=3000
NODE_ENV=development

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fluencer01?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key

# Razorpay Live / Test Credentials
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Gmail SMTP for OTP Delivery
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
OTP_EXPIRY_MINUTES=5

# Facebook OAuth (Optional)
FB_APP_ID=your_fb_app_id
FB_APP_SECRET=your_fb_app_secret
FB_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
```

### 2. Frontend Configuration (`Influish_Frontend/.env`)
Create a `.env` file in `Influish_Frontend/`:

```env
# Razorpay Key ID
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx

# API URL Options:
# - Local Computer (Web/Desktop): http://localhost:3000
# - Android Emulator: http://10.0.2.2:3000
# - Physical Android/iOS Device on same WiFi: http://<YOUR_PC_LAN_IP>:3000 (e.g. http://192.168.1.15:3000)
# - Production Live Backend (Render): https://fluencer-app.onrender.com
EXPO_PUBLIC_API_URL=https://fluencer-app.onrender.com
```

---

## 🏃 Quick Start Guide (Development Workflow)

### 1. Run the Backend API Server
```bash
cd fluencer_Backend

# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Or start in standard production mode
npm start
```
* Backend health check: `http://localhost:3000/api/health`
* Admin dashboard: `http://localhost:3000/admin`

---

### 2. Run the Mobile App (Expo)
```bash
cd Influish_Frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run options from Metro CLI:
# Press 'a' -> Open on Android Emulator
# Press 'w' -> Open Web Browser version
# Press 'c' -> Clear Metro cache if needed
```

* **Testing on a Physical Mobile Phone:**
  1. Install **Expo Go** from Google Play Store or Apple App Store.
  2. Ensure your phone and PC are on the same WiFi network (or use `npx expo start --tunnel`).
  3. In `Influish_Frontend/.env`, set `EXPO_PUBLIC_API_URL=https://fluencer-app.onrender.com` (or your PC's LAN IP).
  4. Scan the QR code displayed in the terminal.

---

### 3. Run the Marketing Web App
```bash
cd fluencer_web

# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Build for production
npm run build
```

---

## 🔄 Key Features & Business Workflows

### 🎨 Creator / Influencer Journey
1. **Registration & OTP:** Register with email and verify via 6-digit OTP delivered via Gmail.
2. **Profile Setup:** Set name, niche (Fashion, Tech, Lifestyle), follower count, bio, and social handles.
3. **Pro Membership Pass (₹499):**
   - Unlock unlimited access to explore and apply to all brand campaigns.
   - Pay securely via Razorpay (UPI / Cards / NetBanking).
   - Guaranteed anti-bypass security: Pro features remain strictly locked if payment is cancelled.
4. **Campaign Discovery:** Browse active campaigns, filter by category/budget, and apply with custom proposals.
5. **Real-time Messaging:** Chat directly with brands once applications are reviewed.

### 🏢 Brand / Business Journey
1. **Onboarding:** Register company profile, logo, business categories, and address.
2. **Campaign Creation:** Launch campaigns with specific budgets, requirements, platform deliverables (Instagram Reels, YouTube shorts, etc.).
3. **Wallet & Escrow Deposits:** Deposit budget into wallet via Razorpay to fund campaign payouts.
4. **Application Management:** Review influencer proposals, accept or reject candidates, and initiate direct chats.
5. **Deal Completion & Payout:** Release escrow funds upon milestone completion.

---

## 💳 Payment Gateway & Anti-Bypass Architecture

The platform integrates **Razorpay Live Production Mode** with complete anti-tamper security:

```
[User Clicks Pay] 
       │
       ▼
[Backend: /api/payments/create-order] ──> Creates Razorpay Order on Live Servers
       │
       ▼
[Mobile WebBrowser / Web Modal Opens Checkout]
       │
       ├──► User Cancels / Closes Window 
       │         │
       │         ▼
       │    [Backend Poll: /order-status/:id] ──► Status: "created" / incomplete
       │         │
       │         ▼
       │    ❌ Access Denied: Features Remain Strictly Locked
       │
       └──► User Completes UPI/Card Payment
                 │
                 ▼
            [Razorpay Webhook/Verification: /verify-payment-html]
                 │ (HMAC SHA-256 Signature Verified)
                 ▼
            [Payment Marked 'completed' in MongoDB]
                 │
                 ▼
            ✅ Access Granted: Influencer Pro Pass or Brand Wallet Automatically Updated
```

### Security Highlights:
- **No Mock Unlock:** Closing the payment browser window without payment will never trigger feature unlock.
- **Backend Enforced `/unlock-pass`:** Calling `/api/influencers/unlock-pass` requires a verified, completed payment of ₹499 in the database.
- **Webhook & HMAC Signature:** Every transaction is cryptographically verified against the Razorpay API secret.

---

## 🔐 Demo Test Accounts

Pre-configured test accounts are ready for development, demos, or Play Store reviewers:

| Account Type | Email | Password | Status |
| :--- | :--- | :--- | :--- |
| **Influencer (Creator)** | `testinfluencer@fluncer.com` | `Test@123` | Pre-verified, Pro Member |
| **Brand (Business)** | `testbrand@fluncer.com` | `Test@123` | Pre-verified, Active Wallet |

*To reset or re-seed default accounts at any time:*
```bash
cd fluencer_Backend
npm run seed-defaults
```

---

## 🚀 Production Deployment

### Backend on Render
- Deployed as a Web Service on Render.
- Live URL: `https://fluencer-app.onrender.com`
- Connected to MongoDB Atlas cluster with automatic reconnection.
- Automatic wake-up configured on `/api/health`.

### Android APK Build via EAS
To generate a standalone APK build for physical testing or distribution:
```bash
cd Influish_Frontend

# Install EAS CLI globally if not already installed
npm install -g eas-cli

# Login to your Expo account
eas login

# Build preview standalone APK
eas build -p android --profile preview
```

---

## ❓ Troubleshooting & Common Pitfalls

1. **"Network Request Failed" on Mobile App:**
   - Cause: `Influish_Frontend/.env` has `EXPO_PUBLIC_API_URL=http://localhost:3000`. On a mobile device, `localhost` points to the phone itself.
   - Fix: Set `EXPO_PUBLIC_API_URL=https://fluencer-app.onrender.com` or your PC's local LAN IP (e.g. `http://192.168.1.15:3000`).

2. **Render Backend Takes ~30-50s to Respond on First Request:**
   - Cause: Render's free instances spin down after inactivity.
   - Fix: The first ping wakes it up, subsequent requests will be fast.

3. **MongoDB Connection Buffering Timeout:**
   - Cause: IP address is not whitelisted in MongoDB Atlas Network Access.
   - Fix: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access.

---

## 🧪 Web Verification & User Flow Test Log

A comprehensive automated browser test suite was executed across all web interfaces, portals, and payment gateways. The test session verified layout fidelity, animations, interactive state transitions, modal dialogues, administrative controls, and payment routing.

### 📊 Verification Summary Table

| Test Module / Feature | Route / Endpoint | Verified Behavior | Result |
| :--- | :--- | :--- | :---: |
| **Hero & Platform Showcase** | `http://localhost:3000/` | Dark glassmorphism, responsive navigation, live metrics (8,420+ campaigns, ₹1.4Cr+ escrow) | ✅ **PASS** |
| **Photo Demonstration Section** | `http://localhost:3000/#photo-demo` | High-res carousel, visual creator showcases, campaign deliverables previews | ✅ **PASS** |
| **How It Works & App Preview** | `http://localhost:3000/#how-it-works` | Step-by-step workflow guide, escrow explanation, UI visual mockups | ✅ **PASS** |
| **Interactive Deal Simulator** | `http://localhost:3000/#deal-lock` | Live role switching (Brand, Influencer, Admin), dynamic escrow calculation | ✅ **PASS** |
| **Brand Ecosystem Portal** | `http://localhost:3000/for-brands` | Dedicated brand workflow, campaign creation preview, creator pitching system | ✅ **PASS** |
| **Creator Monetization Portal** | `http://localhost:3000/for-influencers` | Deal discovery, Pro Pass benefits, guaranteed milestone payouts breakdown | ✅ **PASS** |
| **Contact Support Modal** | Click *"Contact Us"* | Modal opens with Category selection (Brand / Influencer), validated form inputs | ✅ **PASS** |
| **App Download Modal** | Click *"Get App"* | Modal opens with direct access to `Fluencer-v1.0.0.apk` & Expo EAS instructions | ✅ **PASS** |
| **Master Admin Login** | `http://localhost:3000/admin` | Clean administrative login screen, credentials authentication (`admin@fluencer.app`) | ✅ **PASS** |
| **Admin KPI Dashboard** | `http://localhost:3000/admin` | Real-time counters: 93 Users, 6 Deals, ₹1.40L Escrow Held, ₹1,050 Platform Fee | ✅ **PASS** |
| **Escrow Release Manager** | `http://localhost:3000/admin#escrow` | 18% Platform commission breakdown, escrow release controls for brand deals | ✅ **PASS** |
| **Active Campaigns & Users** | `http://localhost:3000/admin#campaigns` | Campaign listing table, Creator Management tab, Brand Management tab | ✅ **PASS** |
| **Razorpay Payment Checkout** | `http://localhost:3000/api/payments/...` | Live Razorpay modal triggers, UPI/Card options load, strict completion check verified | ✅ **PASS** |
| **Expo Mobile App (Web View)** | `http://localhost:8081` | Metro bundler compiled React Native components with zero runtime exceptions | ✅ **PASS** |

---

## 📄 License
This project is proprietary and intended for Fluencer application operations.
