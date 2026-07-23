/**
 * Admin Routes
 * All admin panel endpoints
 * Handles dashboard stats, user management, payments, withdrawals, disputes
 */

import express from 'express';
import {
  getDashboardStats,
  getRecentCampaigns,
  getRecentPayments,
  getWithdrawRequests,
  getPendingEscrows,
  releaseEscrowPayout,
  deleteAdminCampaign,
  triggerSystemTest,
} from '../controllers/adminController.js';

import {
  getAllInfluencers,
  getInfluencerById,
  updateInfluencerStatus,
} from '../controllers/influencerAdminController.js';

import {
  getAllBrands,
  getBrandById,
  updateBrandStatus,
} from '../controllers/brandAdminController.js';

import {
  getAllPayments,
  getPaymentById,
  processRefund,
} from '../controllers/paymentAdminController.js';

import {
  getAllWithdrawals,
  getWithdrawalById,
  approveWithdrawal,
  rejectWithdrawal,
} from '../controllers/withdrawalAdminController.js';

import {
  getAllChats,
  getChatDetails,
  getChatStats,
  toggleChatStatus,
  searchMessages,
} from '../controllers/chatAdminController.js';

const router = express.Router();

// Dashboard Routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-campaigns', getRecentCampaigns);
router.get('/dashboard/recent-payments', getRecentPayments);
router.get('/dashboard/withdraw-requests', getWithdrawRequests);
router.delete('/campaigns/:id', deleteAdminCampaign);
router.post('/trigger-test-flow', triggerSystemTest);

// Influencer Management Routes
router.get('/influencers', getAllInfluencers);
router.get('/influencers/:id', getInfluencerById);
router.put('/influencers/:id/status', updateInfluencerStatus);

// Brand Management Routes
router.get('/brands', getAllBrands);
router.get('/brands/:id', getBrandById);
router.put('/brands/:id/status', updateBrandStatus);

// Payment Management Routes
router.get('/payments', getAllPayments);
router.get('/payments/:id', getPaymentById);
router.post('/payments/:id/refund', processRefund);

// Withdrawal Management Routes
router.get('/withdrawals', getAllWithdrawals);
router.get('/withdrawals/:id', getWithdrawalById);
router.post('/withdrawals/:id/approve', approveWithdrawal);
router.post('/withdrawals/:id/reject', rejectWithdrawal);

// Chat Management Routes
router.get('/chats/stats', getChatStats);
router.get('/chats/search', searchMessages);
router.get('/chats', getAllChats);
router.get('/chats/:chatId', getChatDetails);
// Escrow Management Routes
router.get('/escrow/pending', getPendingEscrows);
router.post('/escrow/release/:applicationId', releaseEscrowPayout);

export default router;
