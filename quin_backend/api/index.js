/**
 * Vercel serverless entry - routes all /api/* to this Express app.
 */
import app from '../app.js';

export default function handler(req, res) {
  app(req, res);
}
