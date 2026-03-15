const { getDb, getAdmin } = require('./firebaseService');

/**
 * Look up device tokens for a user in Realtime Database.
 * Expected path:
 * users/{userId}/fcm_tokens: { token1: true, token2: true, ... }
 */
const getUserDeviceTokens = async (userId) => {
  const db = getDb();
  const snapshot = await db.ref(`users/${userId}/fcm_tokens`).once('value');
  const data = snapshot.val() || {};
  return Object.keys(data);
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

