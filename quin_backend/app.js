// Shim file for Vercel: expose the Express app using CommonJS.
// Vercel is attempting to load `quin_backend/app.js` as a CJS module,
// so we simply require and re-export the main Express app defined in src/server.js.

/* eslint-disable global-require */
const app = require('./src/server');

module.exports = app;
