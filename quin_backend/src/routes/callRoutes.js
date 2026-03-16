const express = require('express');
const rateLimit = require('express-rate-limit');
const { startCall, getCallSession, acceptCall, declineCall, endCall } = require('../controllers/callController');

const router = express.Router();

const callRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/start', callRateLimiter, startCall);
router.get('/session/:sessionId', getCallSession);
router.post('/accept', callRateLimiter, acceptCall);
router.post('/decline', callRateLimiter, declineCall);
router.post('/end', callRateLimiter, endCall);

module.exports = router;

