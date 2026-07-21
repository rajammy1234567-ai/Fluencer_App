# Influish Frontend

Mobile application for Influish - A platform connecting influencers and brands.

## Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based)
- **Styling**: NativeWind (Tailwind for React Native)
- **UI Components**: React Native core + MaterialCommunityIcons
- **Animations**: React Native Animated API
- **Gradients**: expo-linear-gradient
- **Storage**: expo-secure-store
- **Platform**: iOS & Android

## Features

### Influencer Portal
- ✅ Email & OTP Authentication
- ✅ Profile Creation (name, gender, categories, location)
- ✅ Home Screen with brand discovery
- ✅ Search & Filter brands by category
- ✅ Campaign browsing
- ✅ Notifications
- ✅ Profile management
- ✅ Settings screen
- ✅ Professional animations

### Brand Portal
- ✅ Email & OTP Authentication
- ✅ Brand Profile Setup (company name, category, address)
- ✅ Campaign Creation
- ✅ Campaign Management (view, edit, delete)
- ✅ Real-time Chat
- ✅ Application Management
- ✅ Profile & Settings

## Installation

### Prerequisites

- Node.js 16+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Backend server running (see Influish_Backend)

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd Influish_Frontend
   npm install
   ```

2. **Configure API Endpoint**
   
   Update `constants/api.js`:
   ```javascript
   export const API_CONFIG = {
     BASE_URL: 'http://your-backend-url:3000', // Change this
   };
   ```
   
   - For iOS Simulator: Use `http://localhost:3000`
   - For Android Emulator: Use `http://10.0.2.2:3000`
   - For Physical Device: Use your computer's IP (e.g., `http://192.168.1.100:3000`)

3. **Start Development Server**
   ```bash
   npx expo start
   ```

4. **Run on Device/Emulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
Influish_Frontend/
├── app/                          # File-based routing
│   ├── index.jsx                 # App entry (redirects to splash)
│   ├── splash.jsx                # Animated splash screen
│   ├── role-selection.jsx        # Choose influencer/brand
│   ├── selected-brands.jsx       # Brand selection screen
│   ├── settings.jsx              # Settings & preferences
│   ├── _layout.jsx               # Root navigation layout
│   ├── (auth)/                   # Authentication screens
│   │   ├── signup.jsx            # Email input & OTP request
│   │   ├── verify-otp.jsx        # OTP verification & password
│   │   ├── complete-profile.jsx  # Influencer profile setup
│   │   └── complete-brand-profile.jsx  # Brand profile setup
│   ├── (tabs)/                   # Influencer navigation tabs
│   │   ├── home.jsx              # Home feed
│   │   ├── search.jsx            # Search & filters
│   │   ├── campaigns.jsx         # Campaign browser
│   │   ├── notifications.jsx     # Notifications
│   │   └── profile.jsx           # User profile
│   └── (brand-tabs)/             # Brand navigation tabs
│       ├── home.jsx              # Dashboard
│       ├── create.jsx            # Create campaign
│       ├── chat.jsx              # Messages
│       ├── record.jsx            # Campaign management
│       └── profile.jsx           # Brand profile
├── components/                   # Reusable UI components
│   ├── Navbar.jsx                # Navigation bar
│   ├── BrandSwipeCard.jsx        # Swipeable brand cards
│   ├── CategorySelector.jsx     # Category filter
│   ├── FilterModal.jsx           # Advanced filters
│   ├── ImageCarousel.jsx         # Image slider
│   ├── PromoBanner.jsx           # Promotional banners
│   ├── TrendingAudio.jsx         # Trending content
│   ├── TipsTricks.jsx            # Tips section
│   ├── UnlockFeatureCard.jsx     # Premium features
│   ├── SocialProofBanner.jsx     # Social proof
│   ├── SelectedBrandsModal.jsx   # Brand selection modal
│   └── BrandFooter.jsx           # Footer component
├── constants/                    # App constants
│   ├── api.js                    # API endpoints configuration
│   ├── colors.js                 # Color palette
│   ├── fonts.js                  # Font styles
│   └── layout.js                 # Layout constants
├── data/                         # Static data
│   ├── brands.js                 # Sample brand data
│   └── categories.js             # Category list
├── utils/                        # Utility functions
│   └── storage.js                # Secure storage wrapper
├── assets/                       # Images, fonts, etc.
└── package.json                  # Dependencies

```

## Color Scheme

```javascript
COLORS = {
  primary: '#826FCC',           // Purple
  primaryLight: '#44449D',      // Light Purple
  secondary: '#E19F69',         // Gold
  accent: '#E19F69',            // Gold
  success: '#4CAF50',           // Green
  danger: '#FF6B6B',            // Red
  white: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
}
```

## Navigation Flow

```
index.jsx
  ↓
splash.jsx (2.5s animation)
  ↓
role-selection.jsx (choose role)
  ↓
signup.jsx (email + OTP request)
  ↓
verify-otp.jsx (OTP + password)
  ↓
┌─────────────────────┬─────────────────────┐
│ complete-profile    │ complete-brand      │
│ (influencer)        │ -profile (brand)    │
└──────────┬──────────┴──────────┬──────────┘
           │                     │
    ┌──────▼──────┐      ┌──────▼──────────┐
    │ (tabs)/     │      │ (brand-tabs)/   │
    │ - home      │      │ - home          │
    │ - search    │      │ - create        │
    │ - campaigns │      │ - chat          │
    │ - notify    │      │ - record        │
    │ - profile   │      │ - profile       │
    └─────────────┘      └─────────────────┘
```

## API Integration

All API calls use centralized configuration from `constants/api.js`:

```javascript
import { API, getApiUrl } from '../constants/api';
import { getAuthHeader } from '../utils/storage';

// Example: Authenticated API call
const headers = await getAuthHeader();
const response = await fetch(getApiUrl(API.CAMPAIGNS.MY_CAMPAIGNS), {
  headers,
});
```

### Available API Endpoints

See `constants/api.js` for complete list:
- `API.AUTH.*` - Authentication
- `API.INFLUENCERS.*` - Influencer profiles
- `API.BRANDS.*` - Brand profiles
- `API.CAMPAIGNS.*` - Campaigns
- `API.MESSAGES.*` - Messaging
- `API.PAYMENTS.*` - Payments

## Storage

Using `expo-secure-store` for sensitive data:

```javascript
import { saveAuth, getToken, getUserId, getRole, clearAuth } from '../utils/storage';

// Save after login
await saveAuth(token, userId, role);

// Get token
const token = await getToken();

// Get auth header
const headers = await getAuthHeader(); // Returns { Authorization: 'Bearer token' }

// Logout
await clearAuth();
```

## Animations

Professional animations using React Native Animated API:

- **Fade In**: Content appearance
- **Slide**: Screen transitions
- **Scale**: Button press feedback
- **Rotate**: Loading indicators

## Development

```bash
# Start development server
npx expo start

# Clear cache
npx expo start -c

# Run on specific platform
npx expo start --ios
npx expo start --android
```

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

## Environment-Specific Configuration

Update `constants/api.js` based on environment:

- **Development**: `http://localhost:3000`
- **Staging**: Your staging server URL
- **Production**: Your production server URL

## Troubleshooting

**"Network request failed"**
- Check backend server is running
- Verify BASE_URL in `constants/api.js`
- For Android emulator, use `10.0.2.2` instead of `localhost`

**"Cannot connect to Metro"**
- Run `npx expo start -c` to clear cache
- Check firewall/antivirus isn't blocking port 8081

**Images not loading**
- Check internet connection for remote images
- Verify image paths for local assets

**Authentication errors**
- Clear app data and re-login
- Check token expiry in backend
- Verify JWT_SECRET matches between frontend/backend

## Support

For issues or questions:
- Email: support@influish.com
- Phone: +91 1234567890
- Hours: Mon-Sat 9 AM - 6 PM IST
