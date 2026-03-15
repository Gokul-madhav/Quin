import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { parseBody, sendJson } from '../../_utils.js';

/**
 * POST /api/agora/call/join
 * Body: { callId: string } or { channelName: string }
 * Returns token and channel info to join the call.
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
    const { callId, channelName: channelParam } = body;
    const channelName = channelParam || (callId ? `call_${callId}` : null);

    if (!channelName) {
      return sendJson(res, 400, { error: 'callId or channelName is required' });
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

    return sendJson(res, 200, {
      success: true,
      token,
      channelName,
      uid,
      appId,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error('Join call error:', err);
    return sendJson(res, 500, { error: 'Failed to join call' });
  }
}
