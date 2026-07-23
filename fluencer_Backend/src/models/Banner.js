import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  image_url: {
    type: String,
    required: true
  },
  action_type: {
    type: String,
    enum: ['campaign', 'brand', 'url', 'category'],
    default: 'campaign'
  },
  target_id: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
