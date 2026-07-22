import mongoose from 'mongoose';

const influencerProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false
  },
  categories: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: false
  },
  bio: {
    type: String,
    default: ''
  },
  profile_image: {
    type: String,
    default: null
  },
  followers_count: {
    type: Number,
    default: 0
  },
  instagram: {
    type: String,
    default: null
  },
  youtube: {
    type: String,
    default: null
  },
  twitter: {
    type: String,
    default: null
  },
  wallet_balance: {
    type: Number,
    default: 0
  },
  escrow_balance: {
    type: Number,
    default: 0
  },
  upi_id: {
    type: String,
    default: ''
  },
  bank_account_number: {
    type: String,
    default: ''
  },
  ifsc_code: {
    type: String,
    default: ''
  },
  account_holder_name: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const InfluencerProfile = mongoose.model('InfluencerProfile', influencerProfileSchema);
export default InfluencerProfile;
