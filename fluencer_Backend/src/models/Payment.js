import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true
  },
  payment_id: {
    type: String,
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'completed', 'failed', 'refunded'],
    default: 'created'
  },
  description: {
    type: String,
    default: ''
  },
  completed_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
