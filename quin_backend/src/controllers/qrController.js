const Joi = require('joi');
const { createQrCodesBatch, getQrById, activateQr } = require('../services/qrService');
const { getDb, getFirestore } = require('../services/firebaseService');

const generateSchema = Joi.object({
  batchSize: Joi.number().integer().min(1).max(500).default(1),
});

const activateSchema = Joi.object({
  qr_id: Joi.string().required(),
  vehicle_id: Joi.string().required(),
  user_id: Joi.string().required(),
});

const generateQrCodes = async (req, res, next) => {
  try {
    const { value, error } = generateSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { batchSize } = value;
    const result = await createQrCodesBatch(batchSize);

    return res.status(201).json({
      count: result.ids.length,
      qr_codes: result.ids.map((qrId) => ({
        qr_id: qrId,
        url: `https://quin-eight.vercel.app/v/${qrId}`,
        image_data: result.images[qrId],
      })),
    });
  } catch (err) {
    return next(err);
  }
};

const activateQrCode = async (req, res, next) => {
  try {
    const { value, error } = activateSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { qr_id: qrId, vehicle_id: vehicleId, user_id: userId } = value;
    const activated = await activateQr({ qrId, vehicleId, userId });

    return res.json({
      message: 'QR code activated successfully',
      qr_code: activated,
    });
  } catch (err) {
    return next(err);
  }
};

const getQrDetails = async (req, res, next) => {
  try {
    const { qrId } = req.params;
    if (!qrId) {
      return res.status(400).json({ error: 'qrId is required' });
    }

    const qrData = await getQrById(qrId);
    if (!qrData) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const db = getDb();
    const vehicleSnap = await db.ref(`vehicles/${qrData.vehicle_id}`).once('value');
    const vehicle = vehicleSnap.val();

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found for QR code' });
    }

    const ownerId = vehicle.owner_id || qrData.owner_id;

    const fs = getFirestore();
    let privacy = null;
    if (ownerId) {
      const privacyDoc = await fs.collection('privacy_settings').doc(ownerId).get();
      privacy = privacyDoc.exists ? privacyDoc.data() : null;
    }

    // Apply basic privacy logic: if privacy.hide_identity, do not send owner_name
    const response = {
      vehicle_number: vehicle.vehicle_number,
      owner_name: privacy && privacy.hide_identity ? null : vehicle.owner_name,
      privacy_settings: privacy || {},
    };

    return res.json(response);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  generateQrCodes,
  activateQrCode,
  getQrDetails,
};

