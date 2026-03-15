const express = require('express');
const rateLimit = require('express-rate-limit');
const { generateQrCodes, activateQrCode, getQrDetails } = require('../controllers/qrController');

const router = express.Router();

const scanRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 scans per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/generate', generateQrCodes);
router.post('/activate', activateQrCode);
router.get('/:qrId', scanRateLimiter, getQrDetails);

module.exports = router;

