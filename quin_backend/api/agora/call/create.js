import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/agora/call/create
 * Body: { userName?: string, source: 'web' | 'mobile' }
 * Creates a new call session. Web uses this to create a call; returns channel + token + shortCode for mobile to join.
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
    const { userName = 'Host', source = 'web' } = req.body || {};
    const callId = uuidv4().replace(/-/g, '').slice(0, 12);
    const channelName = `call_${callId}`;
    const uid = Math.floor(Math.random() * 100000) + 1;
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      expirationTime
    );

    const joinUrl = `${baseUrl}/join?code=${callId}`;
    const qrPayload = JSON.stringify({
      type: 'quin_call',
      callId,
      channelName,
      appId,
    });

    return res.status(200).json({
      success: true,
      call: {
        callId,
        channelName,
        token,
        uid,
        appId,
        expiresAt: Date.now() + 3600 * 1000,
      },
      joinUrl,
      qrPayload,
      shortCode: callId,
    });
  } catch (err) {
    console.error('Create call error:', err);
    return res.status(500).json({ error: 'Failed to create call' });
  }
}
