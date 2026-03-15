import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { parseBody, sendJson, getBaseUrl } from '../_utils.js';

/**
 * POST /api/call/create-with-qr
 * Creates a call session and returns token + QR code image for mobile to scan and join.
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
    const { userName = 'Host' } = body;

    const baseUrl = getBaseUrl();
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

    return sendJson(res, 200, {
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
    return sendJson(res, 500, { error: 'Failed to create call' });
  }
}
