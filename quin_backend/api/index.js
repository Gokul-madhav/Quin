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
  const url = req.url || '';

  // Handle QR visitor page when /v/<qrId> is rewritten to /api/index?qrId=<qrId>
  const hasQrIdQuery = url.includes('qrId=');
  if (hasQrIdQuery) {
    const queryPart = url.split('?')[1] || '';
    const params = new URLSearchParams(queryPart);
    const qrId = params.get('qrId') || '';

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
