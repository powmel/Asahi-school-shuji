
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  // ビルド環境や未設定時に "undefined" という文字列が入る場合があるため、厳密にチェック
  if (key && typeof key === 'string' && key.trim() !== '' && key !== 'undefined') {
    try {
      const serviceAccount = JSON.parse(key);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
  } else {
    // 開発環境やビルド初期段階では正常な挙動
    if (process.env.NODE_ENV === 'production') {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid. Firebase Admin SDK not initialized.');
    }
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null as any;
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
