import mongoose from 'mongoose';

const brandProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  company_name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  profile_image: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const BrandProfile = mongoose.model('BrandProfile', brandProfileSchema);
export default BrandProfile;
