import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { parseBody, sendJson, getBaseUrl } from '../_utils.js';

/**
 * POST /api/qrcode/generate
 * Body: { payload?: string, type?: 'call'|'link'|'custom', size?: number }
 * Generates a unique QR code image (data URL) and metadata.
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const body = parseBody(req);
    const { payload, type = 'custom', size = 256 } = body;
    const baseUrl = getBaseUrl();
    const appId = process.env.AGORA_APP_ID;

    let dataToEncode = payload;
    let metadata = {};

    if (type === 'call' && appId) {
      const callId = uuidv4().replace(/-/g, '').slice(0, 12);
      const channelName = `call_${callId}`;
      metadata = {
        type: 'quin_call',
        callId,
        channelName,
        appId,
        joinUrl: `${baseUrl}/api/agora/call/join`,
      };
      dataToEncode = JSON.stringify(metadata);
    } else if (type === 'link' && !payload) {
      const id = uuidv4().slice(0, 8);
      metadata = { type: 'link', id, url: `${baseUrl}/r/${id}` };
      dataToEncode = JSON.stringify(metadata);
    } else if (!dataToEncode) {
      const id = uuidv4();
      metadata = { type: 'custom', id };
      dataToEncode = JSON.stringify(metadata);
    }

    const qrDataUrl = await QRCode.toDataURL(dataToEncode, {
      width: Math.min(Number(size) || 256, 512),
      margin: 2,
    });

    return sendJson(res, 200, {
      success: true,
      qrDataUrl,
      payload: dataToEncode,
      metadata,
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return sendJson(res, 500, { error: 'Failed to generate QR code' });
  }
}
