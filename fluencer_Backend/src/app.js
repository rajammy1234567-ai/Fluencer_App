import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import facebookRoutes from './routes/facebook.js';
import influencerRoutes from './routes/influencers.js';
import brandRoutes from './routes/brands.js';
import campaignRoutes from './routes/campaigns_complete.js';
import chatRoutes from './routes/chats.js';
import messageRoutes from './routes/messages.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import debugRoutes from './routes/debug.js';
import notificationRoutes from './routes/notifications.js';
import walletRoutes from './routes/wallet.js';
import bannerRoutes from './routes/banners.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CRITICAL: Enhanced CORS for production
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { getAdminPageContent } from './adminHtml.js';

// Serve Web Admin Dashboard HTML
app.get(['/admin', '/admin/'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  return res.status(200).send(getAdminPageContent());
});

// CRITICAL: Ensure API responses are JSON by default
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', facebookRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/banners', bannerRoutes);

// CRITICAL: Root health check - MUST return JSON
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    status: 'running', 
    message: 'Influish Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// CRITICAL: API 404 handler - catches ALL /api/* routes not found
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `API endpoint not found: ${req.originalUrl}`,
    availableRoutes: [
      '/api/auth',
      '/api/influencers',
      '/api/brands',
      '/api/campaigns',
      '/api/chats',
      '/api/messages',
      '/api/payments',
      '/api/admin',
      '/api/notifications'
    ]
  });
});

// CRITICAL: General 404 handler for non-API routes
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// CRITICAL: Global error handler - MUST be last
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);
  
  // Prevent sending response if headers already sent
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || err.statusCode || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.toString()
    })
  });
});

export default app;