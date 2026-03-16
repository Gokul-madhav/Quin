const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { v4: uuidv4 } = require('uuid');

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
  // In production you likely want to fail fast at startup if missing.
  // Here we just log to avoid crashing test environments.
  // eslint-disable-next-line no-console
  console.warn(
    'AGORA_APP_ID or AGORA_APP_CERTIFICATE not set. Call endpoints will fail until configured.'
  );
}

const CALL_DURATION_SECONDS = 90;
const TOKEN_BUFFER_SECONDS = 30; // allow a bit of buffer

const generateChannelName = (qrId, vehicleId) => {
  const randomSuffix = uuidv4().split('-')[0];
  return `quin_${qrId || 'qr'}_${vehicleId || 'veh'}_${randomSuffix}`;
};

const generateToken = ({ channelName, uid }) => {
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    const error = new Error('Agora credentials not configured');
    error.status = 500;
    throw error;
  }

  // Use a non-zero uid to avoid collisions when multiple clients join.
  // If not provided, generate a random 32-bit uid.
  const effectiveUid =
    typeof uid === 'number' && Number.isInteger(uid) && uid > 0
      ? uid
      : Math.floor(Math.random() * 2147483647) + 1;
  const role = RtcRole.PUBLISHER;
  const now = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = now + CALL_DURATION_SECONDS + TOKEN_BUFFER_SECONDS;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    effectiveUid,
    role,
    privilegeExpireTs
  );

  return {
    token,
    expiresAt: privilegeExpireTs,
    appId: AGORA_APP_ID,
    uid: effectiveUid,
  };
};

module.exports = {
  generateChannelName,
  generateToken,
  CALL_DURATION_SECONDS,
};

