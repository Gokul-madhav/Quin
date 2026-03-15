/**
 * Shared helpers for Vercel serverless (consistent responses, safe body parse).
 */

export function parseBody(req) {
  if (!req) return {};
  const b = req.body;
  if (b == null) return {};
  if (typeof b === 'object' && !Array.isArray(b)) return b;
  if (typeof b !== 'string') return {};
  try {
    return JSON.parse(b);
  } catch {
    return {};
  }
}

export function sendJson(res, status, data) {
  if (!res) return;
  const body = JSON.stringify(data);
  try {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    if (typeof res.status === 'function') {
      res.status(status).end(body);
    } else {
      res.end(body);
    }
  } catch (e) {
    try {
      res.status(500).end(JSON.stringify({ error: 'Internal server error' }));
    } catch (_) {}
  }
}

export function getBaseUrl() {
  const url = process.env.VERCEL_URL || process.env.BASE_URL;
  if (url) return url.startsWith('http') ? url : `${url}`;
  return 'http://localhost:3000';
}
