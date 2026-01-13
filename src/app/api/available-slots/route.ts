import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/server/firebase-admin';
import { format } from 'date-fns';

export async function POST(request: Request) {
  const { excludeSlotId, month } = await request.json();
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authorization.split('Bearer ')[1];

  if (!month) {
    return NextResponse.json({ error: 'monthは必須です。' }, { status: 400 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // ユーザー情報を確認（ログイン確認用）
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'ユーザーが見つかりません。' }, { status: 401 });
    }

    // monthをDateオブジェクトに変換（YYYY-MM形式を想定）
    const monthDate = new Date(month + '-01');
    if (isNaN(monthDate.getTime())) {
      return NextResponse.json({ error: '無効な月の形式です。' }, { status: 400 });
    }

    const monthStr = format(monthDate, 'yyyy-MM');

    // settings/appからdefaultSlotCapacityを取得
    const settingsDocRef = adminDb.collection('settings').doc('app');
    const settingsDoc = await settingsDocRef.get();
    const settings = settingsDoc.exists ? settingsDoc.data() : { defaultSlotCapacity: 4 };
    const defaultCapacity = settings?.defaultSlotCapacity || 4;

    // timeSlotsコレクションから対象月のスロットを取得
    const timeSlotsQuery = adminDb.collection('timeSlots')
      .where('date', '>=', monthStr + '-01')
      .where('date', '<', monthStr + '-32'); // 次の月の1日より小さい（実質的に当月のみ）
    const timeSlotsSnapshot = await timeSlotsQuery.get();
    
    // slotIdsを配列化し、メタデータマップを構築
    const slotIds: string[] = [];
    const slotMetadataMap: Map<string, {
      date: string;
      startTime: string;
      endTime: string;
      capacity: number;
    }> = new Map();

    timeSlotsSnapshot.docs.forEach(doc => {
      const timeSlot = doc.data();
      const slotId = timeSlot.slotId || doc.id;
      
      // 移動元のslotIdは除外
      if (slotId === excludeSlotId) return;
      
      slotIds.push(slotId);
      slotMetadataMap.set(slotId, {
        date: timeSlot.date || '',
        startTime: timeSlot.startTime || '',
        endTime: timeSlot.endTime || '',
        capacity: timeSlot.capacity || defaultCapacity,
      });
    });

    // slotIdsを10件ずつに分割（Firestore 'in'制限は10件）
    const chunkSize = 10;
    const slotIdChunks: string[][] = [];
    for (let i = 0; i < slotIds.length; i += chunkSize) {
      slotIdChunks.push(slotIds.slice(i, i + chunkSize));
    }

    // 各chunkについてlessonsを取得して集計
    const slotCountMap = new Map<string, number>();
    
    for (const chunk of slotIdChunks) {
      if (chunk.length === 0) continue;
      
      const lessonsQuery = adminDb.collection('lessons')
        .where('slotId', 'in', chunk)
        .where('status', 'in', ['approved', 'scheduled']);
      const lessonsSnapshot = await lessonsQuery.get();
      
      // slotIdごとの件数を集計（studentIdの重複は無視せず、lesson件数でカウント）
      lessonsSnapshot.docs.forEach(doc => {
        const lesson = doc.data();
        const slotId = lesson.slotId;
        if (slotId) {
          slotCountMap.set(slotId, (slotCountMap.get(slotId) || 0) + 1);
        }
      });
    }

    // 残席数を計算して返す（生徒情報は含めない）
    const result = slotIds
      .map(slotId => {
        const metadata = slotMetadataMap.get(slotId);
        if (!metadata) return null;
        
        const count = slotCountMap.get(slotId) || 0;
        const availableSeats = metadata.capacity - count;
        
        return {
          slotId,
          date: metadata.date,
          startTime: metadata.startTime,
          endTime: metadata.endTime,
          capacity: metadata.capacity,
          availableSeats,
        };
      })
      .filter((slot): slot is NonNullable<typeof slot> => slot !== null && slot.availableSeats > 0) // 空きがあるもののみ
      .sort((a, b) => {
        // 日付順、時間順でソート
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error getting available slots:', error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: '認証エラーが発生しました。再度ログインしてください。' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
