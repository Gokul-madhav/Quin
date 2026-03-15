const assertEnv = (key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return process.env[key];
};

module.exports = {
  getFirebaseConfig: () => {
    const projectId = assertEnv('FIREBASE_PROJECT_ID');
    const clientEmail = assertEnv('FIREBASE_CLIENT_EMAIL');
    // Replace escaped newlines in private key if necessary
    const privateKey = assertEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

    return {
      credential: {
        projectId,
        clientEmail,
        privateKey,
      },
      databaseURL: assertEnv('FIREBASE_DATABASE_URL'),
      firestore: {
        privacyCollection: 'privacy_settings',
      },
    };
  },
};

