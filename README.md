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
- [Payment Gateway, User Identification & ACID Architecture](#-payment-gateway-user-identification--acid-architecture)
- [Official Android APK Release & Website Download](#-official-android-apk-release--website-download)
- [Demo Test Accounts](#-demo-test-accounts)
- [Production Deployment](#-production-deployment)
- [Troubleshooting & Common Pitfalls](#-troubleshooting--common-pitfalls)
- [Web Verification & User Flow Test Log](#-web-verification--user-flow-test-log)

---

## 🏛️ Architecture Overview

The project is structured as a unified monorepo with three specialized sub-projects:

```
Fluencer/
├── fluencer_Backend/     # Node.js + Express.js + MongoDB REST API & Socket.IO
│   └── public/web/       # Production compiled React Web SPA and assets
├── Influish_Frontend/    # React Native (Expo SDK 57) iOS & Android Mobile Application
├── fluencer_web/         # Vite + React 19 + Tailwind CSS 4 Web Landing Page & Portal
└── render.yaml           # Deployment manifest for Render Cloud
```

| Component | Port / Host | Role |
| :--- | :--- | :--- |
| **`fluencer_Backend`** | `http://localhost:3000` / `https://fluencer-app.onrender.com` | REST API, MongoDB connection, Razorpay Live processing, WebSocket events, Email OTPs, Web SPA host & APK download endpoints |
| **`Influish_Frontend`** | Expo Metro (`http://localhost:8081`) | Main mobile application for Influencers and Brands (Android APK, iOS, Web) |
| **`fluencer_web`** | Vite Dev Server (`http://localhost:5173`) | Marketing website, legal policies, interactive deal simulator, direct APK download modal |

---

## 💻 Tech Stack

### Backend (`fluencer_Backend`)
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4.18
- **Database:** MongoDB Atlas via Mongoose 9.7 (with automatic reconnection fallback)
- **Real-Time Engine:** Socket.IO 4.8
- **Payment Gateway:** Razorpay SDK 2.9 (Live production integration with HMAC SHA-256 verification)
- **Authentication:** JSON Web Tokens (JWT) + bcrypt password hashing
- **File Storage:** Cloudinary + Multer + Streamifier
- **Mailing:** Nodemailer (Gmail SMTP for OTP verification)

### Mobile App (`Influish_Frontend`)
- **Framework:** React Native 0.86 + Expo SDK 57
- **Routing:** Expo Router 57 (File-based routing)
- **Styling:** NativeWind 4 (Tailwind CSS for React Native)
- **Icons & UI:** MaterialCommunityIcons (`@expo/vector-icons`), Expo Linear Gradient, React Native Reanimated
- **Payment Engine:** Official Razorpay Checkout for Web + `expo-web-browser` with strict status polling for Native Android/iOS
- **Build System:** Expo Application Services (EAS CLI) standalone APK preview build

### Marketing Web App (`fluencer_web`)
- **Framework:** React 19 + Vite 8.2
- **Styling:** Tailwind CSS 4 + Lucide React Icons
- **Distribution:** Compiled to `fluencer_Backend/public/web` for unified production deployment

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

# Razorpay Live Production Credentials
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
# - Physical Android/iOS Device on same WiFi: http://<YOUR_PC_LAN_IP>:3000
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
* Direct APK download: `http://localhost:3000/download-apk`

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
  3. Set `EXPO_PUBLIC_API_URL=https://fluencer-app.onrender.com`.
  4. Scan the QR code displayed in the terminal.

---

### 3. Run the Marketing Web App
```bash
cd fluencer_web

# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Build for production (outputs to fluencer_web/dist)
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

## 💳 Payment Gateway, User Identification & ACID Architecture

### 1. User Identification: How Does the System Recognize Who Paid?
The platform uses a 3-layer cryptographic identity model:

1. **Session Identity (JWT):** When a user logs in, their verified `userId` and role (`influencer` or `brand`) are embedded in an encrypted JWT token.
2. **Order Metadata Binding:** When `/api/payments/create-order` is called:
   - The backend creates a Razorpay order and passes immutable metadata in `notes`:
     ```json
     {
       "userId": "64f9b8c2...",
       "userType": "influencer",
       "planType": "pro_membership",
       "amount": 499
     }
     ```
   - An internal `Payment` document is saved in MongoDB with status `created`, linking the `orderId` to that exact `userId`.
3. **Cryptographic Verification (HMAC SHA-256):** When Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`:
   - The backend validates the signature using the secret key:
     ```javascript
     const expectedSignature = crypto
       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
       .update(`${orderId}|${paymentId}`)
       .digest('hex');
     ```
   - Only when `expectedSignature === razorpay_signature` does the system match the database payment record and fetch the associated `userId`.

---

### 2. ACID Transaction Guarantees & Strict Locking
To ensure financial integrity and prevent unpaid access:

```
[User Clicks Pay (₹499 Pro Pass)]
        │
        ▼
[Backend: /api/payments/create-order] ──► Creates Live Razorpay Order (notes: { userId })
        │
        ▼
[Razorpay Checkout Opens (UPI / Card / NetBanking)]
        │
        ├──► User Closes / Cancels Window 
        │         │
        │         ▼
        │    [Backend Poll: /order-status/:id] ──► Status: "created" / incomplete
        │         │
        │         ▼
        │    🔒 STRICT LOCK: Feature Remains 100% Locked (isPro = false)
        │
        └──► User Successfully Completes Payment
                  │
                  ▼
             [Verification: /verify-payment-html or Webhook]
                  │ (HMAC SHA-256 Signature Verified)
                  ▼
             [ATOMIC DATABASE UPDATE]
                  ├── 1. Payment status set to 'completed'
                  ├── 2. Audit log recorded with transaction ID
                  └── 3. User document updated: isPro = true, proActivatedAt = Date.now()
                  │
                  ▼
             🔓 UNLOCK GRANTED: Campaign feeds, full budget figures & proposals enabled
```

- **Atomicity:** The payment record status update and the user's Pro Pass activation execute together. If signature verification or database persistence fails, the user is never upgraded.
- **Consistency:** Unlocking Pro features via `/api/influencers/unlock-pass` requires a database query verifying an existing `completed` payment record of ₹499 for that user. No client-side bypass is possible.
- **Isolation:** Each transaction has a globally unique Razorpay Order ID. Concurrent payment attempts for the same user cannot result in duplicate credits or double activation.
- **Durability:** Completed payment records are permanently stored in MongoDB Atlas with cryptographic transaction proofs.

---

## 📱 Official Android APK Release & Website Download

A standalone Android release (`fluencer.apk`) has been compiled via **Expo Application Services (EAS Build)** and integrated directly into the web application.

### 📦 Build Artifact Details

| Property | Value |
| :--- | :--- |
| **App Name** | Fluencer |
| **Version** | `1.0.0` (Production) |
| **Package** | `com.fluncer.app` |
| **Build ID** | `70ecdd30-a007-4ce2-a2f7-7833c0b3426e` |
| **File Name** | `fluencer.apk` |
| **File Size** | 111.4 MB (`116,834,906` bytes) |
| **Minimum OS** | Android 8.0 (API Level 26) or higher |
| **Gateway Support** | Razorpay Live Gateway (Cards, UPI, NetBanking) |
| **Permanent EAS CDN Mirror** | [Download Fluencer APK](https://expo.dev/artifacts/eas/-3pQQTmIcKR2VEOFRI0G2VV6iqsxz6b2J5FXNSASdpM.apk) |

---

### 🌐 Direct Website Integration

Visitors to the marketing website can download the Android APK directly without leaving the page:

1. **Hero Section CTA:** A prominent glowing green button **"Download Android App (.APK)"** is featured right at the top of the homepage.
2. **Navigation Bar CTA:** The **"Get App"** button is accessible from any page header or mobile drawer.
3. **App Download Modal (`AppDownloadModal.jsx`):**
   - **Download APK Directly (Instant):** Starts the download immediately via the high-speed Expo Cloud CDN.
   - **Server Mirror:** Connects to the backend download route (`/download-apk`).
   - **Copy Link Button:** 1-click clipboard copy to easily share the download link via WhatsApp or messaging.
   - **3-Step Installation Guide:** Simple instructions explaining how to bypass Chrome's "File might be harmful" prompt and complete the installation.
4. **Backend Download Routes (`fluencer_Backend/src/app.js`):**
   - Endpoints: `['/download-apk', '/fluencer.apk', '/apk', '/download']`
   - If the local file is present on the server, it serves the file with proper `application/vnd.android.package-archive` headers.
   - If hosted on serverless or cloud platforms (e.g. Render) without large file storage, it issues a `302` redirect to the permanent Expo Cloud CDN mirror.
5. **Git Large File Protection:** `*.apk` is added to `.gitignore` across all sub-folders to ensure GitHub's 100MB file limit is never breached during code pushes.

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

### Backend & Marketing Web App on Render
- Deployed as a Web Service on Render.
- Live URL: `https://fluencer-app.onrender.com`
- Unified serving: The compiled Vite web app (`fluencer_web/dist`) is served by Express static middleware from `fluencer_Backend/public/web/`.
- Automatic health check and keep-alive configured on `/api/health`.

### Android APK Build via EAS
To generate a standalone APK build for physical testing or distribution:
```bash
cd Influish_Frontend

# Install EAS CLI globally if not already installed
npm install -g eas-cli

# Login to your Expo account
eas login

# Build standalone APK preview profile
eas build -p android --profile preview
```

---

## ❓ Troubleshooting & Common Pitfalls

1. **"Network Request Failed" on Mobile App:**
   - Cause: `Influish_Frontend/.env` has `EXPO_PUBLIC_API_URL=http://localhost:3000`. On a physical phone, `localhost` points to the phone itself.
   - Fix: Set `EXPO_PUBLIC_API_URL=https://fluencer-app.onrender.com` or your PC's local LAN IP (e.g. `http://192.168.1.15:3000`).

2. **Render Backend Takes ~30-50s to Respond on First Request:**
   - Cause: Render's free instances spin down after 15 minutes of inactivity.
   - Fix: The first ping wakes the service up; subsequent requests respond in < 150ms.

3. **MongoDB Connection Buffering Timeout:**
   - Cause: IP address is not whitelisted in MongoDB Atlas Network Access.
   - Fix: Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access.

4. **Android Chrome "File might be harmful" Warning:**
   - Cause: Standard Android security notice when sideloading APK files outside Google Play.
   - Fix: Click **"Download anyway"** ➜ Open file ➜ Select **"Install"**.

---

## 🧪 Web Verification & User Flow Test Log

A comprehensive automated browser test suite was executed across all web interfaces, portals, and payment gateways. The test session verified layout fidelity, animations, interactive state transitions, modal dialogues, administrative controls, and payment routing.

### 📊 Verification Summary Table

| Test Module / Feature | Route / Endpoint | Verified Behavior | Result |
| :--- | :--- | :--- | :---: |
| **Hero & Platform Showcase** | `http://localhost:3000/` | Dark glassmorphism, responsive navigation, live metrics (8,420+ campaigns, ₹1.4Cr+ escrow) | ✅ **PASS** |
| **Download Android App Hero CTA** | Click *"Download Android App (.APK)"* | Opens interactive download modal with direct link, CDN mirror, copy button & guide | ✅ **PASS** |
| **Direct APK Download Route** | `http://localhost:3000/download-apk` | Returns HTTP 200 attachment `fluencer.apk` (111.4 MB) with `application/vnd.android.package-archive` | ✅ **PASS** |
| **Photo Demonstration Section** | `http://localhost:3000/#photo-demo` | High-res carousel, visual creator showcases, campaign deliverables previews | ✅ **PASS** |
| **How It Works & App Preview** | `http://localhost:3000/#how-it-works` | Step-by-step workflow guide, escrow explanation, UI visual mockups | ✅ **PASS** |
| **Interactive Deal Simulator** | `http://localhost:3000/#deal-lock` | Live role switching (Brand, Influencer, Admin), dynamic escrow calculation | ✅ **PASS** |
| **Brand Ecosystem Portal** | `http://localhost:3000/for-brands` | Dedicated brand workflow, campaign creation preview, creator pitching system | ✅ **PASS** |
| **Creator Monetization Portal** | `http://localhost:3000/for-influencers` | Deal discovery, Pro Pass benefits, guaranteed milestone payouts breakdown | ✅ **PASS** |
| **Contact Support Modal** | Click *"Contact Us"* | Modal opens with Category selection (Brand / Influencer), validated form inputs | ✅ **PASS** |
| **Master Admin Login** | `http://localhost:3000/admin` | Clean administrative login screen, credentials authentication (`admin@fluencer.app`) | ✅ **PASS** |
| **Admin KPI Dashboard** | `http://localhost:3000/admin` | Real-time counters: 93 Users, 6 Deals, ₹1.40L Escrow Held, ₹1,050 Platform Fee | ✅ **PASS** |
| **Escrow Release Manager** | `http://localhost:3000/admin#escrow` | 18% Platform commission breakdown, escrow release controls for brand deals | ✅ **PASS** |
| **Active Campaigns & Users** | `http://localhost:3000/admin#campaigns` | Campaign listing table, Creator Management tab, Brand Management tab | ✅ **PASS** |
| **Razorpay Payment Checkout** | `http://localhost:3000/api/payments/...` | Live Razorpay modal triggers, UPI/Card options load, strict completion check verified | ✅ **PASS** |
| **Mobile Role Selection** | `http://localhost:8081/role-selection` | Creator vs Brand cards with responsive routing | ✅ **PASS** |
| **Mobile Creator Login** | `http://localhost:8081/login` | Email/Password login (`testinfluencer@fluncer.com`) & Skip option | ✅ **PASS** |
| **Mobile Creator Home Dashboard** | `http://localhost:8081/home` | Collab OS header, search bar, Collab Deck banner, quick action grid | ✅ **PASS** |
| **Mobile Campaigns Feed & Pro Pass** | `http://localhost:8081/campaigns` | Category filter chips & ₹499 Lifetime Pro Pass modal overlay | ✅ **PASS** |
| **Anti-Bypass Security Check** | Click *"Already Paid? Confirm & Unlock"* | Prevents unauthorized unlock, checks backend payment status | ✅ **PASS** |
| **Mobile Liked Brands Screen** | `http://localhost:8081/liked-brands` | Enforces ₹499 Pro Pass access gate for saved high-payout deals | ✅ **PASS** |
| **Mobile Real-Time Chat** | `http://localhost:8081/chat` | Socket.IO messaging hub with active conversation state | ✅ **PASS** |
| **Mobile Wallet & Escrow Funds** | `http://localhost:8081/wallet` | Available balance + Escrow locked breakdown & UPI withdraw modal | ✅ **PASS** |

---

## 📄 License
This project is proprietary and intended for Fluencer application operations.
