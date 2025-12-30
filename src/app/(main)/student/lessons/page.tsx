"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { getStudentUpcomingLessons } from '@/lib/data';
import type { LessonWithDetails } from '@/lib/types';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/shared/Loading';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';

const statusMap: { [key in LessonWithDetails['status']]: { text: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
  scheduled: { text: '予定', variant: 'default' },
  swap_pending: { text: '振替申請中', variant: 'secondary' },
  swapped: { text: '振替済み', variant: 'outline' },
  canceled: { text: 'キャンセル', variant: 'destructive' },
  approved: { text: '承認済み', variant: 'default' },
};

export default function AllLessonsPage() {
  const { user } = useUser();
  const [lessons, setLessons] = useState<LessonWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // NOTE: getStudentUpcomingLessons gets ALL lessons for simplicity now.
      getStudentUpcomingLessons(user.uid).then(data => {
        setLessons(data.sort((a, b) => new Date(b.slotDate).getTime() - new Date(a.slotDate).getTime()));
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="全授業一覧" />
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日時</TableHead>
              <TableHead>時間</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.length > 0 ? lessons.map(lesson => (
              <TableRow key={lesson.lessonId} asChild>
                <Link href={`/student/lesson/${lesson.lessonId}`} className="cursor-pointer">
                  <TableCell className="font-medium">
                    {format(parseISO(lesson.slotDate), 'yyyy年 M月d日 (E)', { locale: ja })}
                  </TableCell>
                  <TableCell>{lesson.slotStartTime} - {lesson.slotEndTime}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[lesson.status].variant}>
                      {statusMap[lesson.status].text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="h-4 w-4 inline-block text-muted-foreground" />
                  </TableCell>
                </Link>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  授業の記録はありません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
