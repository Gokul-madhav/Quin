import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { parseBody, sendJson } from '../_utils.js';

/**
 * POST /api/call/join-by-code
 * Body: { code: string } or { callId: string }
 * Returns token and channel info to join the call (e.g. after scanning QR).
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
    const { code, callId } = body;
    const id = code || callId;

    if (!id) {
      return sendJson(res, 400, { error: 'code or callId is required' });
    }

    const channelName = String(id).startsWith('call_') ? String(id) : `call_${id}`;
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
    console.error('Join by code error:', err);
    return sendJson(res, 500, { error: 'Failed to join call' });
  }
}
