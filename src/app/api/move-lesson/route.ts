import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!adminDb || !adminAuth) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized' }, { status: 500 });
  }

  const { lessonId, targetSlotId } = await request.json();
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  if (!lessonId || !targetSlotId) {
    return NextResponse.json({ error: '必須項目が不足しています。' }, { status: 400 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection('users').doc(uid);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('ユーザーが見つかりません。');
      }
      
      const userData = userDoc.data();
      const linkedStudentId = userData?.linkedStudentId;
      
      if (!linkedStudentId) {
        throw new Error('ユーザーが生徒に連携されていません。');
      }

      const lessonRef = adminDb.collection('lessons').doc(lessonId);
      const lessonDoc = await transaction.get(lessonRef);
      
      if (!lessonDoc.exists) {
        throw new Error('レッスンが見つかりません。');
      }
      
      const lessonData = lessonDoc.data();
      
      if (lessonData?.studentId !== linkedStudentId) {
        throw new Error('権限がありません。');
      }

      transaction.update(lessonRef, {
        slotId: targetSlotId,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ message: '成功' }, { status: 200 });

  } catch (error: any) {
    console.error('Error moving lesson:', error);
    return NextResponse.json({ error: error.message || 'サーバーエラーが発生しました。' }, { status: 400 });
  }
}
