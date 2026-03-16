require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { initializeFirebase } = require('./services/firebaseService');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const qrRoutes = require('./routes/qrRoutes');
const contactRoutes = require('./routes/contactRoutes');
const callRoutes = require('./routes/callRoutes');
const { renderVisitorPage } = require('./visitorPage');

// Initialize Firebase Admin SDK
initializeFirebase();

const app = express();

// Global middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  })
);
app.use(express.json());
app.use(morgan('combined'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'quin-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/call', callRoutes);

// Public visitor landing page for scanned QR codes
app.get('/v/:qrId', (req, res) => {
  const { qrId } = req.params;

  res.type('html').send(renderVisitorPage(qrId));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3000;

// Only listen when running as a standalone server (not in serverless)
if (process.env.NODE_ENV !== 'serverless') {
  app.listen(PORT, () => {
    console.log(`Quin backend listening on port ${PORT}`);
  });
}

module.exports = app;

