import mongoose from 'mongoose';

const iapTransactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    purchase_token: {
      type: String,
      sparse: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
    },
    product_id: {
      type: String,
      required: true,
      enum: ['fluencer_pro_lifetime'],
    },
    bundle_id: {
      type: String,
      required: true,
      default: 'com.fluencers.app',
    },
    status: {
      type: String,
      enum: ['purchased', 'restored', 'refunded', 'revoked'],
      default: 'purchased',
      index: true,
    },
    is_acknowledged: {
      type: Boolean,
      default: false,
    },
    original_purchase_date: {
      type: Date,
      default: Date.now,
    },
    raw_payload: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model('IAPTransaction', iapTransactionSchema);
