import UserBlock from '../models/UserBlock.js';

/**
 * Check if bidirectional block exists between user A and user B
 * @param {string|ObjectId} userAId
 * @param {string|ObjectId} userBId
 * @returns {Promise<boolean>}
 */
export async function isUserBlocked(userAId, userBId) {
  if (!userAId || !userBId) return false;
  if (userAId.toString() === userBId.toString()) return false;

  const count = await UserBlock.countDocuments({
    $or: [
      { blocker_id: userAId, blocked_id: userBId },
      { blocker_id: userBId, blocked_id: userAId }
    ]
  });

  return count > 0;
}

/**
 * Get detailed block status between two users
 * @param {string|ObjectId} currentUserId
 * @param {string|ObjectId} otherUserId
 * @returns {Promise<{isBlocked: boolean, blockedByMe: boolean, blockedByOther: boolean}>}
 */
export async function getBlockDetails(currentUserId, otherUserId) {
  if (!currentUserId || !otherUserId || currentUserId.toString() === otherUserId.toString()) {
    return { isBlocked: false, blockedByMe: false, blockedByOther: false };
  }

  const blocks = await UserBlock.find({
    $or: [
      { blocker_id: currentUserId, blocked_id: otherUserId },
      { blocker_id: otherUserId, blocked_id: currentUserId }
    ]
  }).lean();

  let blockedByMe = false;
  let blockedByOther = false;

  for (const b of blocks) {
    if (b.blocker_id.toString() === currentUserId.toString()) {
      blockedByMe = true;
    }
    if (b.blocker_id.toString() === otherUserId.toString()) {
      blockedByOther = true;
    }
  }

  return {
    isBlocked: blockedByMe || blockedByOther,
    blockedByMe,
    blockedByOther
  };
}

/**
 * Get all user IDs blocked by this user
 * @param {string|ObjectId} userId
 * @returns {Promise<string[]>}
 */
export async function getBlockedUserIds(userId) {
  if (!userId) return [];
  const blocks = await UserBlock.find({ blocker_id: userId }).select('blocked_id').lean();
  return blocks.map(b => b.blocked_id.toString());
}
