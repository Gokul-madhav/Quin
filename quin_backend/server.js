/**
 * Local server - run with: npm run dev
 */
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Quin backend at http://localhost:${PORT}`);
  console.log('  GET  /api/health');
  console.log('  POST /api/call/create-with-qr');
  console.log('  POST /api/call/join-by-code');
  console.log('  ... (see README for all endpoints)');
});
