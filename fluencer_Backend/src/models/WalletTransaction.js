import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user_role: {
    type: String,
    enum: ['influencer', 'brand', 'admin'],
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'escrow_lock', 'escrow_release', 'withdrawal', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'rejected'],
    default: 'completed'
  },
  description: {
    type: String,
    default: ''
  },
  reference_id: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;
