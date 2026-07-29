// API Configuration
// IMPORTANT: Update BASE_URL based on your setup:
// - For physical Android device: Use your computer's local IP (check with ipconfig/ifconfig)
// - For Android Emulator: Use 'http://10.0.2.2:3000'
// - For iOS Simulator: Use 'http://localhost:3000'
// - Current IP might be outdated - check console logs if APIs fail
export const API_CONFIG = {
  // BASE_URL: 'http://15.207.108.137', 
  // BASE_URL: 'https://fluencer-backend.onrender.com',
  // BASE_URL: 'http://10.162.1.92:3000',
  // BASE_URL : 'https://fluencer-app.onrender.com',
  BASE_URL: 'http://localhost:3000',
  
  // Endpoints for utils/api.js
  endpoints: {
    signupRequest: '/api/auth/signup-request',
    verifyOTP: '/api/auth/verify-otp',
    login: '/api/auth/login',
    getCurrentUser: '/api/auth/me',
    saveProfile: '/api/influencers/profile',
    getProfile: '/api/influencers/profile',
    checkProfile: '/api/influencers/profile-exists',
  },
};

export const API = {
  AUTH: {
    SIGNUP_REQUEST: '/api/auth/signup-request',
    VERIFY_OTP: '/api/auth/verify-otp',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },
  INFLUENCERS: {
    PROFILE: '/api/influencers/profile',
    PROFILE_EXISTS: '/api/influencers/profile-exists',
    UPLOAD_IMAGE: '/api/influencers/upload-image',
    PORTFOLIO: '/api/influencers/portfolio',
  },
  BRANDS: {
    PROFILE: '/api/brands/profile',
    UPDATE_PROFILE: '/api/brands/profile',
    PROFILE_EXISTS: '/api/brands/profile-exists',
    UPLOAD_IMAGE: '/api/brands/upload-image',
    LIST: '/api/brands/all',
  },
  CAMPAIGNS: {
    CREATE: '/api/campaigns',
    MY_CAMPAIGNS: '/api/campaigns/my-campaigns',
    ALL: '/api/campaigns/all',
    ACTIVE_ALL: '/api/campaigns/active/all',
    GET_BY_ID: '/api/campaigns/:id',
    UPDATE: '/api/campaigns/:id',
    DELETE: '/api/campaigns/:id',
    APPLY: '/api/campaigns/:id/apply',
    APPLICATIONS: '/api/campaigns/:id/applications',
    ALL_APPLICATIONS: '/api/campaigns/applications/all',
    ACCEPT_APPLICATION: '/api/campaigns/applications/:id/accept',
    REJECT_APPLICATION: '/api/campaigns/applications/:id/reject',
    UPDATE_STATUS: '/api/campaigns/applications/:id/status',
  },
  CHATS: {
    LIST: '/api/chats',
    GET: '/api/chats/:chatId',
    MESSAGES: '/api/chats/:chatId/messages',
    SEND_MESSAGE: '/api/chats/:chatId/messages',
  },
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    GET_MESSAGES: '/api/messages/:otherUserId',
    SEND: '/api/messages/send',
    MARK_READ: '/api/messages/mark-read/:otherUserId',
    UNREAD_COUNT: '/api/messages/unread/count',
  },
  PAYMENTS: {
    CREATE_ORDER: '/api/payments/create-order',
    VERIFY_PAYMENT: '/api/payments/verify-payment',
    HISTORY: '/api/payments/history',
  },
  ADMIN: {
    DASHBOARD_STATS: '/api/admin/dashboard/stats',
    RECENT_CAMPAIGNS: '/api/admin/dashboard/recent-campaigns',
    RECENT_PAYMENTS: '/api/admin/dashboard/recent-payments',
    WITHDRAW_REQUESTS: '/api/admin/dashboard/withdraw-requests',
    INFLUENCERS: '/api/admin/influencers',
    INFLUENCER_BY_ID: '/api/admin/influencers/:id',
    UPDATE_INFLUENCER_STATUS: '/api/admin/influencers/:id/status',
    BRANDS: '/api/admin/brands',
    BRAND_BY_ID: '/api/admin/brands/:id',
    UPDATE_BRAND_STATUS: '/api/admin/brands/:id/status',
    PAYMENTS: '/api/admin/payments',
    PAYMENT_BY_ID: '/api/admin/payments/:id',
    PROCESS_REFUND: '/api/admin/payments/:id/refund',
    WITHDRAWALS: '/api/admin/withdrawals',
    WITHDRAWAL_BY_ID: '/api/admin/withdrawals/:id',
    APPROVE_WITHDRAWAL: '/api/admin/withdrawals/:id/approve',
    REJECT_WITHDRAWAL: '/api/admin/withdrawals/:id/reject',
  },
  BANNERS: '/api/banners',
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
