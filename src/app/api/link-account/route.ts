import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/server/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!adminDb || !adminAuth) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized' }, { status: 500 });
  }

  const { studentCode, linkToken } = await request.json();
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  if (!studentCode || !linkToken) {
    return NextResponse.json({ error: '生徒コードと連携トークンは必須です。' }, { status: 400 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const studentQuery = adminDb.collection('students').where('studentCode', '==', studentCode).limit(1);
    const studentSnapshot = await studentQuery.get();

    if (studentSnapshot.empty) {
      return NextResponse.json({ error: '指定された生徒コードは存在しません。' }, { status: 404 });
    }

    const studentDoc = studentSnapshot.docs[0];
    const studentData = studentDoc.data();

    if (studentData.linkedUserId) {
        return NextResponse.json({ error: 'この生徒コードは既に使用されています。' }, { status: 400 });
    }

    if (studentData.linkToken !== linkToken) {
      return NextResponse.json({ error: '連携トークンが正しくありません。' }, { status: 400 });
    }

    const batch = adminDb.batch();

    batch.update(studentDoc.ref, {
      linkedUserId: uid,
      linkToken: FieldValue.delete(),
      linkTokenExpiresAt: FieldValue.delete(),
    });

    const userDocRef = adminDb.collection('users').doc(uid);
    batch.update(userDocRef, {
      linkedStudentId: studentDoc.id,
    });

    await batch.commit();

    return NextResponse.json({ message: '成功' }, { status: 200 });

  } catch (error: any) {
    console.error('Error linking account:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
