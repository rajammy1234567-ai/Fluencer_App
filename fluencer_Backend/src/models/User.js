import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false // Nullable for OAuth login
  },
  role: {
    type: String,
    enum: ['influencer', 'brand'],
    required: true
  },
  facebook_id: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  phone: {
    type: String,
    sparse: true,
    default: null
  },
  profile_picture: {
    type: String,
    default: null
  },
  is_verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const User = mongoose.model('User', userSchema);
export default User;
