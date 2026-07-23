import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign_name: {
    type: String,
    required: true
  },
  influencer_location: {
    type: String,
    default: ''
  },
  campaign_type: {
    type: String,
    enum: ['paid', 'barter'],
    required: true
  },
  content_type: {
    type: String,
    enum: ['reel', 'post', 'story'],
    required: true
  },
  number_of_seats: {
    type: Number,
    required: true
  },
  min_followers: {
    type: Number,
    default: 0
  },
  cost_per_influencer: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  reference_images: [{
    type: String
  }],
  shooting_location_guide: {
    type: String,
    default: ''
  },
  sample_reel_url: {
    type: String,
    default: ''
  },
  guidelines: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'paused'],
    default: 'open'
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  is_available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
