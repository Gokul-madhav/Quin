import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/qrcode/generate
 * Body: { payload?: string, type?: 'call'|'link'|'custom', size?: number }
 * Generates a unique QR code. If type='call', creates a call session and encodes it.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appId = process.env.AGORA_APP_ID;
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BASE_URL || 'http://localhost:3000';

  try {
    const { payload, type = 'custom', size = 256 } = req.body || {};

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
      width: Math.min(size, 512),
      margin: 2,
    });

    return res.status(200).json({
      success: true,
      qrDataUrl,
      payload: dataToEncode,
      metadata,
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return res.status(500).json({ error: 'Failed to generate QR code' });
  }
}
