import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/call/create-with-qr
 * Creates a call session and returns token + QR code for mobile to scan and join.
 * Web calls this to start a voice call; mobile scans the QR to get call details.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BASE_URL || 'http://localhost:3000';

  if (!appId || !appCertificate) {
    return res.status(500).json({
      error: 'Agora not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
    });
  }

  try {
    const { userName = 'Host' } = req.body || {};
    const callId = uuidv4().replace(/-/g, '').slice(0, 12);
    const channelName = `call_${callId}`;
    const hostUid = Math.floor(Math.random() * 100000) + 1;
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      hostUid,
      RtcRole.PUBLISHER,
      expirationTime
    );

    const qrPayload = {
      type: 'quin_call',
      callId,
      channelName,
      appId,
      joinApiUrl: `${baseUrl}/api/agora/call/join`,
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
      width: 300,
      margin: 2,
    });

    return res.status(200).json({
      success: true,
      call: {
        callId,
        channelName,
        token,
        uid: hostUid,
        appId,
        expiresAt: Date.now() + 3600 * 1000,
      },
      qrDataUrl,
      qrPayload,
      shortCode: callId,
      joinUrl: `${baseUrl}/join?code=${callId}`,
    });
  } catch (err) {
    console.error('Create call with QR error:', err);
    return res.status(500).json({ error: 'Failed to create call' });
  }
}
