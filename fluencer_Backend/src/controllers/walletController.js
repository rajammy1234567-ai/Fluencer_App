import BrandProfile from '../models/BrandProfile.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Withdrawal from '../models/Withdrawal.js';

// 1. Get Wallet Balance & Payout Details
export const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const role = req.user.role;

    let profile;
    if (role === 'brand' || role === 'business') {
      profile = await BrandProfile.findOne({ user_id: userId }).lean();
    } else {
      profile = await InfluencerProfile.findOne({ user_id: userId }).lean();
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({
      success: true,
      data: {
        role: role,
        wallet_balance: profile.wallet_balance || 0,
        escrow_balance: profile.escrow_balance || 0,
        upi_id: profile.upi_id || '',
        bank_account_number: profile.bank_account_number || '',
        ifsc_code: profile.ifsc_code || '',
        account_holder_name: profile.account_holder_name || ''
      }
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Deposit Money (Includes Test Mode Simulate Top-Up)
export const depositMoney = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const role = req.user.role;
    const { amount, is_simulation, payment_id } = req.body;

    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
    }

    let profile;
    if (role === 'brand' || role === 'business') {
      profile = await BrandProfile.findOne({ user_id: userId });
    } else {
      profile = await InfluencerProfile.findOne({ user_id: userId });
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Add to wallet balance
    profile.wallet_balance = (profile.wallet_balance || 0) + depositAmount;
    await profile.save();

    // Create transaction log
    await WalletTransaction.create({
      user_id: userId,
      user_role: role,
      type: 'deposit',
      amount: depositAmount,
      status: 'completed',
      description: is_simulation ? 'Test Wallet Top-Up (Simulation)' : 'Wallet Top-Up via Payment Gateway',
      reference_id: payment_id || `SIM_${Date.now()}`
    });

    res.json({
      success: true,
      message: `Successfully credited ₹${depositAmount} to your wallet!`,
      wallet_balance: profile.wallet_balance
    });
  } catch (error) {
    console.error('Error depositing to wallet:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Update Payout Bank / UPI Details
export const updateBankDetails = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { upi_id, bank_account_number, ifsc_code, account_holder_name } = req.body;

    const profile = await InfluencerProfile.findOne({ user_id: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Influencer profile not found' });
    }

    profile.upi_id = upi_id || profile.upi_id;
    profile.bank_account_number = bank_account_number || profile.bank_account_number;
    profile.ifsc_code = ifsc_code || profile.ifsc_code;
    profile.account_holder_name = account_holder_name || profile.account_holder_name;

    await profile.save();

    res.json({
      success: true,
      message: 'Payout bank details updated successfully',
      data: {
        upi_id: profile.upi_id,
        bank_account_number: profile.bank_account_number,
        ifsc_code: profile.ifsc_code,
        account_holder_name: profile.account_holder_name
      }
    });
  } catch (error) {
    console.error('Error updating bank details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Request Withdrawal (Brand Refund / Influencer Payout)
export const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const role = req.user.role;
    const { amount, payout_method, upi_id } = req.body;

    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }

    let profile;
    if (role === 'brand' || role === 'business') {
      profile = await BrandProfile.findOne({ user_id: userId });
    } else {
      profile = await InfluencerProfile.findOne({ user_id: userId });
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Deduct balance from wallet
    if (profile.wallet_balance >= withdrawAmount) {
      profile.wallet_balance -= withdrawAmount;
    } else {
      profile.wallet_balance = 0;
    }
    await profile.save();

    // Create Withdrawal record for Admin processing
    const withdrawal = await Withdrawal.create({
      user_id: userId,
      influencer_id: userId,
      user_role: role,
      amount: withdrawAmount,
      bank_details: {
        method: payout_method || 'UPI',
        upi_id: upi_id || profile.upi_id || 'user@upi',
        account_number: profile.bank_account_number,
        ifsc: profile.ifsc_code,
        holder_name: profile.account_holder_name || profile.company_name || profile.name
      },
      status: 'pending'
    });

    // Create transaction record
    await WalletTransaction.create({
      user_id: userId,
      user_role: role,
      type: 'withdrawal',
      amount: withdrawAmount,
      status: 'pending',
      description: `UPI Withdrawal Request to ${upi_id || 'UPI'}`,
      reference_id: withdrawal._id.toString()
    });

    res.json({
      success: true,
      message: `Withdrawal request for ₹${withdrawAmount} submitted successfully! Admin will process transfer to ${upi_id || 'UPI'}.`,
      withdrawal_id: withdrawal._id,
      wallet_balance: profile.wallet_balance
    });
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Transaction Statement History
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const transactions = await WalletTransaction.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      count: transactions.length,
      data: transactions.map(t => ({
        ...t,
        id: t._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
