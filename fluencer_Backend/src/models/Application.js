import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  influencer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  submission_url: {
    type: String,
    default: null
  },
  submission_notes: {
    type: String,
    default: ''
  },
  submitted_at: {
    type: Date,
    default: null
  },
  deliverable_status: {
    type: String,
    enum: ['pending', 'submitted', 'brand_approved', 'payout_released', 'disputed'],
    default: 'pending'
  },
  escrow_amount: {
    type: Number,
    default: 0
  },
  commission_amount: {
    type: Number,
    default: 0
  },
  final_influencer_amount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Unique combination index
applicationSchema.index({ campaign_id: 1, influencer_id: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
