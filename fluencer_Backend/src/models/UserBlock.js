import mongoose from 'mongoose';

const userBlockSchema = new mongoose.Schema({
  blocker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  blocked_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Enforce unique blocker-blocked pair to prevent duplicate block entries
userBlockSchema.index({ blocker_id: 1, blocked_id: 1 }, { unique: true });

const UserBlock = mongoose.model('UserBlock', userBlockSchema);
export default UserBlock;
