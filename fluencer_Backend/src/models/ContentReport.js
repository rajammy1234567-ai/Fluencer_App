import mongoose from 'mongoose';

const contentReportSchema = new mongoose.Schema({
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reported_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content_type: {
    type: String,
    enum: ['user', 'message', 'campaign', 'profile'],
    required: true
  },
  content_id: {
    type: String,
    default: null
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate_content', 'scam_fraud', 'hate_speech', 'other'],
    required: true
  },
  details: {
    type: String,
    maxlength: 1000,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
    default: 'pending',
    index: true
  },
  admin_notes: {
    type: String,
    trim: true,
    default: null
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewed_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const ContentReport = mongoose.model('ContentReport', contentReportSchema);
export default ContentReport;
