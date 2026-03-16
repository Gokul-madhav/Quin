/**
 * Vercel serverless entry.
 *
 * - All /api/* requests are routed here via vercel.json and handled by the Express app.
 * - Public QR visitor URLs /v/:qrId are rewritten to /api/index/v/:qrId and
 *   rendered directly here (HTML), then in turn call the Express JSON APIs.
 */
import app from '../app.js';
import { renderVisitorPage } from '../src/visitorPage';

export default function handler(req, res) {
  // When Vercel rewrites /v/:qrId -> /api/index/v/:qrId the incoming path
  // will contain `/v/<qrId>` after the /api/index prefix.
  if (req.url && req.url.includes('/v/')) {
    // Example incoming URLs:
    //   /api/index/v/QN000001
    //   /api/index/v/QN000001?foo=bar
    const parts = req.url.split('/v/');
    const tail = parts[1] || '';
    const qrId = decodeURIComponent(tail.split(/[?#]/)[0] || '');

    if (!qrId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'qrId is required' }));
      return;
    }

    const html = renderVisitorPage(qrId);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
    return;
  }

  // Default: delegate to Express app for normal /api/* routes
  app(req, res);
}
