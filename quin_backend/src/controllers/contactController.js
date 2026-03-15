const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../services/firebaseService');
const { getQrById } = require('../services/qrService');
const { sendNotificationToUser } = require('../services/notificationService');

const contactRequestSchema = Joi.object({
  qr_id: Joi.string().required(),
  reason: Joi.string()
    .valid(
      'Vehicle blocking road',
      'Wrong parking',
      'Accident or damage',
      'Security alert',
      'Other'
    )
    .required(),
  message: Joi.string().max(2000).allow('', null),
  visitor_id: Joi.string().allow(null),
});

const createContactRequest = async (req, res, next) => {
  try {
    const { value, error } = contactRequestSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { qr_id: qrId, reason, message, visitor_id: visitorId } = value;

    const qrData = await getQrById(qrId);
    if (!qrData || qrData.status !== 'activated') {
      return res.status(400).json({ error: 'QR code is not activated or not found' });
    }

    const db = getDb();
    const vehicleSnap = await db.ref(`vehicles/${qrData.vehicle_id}`).once('value');
    const vehicle = vehicleSnap.val();

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const requestId = uuidv4();
    const timestamp = Date.now();

    const contactRequest = {
      request_id: requestId,
      vehicle_id: qrData.vehicle_id,
      owner_id: vehicle.owner_id,
      qr_id: qrId,
      reason,
      message: message || '',
      visitor_id: visitorId || null,
      timestamp,
      type: 'message',
    };

    await db.ref(`contact_requests/${requestId}`).set(contactRequest);

    if (vehicle.owner_id) {
      await sendNotificationToUser(
        vehicle.owner_id,
        'Someone contacted your vehicle',
        `Reason: ${reason}`,
        {
          type: 'contact_request',
          request_id: requestId,
          vehicle_id: qrData.vehicle_id,
          qr_id: qrId,
        }
      );
    }

    return res.status(201).json({
      message: 'Contact request created',
      request_id: requestId,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createContactRequest,
};

