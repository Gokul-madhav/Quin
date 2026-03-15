import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

/**
 * POST /api/agora/call/join
 * Body: { callId: string } or { channelName: string }
 * Mobile app calls this with the callId (from scanned QR) to get token and join the call.
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
    const { callId, channelName: channelParam } = req.body || {};
    const channelName = channelParam || (callId ? `call_${callId}` : null);

    if (!channelName) {
      return res.status(400).json({
        error: 'callId or channelName is required',
      });
    }

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
    console.error('Join call error:', err);
    return res.status(500).json({ error: 'Failed to join call' });
  }
}
