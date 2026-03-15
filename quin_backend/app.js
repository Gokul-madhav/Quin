/**
 * Quin Backend - Express app
 * All API routes for Agora, QR code, and call routing.
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const getBaseUrl = () => {
  const url = process.env.VERCEL_URL || process.env.BASE_URL;
  if (url) return url.startsWith('http') ? url : `https://${url}`;
  return 'http://localhost:3000';
};

// --- Health ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'quin-backend',
    version: '1.0.0',
    endpoints: {
      agora: {
        token: 'POST /api/agora/token',
        createCall: 'POST /api/agora/call/create',
        joinCall: 'POST /api/agora/call/join',
      },
      qrcode: { generate: 'POST /api/qrcode/generate' },
      call: {
        createWithQr: 'POST /api/call/create-with-qr',
        joinByCode: 'POST /api/call/join-by-code',
      },
    },
  });
});

// --- Agora token ---
app.post('/api/agora/token', (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return res.status(500).json({
        error: 'Agora not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
      });
    }
    const { channelName, uid: uidParam, role = 'publisher' } = req.body || {};
    if (!channelName) {
      return res.status(400).json({ error: 'channelName is required' });
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
    res.json({ token, appId, channelName, uid, expiresIn: 3600 });
  } catch (err) {
    console.error('Agora token error:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// --- Agora call create ---
app.post('/api/agora/call/create', (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return res.status(500).json({
        error: 'Agora not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
      });
    }
    const baseUrl = getBaseUrl();
    const callId = uuidv4().replace(/-/g, '').slice(0, 12);
    const channelName = `call_${callId}`;
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
    const qrPayload = { type: 'quin_call', callId, channelName, appId };
    res.json({
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
    res.status(500).json({ error: 'Failed to create call' });
  }
});

// --- Agora call join ---
app.post('/api/agora/call/join', (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return res.status(500).json({
        error: 'Agora not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
      });
    }
    const { callId, channelName: channelParam } = req.body || {};
    const channelName = channelParam || (callId ? `call_${callId}` : null);
    if (!channelName) {
      return res.status(400).json({ error: 'callId or channelName is required' });
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
    res.json({ success: true, token, channelName, uid, appId, expiresIn: 3600 });
  } catch (err) {
    console.error('Join call error:', err);
    res.status(500).json({ error: 'Failed to join call' });
  }
});

// --- QR code generate ---
app.post('/api/qrcode/generate', async (req, res) => {
  try {
    const { payload, type = 'custom', size = 256 } = req.body || {};
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
    res.json({ success: true, qrDataUrl, payload: dataToEncode, metadata });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// --- Call create with QR ---
app.post('/api/call/create-with-qr', async (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return res.status(500).json({
        error: 'Agora not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
      });
    }
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
    res.json({
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
    res.status(500).json({ error: 'Failed to create call' });
  }
});

// --- Call join by code ---
app.post('/api/call/join-by-code', (req, res) => {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return res.status(500).json({
        error: 'Agora not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.',
      });
    }
    const { code, callId } = req.body || {};
    const id = code || callId;
    if (!id) {
      return res.status(400).json({ error: 'code or callId is required' });
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
    res.json({ success: true, token, channelName, uid, appId, expiresIn: 3600 });
  } catch (err) {
    console.error('Join by code error:', err);
    res.status(500).json({ error: 'Failed to join call' });
  }
});

// Serve index.html at root (for local dev; Vercel serves static index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 for unknown API paths
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
