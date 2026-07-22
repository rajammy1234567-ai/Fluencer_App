import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getWalletBalance,
  depositMoney,
  updateBankDetails,
  requestWithdrawal,
  getTransactionHistory
} from '../controllers/walletController.js';

const router = express.Router();

router.get('/balance', authenticateToken, getWalletBalance);
router.post('/deposit', authenticateToken, depositMoney);
router.post('/update-bank-details', authenticateToken, updateBankDetails);
router.post('/withdraw-request', authenticateToken, requestWithdrawal);
router.get('/transactions', authenticateToken, getTransactionHistory);

export default router;
