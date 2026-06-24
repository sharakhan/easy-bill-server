const admin = require("firebase-admin");
const path = require("path");

const initializeFirebase = () => {
  try {
    const serviceAccountPath = path.resolve(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
        "./firebase-service-account-key.json"
    );

    // Only initialize if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      console.log("✅ Firebase Admin SDK initialized");
    }
  } catch (error) {
    console.warn(
      `⚠️  Firebase Admin SDK not initialized: ${error.message}`
    );
    console.warn(
      "   Firebase features will be unavailable. Add your service account key to proceed."
    );
  }
};

module.exports = { admin, initializeFirebase };
