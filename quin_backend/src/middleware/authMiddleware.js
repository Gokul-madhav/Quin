const { getAdmin } = require('../services/firebaseService');

/**
 * Verify Firebase ID token from Authorization: Bearer <token>
 * and attach req.user = { uid, ...decoded }.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');

    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization token' });
    }

    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      ...decoded,
    };

    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

