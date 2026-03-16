const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../services/firebaseService');
const { getQrById } = require('../services/qrService');
const { sendNotificationToUser } = require('../services/notificationService');
const { generateChannelName, generateToken, CALL_DURATION_SECONDS } = require('../services/agoraService');

const startCallSchema = Joi.object({
  qr_id: Joi.string().required(),
  reason: Joi.string().max(200).allow('', null),
  visitor_id: Joi.string().allow(null),
});

const updateSessionSchema = Joi.object({
  session_id: Joi.string().required(),
});

const getCallSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const db = getDb();
    const snap = await db.ref(`call_sessions/${sessionId}`).once('value');
    const session = snap.val();
    if (!session) return res.status(404).json({ error: 'Call session not found' });

    return res.json({ session });
  } catch (err) {
    return next(err);
  }
};

const acceptCall = async (req, res, next) => {
  try {
    const { value, error } = updateSessionSchema.validate(req.body || {});
    if (error) return res.status(400).json({ error: error.message });

    const { session_id: sessionId } = value;
    const db = getDb();
    const ref = db.ref(`call_sessions/${sessionId}`);
    const snap = await ref.once('value');
    const current = snap.val();
    if (!current) return res.status(404).json({ error: 'Call session not found' });

    if (current.status === 'ended' || current.status === 'declined' || current.status === 'timeout') {
      return res.status(400).json({ error: `Call already ${current.status}` });
    }

    await ref.update({ status: 'accepted' });
    return res.json({ message: 'Call accepted' });
  } catch (err) {
    return next(err);
  }
};

const declineCall = async (req, res, next) => {
  try {
    const { value, error } = updateSessionSchema.validate(req.body || {});
    if (error) return res.status(400).json({ error: error.message });

    const { session_id: sessionId } = value;
    const db = getDb();
    const ref = db.ref(`call_sessions/${sessionId}`);
    const snap = await ref.once('value');
    const current = snap.val();
    if (!current) return res.status(404).json({ error: 'Call session not found' });

    if (current.status === 'ended' || current.status === 'timeout') {
      return res.status(400).json({ error: `Call already ${current.status}` });
    }

    await ref.update({ status: 'declined', end_time: Date.now() });
    return res.json({ message: 'Call declined' });
  } catch (err) {
    return next(err);
  }
};

const endCall = async (req, res, next) => {
  try {
    const { value, error } = updateSessionSchema.validate(req.body || {});
    if (error) return res.status(400).json({ error: error.message });

    const { session_id: sessionId } = value;
    const db = getDb();
    const ref = db.ref(`call_sessions/${sessionId}`);
    const snap = await ref.once('value');
    const current = snap.val();
    if (!current) return res.status(404).json({ error: 'Call session not found' });

    if (current.status === 'ended') {
      return res.json({ message: 'Call already ended' });
    }

    await ref.update({ status: 'ended', end_time: Date.now() });
    return res.json({ message: 'Call ended' });
  } catch (err) {
    return next(err);
  }
};

const startCall = async (req, res, next) => {
  try {
    const { value, error } = startCallSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { qr_id: qrId, reason, visitor_id: visitorId } = value;

    const qrData = await getQrById(qrId);
    if (!qrData) {
      return res.status(400).json({ error: 'QR code is not activated or not found' });
    }

    const db = getDb();
    const vehicleSnap = await db.ref(`vehicles/${qrData.vehicle_id}`).once('value');
    const vehicle = vehicleSnap.val();

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const channelName = generateChannelName(qrId, qrData.vehicle_id);
    const visitorCreds = generateToken({ channelName });
    const ownerCreds = generateToken({ channelName });

    const sessionId = uuidv4();
    const now = Date.now();
    const endTime = now + CALL_DURATION_SECONDS * 1000;

    const session = {
      session_id: sessionId,
      vehicle_id: qrData.vehicle_id,
      owner_id: vehicle.owner_id,
      visitor_id: visitorId || null,
      qr_id: qrId,
      reason: reason || '',
      start_time: now,
      end_time: null,
      status: 'active',
      channel_name: channelName,
    };

    await db.ref(`call_sessions/${sessionId}`).set(session);

    // Proactively notify the vehicle owner so their app can "ring"
    if (vehicle.owner_id) {
      try {
        await sendNotificationToUser(
          vehicle.owner_id,
          'Incoming Quin call',
          `Reason: ${reason || 'Not specified'}`,
          {
            type: 'call',
            session_id: sessionId,
            channel_name: channelName,
            qr_id: qrId,
            vehicle_number: String(vehicle.vehicle_number || ''),
            reason: String(reason || ''),
            agora_token: ownerCreds.token,
            agora_app_id: ownerCreds.appId,
            agora_uid: String(ownerCreds.uid),
          }
        );
      } catch (notifyErr) {
        // eslint-disable-next-line no-console
        console.error('Failed to send call notification', notifyErr);
      }
    }

    // Schedule timeout update; in a true serverless/cron setup this might be
    // handled by a background worker or scheduled job.
    setTimeout(async () => {
      try {
        const snap = await db.ref(`call_sessions/${sessionId}`).once('value');
        const current = snap.val();
        if (current && current.status === 'active') {
          await db.ref(`call_sessions/${sessionId}`).update({
            status: 'timeout',
            end_time: endTime,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to mark call timeout', e);
      }
    }, CALL_DURATION_SECONDS * 1000);

    return res.status(201).json({
      session_id: sessionId,
      channel_name: channelName,
      agora_token: visitorCreds.token,
      agora_app_id: visitorCreds.appId,
      agora_uid: visitorCreds.uid,
      expires_at: visitorCreds.expiresAt,
      max_duration_seconds: CALL_DURATION_SECONDS,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  startCall,
  getCallSession,
  acceptCall,
  declineCall,
  endCall,
};

