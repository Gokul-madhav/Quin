import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { v4 as uuidv4 } from 'uuid';
import { parseBody, sendJson, getBaseUrl } from '../../_utils.js';

/**
 * POST /api/agora/call/create
 * Body: { userName?: string, source?: 'web'|'mobile' }
 * Creates a new call session; returns channel, token, shortCode, and QR payload.
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
    const { userName = 'Host', source = 'web' } = body;

    const callId = uuidv4().replace(/-/g, '').slice(0, 12);
    const channelName = `call_${callId}`;
    const uid = Math.floor(Math.random() * 100000) + 1;
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    const baseUrl = getBaseUrl();

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      expirationTime
    );

    const qrPayload = {
      type: 'quin_call',
      callId,
      channelName,
      appId,
    };

    return sendJson(res, 200, {
      success: true,
      call: {
        callId,
        channelName,
        token,
        uid,
        appId,
        expiresAt: Date.now() + 3600 * 1000,
      },
      joinUrl: `${baseUrl}/join?code=${callId}`,
      qrPayload,
      shortCode: callId,
    });
  } catch (err) {
    console.error('Create call error:', err);
    return sendJson(res, 500, { error: 'Failed to create call' });
  }
}
