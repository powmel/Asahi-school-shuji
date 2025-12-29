
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { getLessonDetails } from '@/lib/data';
import type { LessonWithDetails } from '@/lib/types';
import { Loading } from '@/components/shared/Loading';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Repeat, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

const statusMap: { [key in LessonWithDetails['status']]: { text: string, color: string } } = {
  scheduled: { text: '予定通り', color: 'text-green-600' },
  swap_pending: { text: '振替申請中', color: 'text-yellow-600' },
  swapped: { text: '振替済み', color: 'text-blue-600' },
  canceled: { text: 'キャンセル済み', color: 'text-red-600' },
  approved: { text: '承認済み', color: 'text-green-600' },
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [lesson, setLesson] = useState<LessonWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const id = params.id as string;

  useEffect(() => {
    if (user && id) {
      getLessonDetails(id, user.uid)
        .then(data => {
          setLesson(data);
          setLoading(false);
        })
        .catch(err => {
          setError('授業の詳細を取得できませんでした。');
          setLoading(false);
        });
    }
  }, [user, id]);

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>{error}</p>
        <Button onClick={() => router.back()} className="mt-4">戻る</Button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center text-muted-foreground">
        <p>授業が見つかりません。</p>
        <Button onClick={() => router.back()} className="mt-4">戻る</Button>
      </div>
    );
  }
  
  const lessonDate = parseISO(lesson.slotDate);
  const statusInfo = statusMap[lesson.status];

  return (
    <div>
      <PageHeader title="授業の詳細">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {format(lessonDate, 'yyyy年M月d日 (E)', { locale: ja })}
          </CardTitle>
          <CardDescription>{lesson.slotStartTime} - {lesson.slotEndTime}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">日時</p>
                <p className="font-semibold">{format(lessonDate, 'M月d日', { locale: ja })} {lesson.slotStartTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ステータス</p>
                <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
              </div>
            </div>
          </div>
          
          {lesson.status === 'scheduled' && new Date() < lessonDate && (
             <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">授業の振替</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    ご都合が悪い場合、こちらの授業を別の日に振り替える申請ができます。
                </p>
                <Button asChild>
                    <Link href={`/student/swap/new?lessonId=${lesson.lessonId}`}>
                        <Repeat className="mr-2 h-4 w-4" />
                        振替を申請する
                    </Link>
                </Button>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
