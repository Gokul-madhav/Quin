/**
 * GET /api/health
 * Health check for the backend.
 */
export default async function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'quin-backend',
    version: '1.0.0',
    endpoints: {
      agora: {
        token: 'POST /api/agora/token',
        createCall: 'POST /api/agora/call/create',
        joinCall: 'POST /api/agora/call/join',
      },
      qrcode: {
        generate: 'POST /api/qrcode/generate',
      },
      call: {
        createWithQr: 'POST /api/call/create-with-qr',
        joinByCode: 'POST /api/call/join-by-code',
      },
    },
  });
}
