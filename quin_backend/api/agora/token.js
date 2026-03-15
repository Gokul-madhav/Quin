import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { parseBody, sendJson } from '../_utils.js';

/**
 * POST /api/agora/token
 * Body: { channelName: string, uid?: number|string, role?: 'publisher'|'subscriber' }
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return sendJson(res, 500, {
        error: 'Agora not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
      });
    }

    const body = parseBody(req);
    const { channelName, uid: uidParam, role = 'publisher' } = body;

    if (!channelName) {
      return sendJson(res, 400, { error: 'channelName is required' });
    }

    const uid = uidParam != null ? Number(uidParam) : 0;
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const roleValue = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      roleValue,
      expirationTime
    );

    return sendJson(res, 200, {
      token,
      appId,
      channelName,
      uid,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error('Agora token error:', err);
    return sendJson(res, 500, { error: 'Failed to generate token' });
  }
}
