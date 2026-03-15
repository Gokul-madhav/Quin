const express = require('express');
const rateLimit = require('express-rate-limit');
const { startCall } = require('../controllers/callController');

const router = express.Router();

const callRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/start', callRateLimiter, startCall);

module.exports = router;

