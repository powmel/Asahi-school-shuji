
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key && key !== 'undefined') {
    try {
      const serviceAccount = JSON.parse(key);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is missing or undefined. Firebase Admin SDK not initialized.');
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null as any;
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
