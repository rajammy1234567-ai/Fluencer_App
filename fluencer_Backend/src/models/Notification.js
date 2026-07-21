import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  target_type: {
    type: String,
    enum: ['all', 'all_brands', 'all_influencers', 'brand', 'influencer'],
    default: 'all'
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  is_read: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Admin user id who sent it
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
