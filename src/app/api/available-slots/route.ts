
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/server/firebase-admin';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!adminDb || !adminAuth) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized' }, { status: 500 });
  }

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

    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'ユーザーが見つかりません。' }, { status: 401 });
    }

    const monthDate = new Date(month + '-01T00:00:00Z');
    if (isNaN(monthDate.getTime())) {
      return NextResponse.json({ error: '無効な月の形式です。' }, { status: 400 });
    }

    const monthStr = format(monthDate, 'yyyy-MM');

    const settingsDocRef = adminDb.collection('settings').doc('app');
    const settingsDoc = await settingsDocRef.get();
    const settings = settingsDoc.exists ? settingsDoc.data() : { defaultSlotCapacity: 4 };
    const defaultCapacity = settings?.defaultSlotCapacity || 4;

    const lessonsQuery = adminDb.collection('lessons')
      .where('status', 'in', ['approved', 'scheduled']);
      
    const lessonsSnapshot = await lessonsQuery.get();
    
    const lessonsInMonth = lessonsSnapshot.docs
        .map(doc => doc.data())
        .filter(lesson => lesson.slotId.startsWith(monthStr));

    const occupancyMap = new Map<string, number>();
    lessonsInMonth.forEach(lesson => {
        occupancyMap.set(lesson.slotId, (occupancyMap.get(lesson.slotId) || 0) + 1);
    });

    const activeDates = (settings?.activeDatesByMonth?.[monthStr] || []) as string[];

    const fixedTimeSlotsDefinition = [
        { startTime: '10:00', endTime: '10:50' },
        { startTime: '11:00', endTime: '11:50' },
        { startTime: '13:00', endTime: '13:50' },
        { startTime: '14:00', endTime: '14:50' },
        { startTime: '15:00', endTime: '15:50' },
    ];

    const result = activeDates.flatMap(date => {
        return fixedTimeSlotsDefinition.map(timeDef => {
            const slotId = `${date}-${timeDef.startTime}`;
            if (slotId === excludeSlotId) return null;

            const occupancy = occupancyMap.get(slotId) || 0;
            const availableSeats = defaultCapacity - occupancy;
            
            if (availableSeats <= 0) return null;

            return {
              slotId,
              date: date,
              startTime: timeDef.startTime,
              endTime: timeDef.endTime,
              capacity: defaultCapacity,
              availableSeats,
            };
        });
    })
    .filter((slot): slot is NonNullable<typeof slot> => slot !== null)
    .sort((a, b) => {
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
