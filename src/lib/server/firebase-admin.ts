import admin from 'firebase-admin';

if (!admin.apps.length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  // JSONパース前に、文字列としての有効性を厳格にチェック
  if (key && typeof key === 'string' && key.length > 10 && key !== 'undefined' && key !== 'null') {
    try {
      const serviceAccount = JSON.parse(key);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEYのパースに失敗しました。形式を確認してください。', e);
    }
  } else {
    // 開発環境などでキーがない場合の警告（本番環境ではこれが原因でエラーになる）
    if (process.env.NODE_ENV === 'production') {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEYが設定されていないか無効です。サーバーサイド機能が制限されます。');
    }
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
