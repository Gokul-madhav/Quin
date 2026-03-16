const { getDb, getAdmin } = require('./firebaseService');

/**
 * Look up device tokens for a user in Realtime Database.
 * Expected path:
 * users/{userId}/fcm_tokens: { token1: true, token2: true, ... }
 * Also supports:
 * users/{userId}/fcm_tokens_list: { pushId: { token: "..." }, ... }
 */
const getUserDeviceTokens = async (userId) => {
  const db = getDb();
  const tokens = new Set();

  // Legacy format: token keys
  const legacySnap = await db.ref(`users/${userId}/fcm_tokens`).once('value');
  const legacy = legacySnap.val() || {};
  if (legacy && typeof legacy === 'object') {
    Object.keys(legacy).forEach((k) => {
      if (k && typeof k === 'string') tokens.add(k);
    });
  }

  // New format: list entries with token values
  const listSnap = await db.ref(`users/${userId}/fcm_tokens_list`).once('value');
  const list = listSnap.val() || {};
  if (list && typeof list === 'object') {
    Object.values(list).forEach((entry) => {
      if (entry && typeof entry === 'object' && typeof entry.token === 'string' && entry.token) {
        tokens.add(entry.token);
      }
    });
  }

  return Array.from(tokens);
};

const sendNotificationToUser = async (userId, title, body, data = {}) => {
  const tokens = await getUserDeviceTokens(userId);
  if (!tokens.length) {
    return { success: false, reason: 'no_tokens' };
  }

  const admin = getAdmin();

  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  return { success: true, response };
};

module.exports = {
  sendNotificationToUser,
};

