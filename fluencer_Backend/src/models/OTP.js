import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  otp_expiry: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    enum: ['influencer', 'brand'],
    required: true
  },
  phone: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
