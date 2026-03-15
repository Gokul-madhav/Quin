import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

/**
 * POST /api/call/join-by-code
 * Body: { code: string } or { callId: string }
 * Mobile app uses this when user scans QR or enters short code to join the call.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return res.status(500).json({
      error: 'Agora not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
    });
  }

  try {
    const { code, callId } = req.body || {};
    const id = code || callId;

    if (!id) {
      return res.status(400).json({
        error: 'code or callId is required',
      });
    }

    const channelName = id.startsWith('call_') ? id : `call_${id}`;
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

    return res.status(200).json({
      success: true,
      token,
      channelName,
      uid,
      appId,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error('Join by code error:', err);
    return res.status(500).json({ error: 'Failed to join call' });
  }
}
