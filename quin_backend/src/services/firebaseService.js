const admin = require('firebase-admin');
const { getFirebaseConfig } = require('../config/firebaseConfig');

let initialized = false;

const initializeFirebase = () => {
  if (initialized) return;

  const cfg = getFirebaseConfig();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: cfg.credential.projectId,
      clientEmail: cfg.credential.clientEmail,
      privateKey: cfg.credential.privateKey,
    }),
    databaseURL: cfg.databaseURL,
  });

  initialized = true;
};

const getAdmin = () => {
  if (!initialized) {
    initializeFirebase();
  }
  return admin;
};

const getDb = () => {
  return getAdmin().database();
};

const getFirestore = () => {
  return getAdmin().firestore();
};

module.exports = {
  initializeFirebase,
  getAdmin,
  getDb,
  getFirestore,
};

