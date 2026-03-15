/**
 * Local dev server - run APIs without Vercel login.
 * Usage: npm run dev
 * APIs: http://localhost:3000/api/...
 */
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const ROUTES = {
  'GET /api/health': './api/health.js',
  'POST /api/agora/token': './api/agora/token.js',
  'POST /api/agora/call/create': './api/agora/call/create.js',
  'POST /api/agora/call/join': './api/agora/call/join.js',
  'POST /api/qrcode/generate': './api/qrcode/generate.js',
  'POST /api/call/create-with-qr': './api/call/create-with-qr.js',
  'POST /api/call/join-by-code': './api/call/join-by-code.js',
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const key = `${req.method} ${req.url.split('?')[0]}`;
  const handlerPath = ROUTES[key];

  if (!handlerPath) {
    if (req.url === '/' || req.url === '/api') {
      return send(res, 200, {
        message: 'Quin Backend',
        docs: 'See README.md',
        health: 'GET /api/health',
      });
    }
    return send(res, 404, { error: 'Not found' });
  }

  try {
    const mod = await import(join(__dirname, handlerPath));
    const handler = mod.default;
    const body = await parseBody(req);
    const mockReq = { method: req.method, url: req.url, body };
    const mockRes = {
      status: (code) => ({ json: (data) => send(res, code, data) }),
      setHeader: () => {},
      end: () => {},
    };
    mockRes.status = (code) => ({
      json: (data) => {
        res.writeHead(code, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      },
    });
    await handler(mockReq, mockRes);
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Quin backend running at http://localhost:${PORT}`);
  console.log('  GET  /api/health');
  console.log('  POST /api/call/create-with-qr');
  console.log('  POST /api/call/join-by-code');
  console.log('  ... (see README for all endpoints)');
});
