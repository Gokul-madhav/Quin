const Joi = require('joi');
const { getDb, getAdmin } = require('../services/firebaseService');

const registerSchema = Joi.object({
  uid: Joi.string().required(),
  name: Joi.string().max(255).required(),
  phone: Joi.string().max(30).required(),
});

const loginSchema = Joi.object({
  uid: Joi.string().required(),
});

/**
 * These endpoints assume the client already performed Firebase Auth
 * on the frontend and is providing the Firebase UID. In a more complete
 * setup, you'd verify ID tokens instead of raw UIDs here.
 */

const register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { uid, name, phone } = value;
    const db = getDb();
    const admin = getAdmin();

    // Update Firebase Auth display name (and optionally phone)
    await admin.auth().updateUser(uid, {
      displayName: name,
    });

    // Store user profile in Realtime Database
    await db.ref(`users/${uid}`).update({
      name,
      phone_last4: phone.slice(-4), // store only last4 for privacy
      created_at: Date.now(),
    });

    return res.status(201).json({
      message: 'User registered',
      uid,
      name,
    });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { uid } = value;
    const db = getDb();

    const snap = await db.ref(`users/${uid}`).once('value');
    const user = snap.val();
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    return res.json({
      message: 'Login ok',
      uid,
      profile: user,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
};

