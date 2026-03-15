const QRCode = require('qrcode');
const { getDb } = require('./firebaseService');

const QR_PREFIX = 'QN';
const QR_PAD_LENGTH = 6;
const QR_BASE_URL = 'https://quin.app/v';

const getNextQrIds = async (batchSize) => {
  const db = getDb();
  const counterRef = db.ref('meta/qr_counter');

  const { ids } = await counterRef.transaction((current) => {
    const start = (current || 0) + 1;
    const end = start + batchSize - 1;
    const updated = end;

    const generatedIds = [];
    for (let i = start; i <= end; i += 1) {
      const padded = String(i).padStart(QR_PAD_LENGTH, '0');
      generatedIds.push(`${QR_PREFIX}${padded}`);
    }

    // Store ids in a side-channel for transaction completion
    counterRef.generatedIds = generatedIds;
    return updated;
  });

  // Fallback: if transaction result didn't include side-channel, recompute
  if (!ids) {
    throw new Error('Failed to allocate QR IDs');
  }

  return ids;
};

const allocateQrIds = async (batchSize) => {
  const db = getDb();
  const counterRef = db.ref('meta/qr_counter');

  const result = await counterRef.transaction((current) => {
    const start = (current || 0) + 1;
    const end = start + batchSize - 1;
    const updated = end;

    const generatedIds = [];
    for (let i = start; i <= end; i += 1) {
      const padded = String(i).padStart(QR_PAD_LENGTH, '0');
      generatedIds.push(`${QR_PREFIX}${padded}`);
    }

    return {
      value: updated,
      ids: generatedIds,
    };
  });

  if (!result.committed || !result.snapshot || !result.snapshot.val()) {
    throw new Error('Failed to allocate QR IDs');
  }

  const value = result.snapshot.val();
  return value.ids;
};

const createQrCodesBatch = async (batchSize) => {
  const db = getDb();
  const ids = await allocateQrIds(batchSize);

  const updates = {};
  const qrEntries = [];

  const now = Date.now();
  ids.forEach((qrId) => {
    const qrUrl = `${QR_BASE_URL}/${qrId}`;
    const refPath = `qr_codes/${qrId}`;
    updates[refPath] = {
      qr_id: qrId,
      status: 'unused',
      vehicle_id: null,
      created_at: now,
    };
    qrEntries.push({ qrId, qrUrl });
  });

  await db.ref().update(updates);

  // Generate QR PNG data URLs
  const images = {};
  // Sequential generation to limit memory usage; acceptable for small batches
  // For larger batches, consider streaming or background processing.
  // eslint-disable-next-line no-restricted-syntax
  for (const { qrId, qrUrl } of qrEntries) {
    // eslint-disable-next-line no-await-in-loop
    const pngDataUrl = await QRCode.toDataURL(qrUrl, {
      type: 'image/png',
      errorCorrectionLevel: 'M',
      margin: 1,
    });
    images[qrId] = pngDataUrl;
  }

  return {
    ids,
    images,
  };
};

const getQrById = async (qrId) => {
  const db = getDb();
  const snapshot = await db.ref(`qr_codes/${qrId}`).once('value');
  return snapshot.val();
};

const activateQr = async ({ qrId, vehicleId, userId }) => {
  const db = getDb();

  const qrRef = db.ref(`qr_codes/${qrId}`);
  const snapshot = await qrRef.once('value');
  const qrData = snapshot.val();

  if (!qrData) {
    const error = new Error('QR code not found');
    error.status = 404;
    throw error;
  }

  if (qrData.status !== 'unused') {
    const error = new Error('QR code is not unused');
    error.status = 400;
    throw error;
  }

  const updates = {
    status: 'activated',
    vehicle_id: vehicleId,
    owner_id: userId,
    activated_at: Date.now(),
  };

  await qrRef.update(updates);

  return { ...qrData, ...updates };
};

module.exports = {
  createQrCodesBatch,
  getQrById,
  activateQr,
  QR_BASE_URL,
};

