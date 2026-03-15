import admin from 'firebase-admin';

if (!admin.apps.length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  // 厳格なチェック: "undefined" という文字列や空文字を無視してエラーを防ぐ
  if (key && typeof key === 'string' && key.trim() !== '' && key !== 'undefined' && key !== 'null') {
    try {
      const serviceAccount = JSON.parse(key);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
  } else {
    // ビルド時や未設定時は警告を出すのみにとどめる
    if (process.env.NODE_ENV === 'production') {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid. Firebase Admin SDK not initialized.');
    }
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
