import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

/**
 * POST /api/agora/token
 * Body: { channelName: string, uid: number|string, role?: 'publisher'|'subscriber' }
 * Returns: { token: string, appId: string, channelName: string, uid: number }
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
    const { channelName, uid: uidParam, role = 'publisher' } = req.body || {};

    if (!channelName) {
      return res.status(400).json({ error: 'channelName is required' });
    }

    const uid = uidParam != null ? Number(uidParam) : 0;
    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const roleValue = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      roleValue,
      expirationTime
    );

    return res.status(200).json({
      token,
      appId,
      channelName,
      uid,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error('Agora token error:', err);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
}
