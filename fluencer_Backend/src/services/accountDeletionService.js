import User from '../models/User.js';
import InfluencerProfile from '../models/InfluencerProfile.js';
import BrandProfile from '../models/BrandProfile.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import Payment from '../models/Payment.js';
import OTP from '../models/OTP.js';
import ChatMessage from '../models/ChatMessage.js';
import Message from '../models/Message.js';

/**
 * Unified Account Deletion & Data Cascade Service
 * Used identically by both In-App Deletion and Verified External Web Deletion.
 *
 * @param {string|ObjectId} userId
 * @param {string} reason
 * @returns {Promise<{success: boolean, message: string, deletedUser?: string}>}
 */
export async function executeCompleteAccountDeletion(userId, reason = 'User requested') {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User account not found' };
    }

    const email = user.email;
    console.log(`🗑️ Executing unified cascade deletion for user [${userId}] (${email}), Reason: ${reason}`);

    // 1. Delete associated role profile
    if (user.role === 'influencer') {
      await InfluencerProfile.deleteMany({
        $or: [{ user_id: user._id }, { user_id: user._id.toString() }]
      });
      console.log('  ✅ Influencer profile removed');
    } else if (user.role === 'brand') {
      await BrandProfile.deleteMany({
        $or: [{ user_id: user._id }, { user_id: user._id.toString() }]
      });
      console.log('  ✅ Brand profile removed');
    }

    // 2. Cascade cleanup of personal collaboration applications
    // Draft/Pending applications are purged; accepted/escrow contracts are anonymized
    const delApps = await Application.deleteMany({ influencer_id: user._id, status: { $in: ['pending', 'draft'] } });
    const anonApps = await Application.updateMany(
      { influencer_id: user._id },
      { $set: { message: '[Proposal redacted upon account deletion]', submission_notes: '[Redacted upon account deletion]' } }
    );
    console.log(`  ✅ Applications cleaned (Purged: ${delApps.deletedCount}, Anonymized: ${anonApps.modifiedCount})`);

    // 3. Purge personal notifications directed to or created by this user
    const delNotifs = await Notification.deleteMany({
      $or: [
        { target_id: user._id },
        { target_id: user._id.toString() },
        { user_id: user._id },
        { created_by: user._id }
      ]
    });
    console.log(`  ✅ Notifications purged: ${delNotifs.deletedCount}`);

    // 4. Anonymize chat messages sent by this user
    await ChatMessage.updateMany(
      { sender_id: user._id },
      { $set: { message: '[Message redacted upon account deletion]' } }
    );
    await Message.updateMany(
      { sender_id: user._id },
      { $set: { message: '[Message redacted upon account deletion]' } }
    );
    console.log('  ✅ Chat and direct messages anonymized');

    // 5. Statutory financial record anonymization
    // Transactions (order_id, payment_id, amount) are retained for Indian statutory tax audits (Section 44AA),
    // but customer association is redacted.
    await Payment.updateMany(
      { $or: [{ user_id: user._id }, { user_id: user._id.toString() }, { userId: user._id }, { userId: user._id.toString() }] },
      { $set: { description: '[Financial record retained for statutory tax compliance; customer reference redacted]' } }
    );
    console.log('  ✅ Payment tax records anonymized');

    // 6. Clean up temporary OTP records
    await OTP.deleteMany({ email: user.email });
    console.log('  ✅ OTP records purged');

    // 7. Permanently purge primary user credential
    await User.findByIdAndDelete(userId);
    console.log(`  ✅ User credential purged permanently: ${email}`);

    return {
      success: true,
      message: 'Account and associated personal data deleted successfully.',
      deletedUser: email
    };
  } catch (error) {
    console.error('❌ Error executing complete account deletion:', error);
    return {
      success: false,
      message: 'Internal error during cascade deletion: ' + error.message
    };
  }
}
