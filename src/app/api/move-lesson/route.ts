
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  const { lessonId, targetSlotId } = await request.json();
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  if (!lessonId || !targetSlotId) {
    return NextResponse.json({ error: 'レッスンIDと移動先スロットIDは必須です。' }, { status: 400 });
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
        throw new Error('このレッスンを移動する権限がありません。');
      }
      
      if (lessonData?.status !== 'scheduled' && lessonData?.status !== 'approved') {
        throw new Error('このレッスンは移動できません。');
      }
      
      if (lessonData?.slotId === targetSlotId) {
        throw new Error('移動元と移動先が同じです。');
      }

      const targetSlotLessonsQuery = adminDb.collection('lessons')
        .where('slotId', '==', targetSlotId)
        .where('status', 'in', ['approved', 'scheduled']);
      
      const targetSlotLessonsSnap = await transaction.get(targetSlotLessonsQuery);
      const targetSlotStudentIds = new Set(
        targetSlotLessonsSnap.docs.map(doc => doc.data().studentId)
      );
      
      if (targetSlotStudentIds.has(linkedStudentId)) {
        throw new Error('移動先の時間帯に既に予約があります。');
      }
      
      const settingsDocRef = adminDb.collection('settings').doc('app');
      const settingsDoc = await transaction.get(settingsDocRef);
      const settings = settingsDoc.exists ? settingsDoc.data() : { defaultSlotCapacity: 4 };
      const capacity = settings?.defaultSlotCapacity || 4;
      const currentCount = targetSlotStudentIds.size;
      
      if (currentCount >= capacity) {
        throw new Error('移動先の時間帯が満席です。');
      }

      transaction.update(lessonRef, {
        slotId: targetSlotId,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ message: 'レッスンを移動しました。' }, { status: 200 });

  } catch (error: any) {
    console.error('Error moving lesson:', error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: '認証エラーが発生しました。再度ログインしてください。' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'サーバーエラーが発生しました。' }, { status: 400 });
  }
}
