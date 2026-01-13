
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
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/shared/Loading';
import { MoveLessonDialog } from '@/components/student/MoveLessonDialog';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronRight, ArrowRightLeft } from 'lucide-react';

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
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const loadLessons = () => {
    if (user) {
      setLoading(true);
      getStudentUpcomingLessons(user.uid).then(data => {
        setLessons(data.sort((a, b) => new Date(a.slotDate).getTime() - new Date(b.slotDate).getTime()));
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadLessons();
    }
  }, [user]);

  const handleMoveClick = (lessonId: string, slotId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedLessonId(lessonId);
    setSelectedSlotId(slotId);
    setMoveDialogOpen(true);
  };

  const handleMoveSuccess = () => {
    loadLessons();
  };

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
            {lessons.length > 0 ? lessons.map(lesson => {
              const canMove = (lesson.status === 'scheduled' || lesson.status === 'approved') &&
                             new Date(lesson.slotDate) >= new Date(); // 過去のレッスンは移動不可
              const currentSlotId = `${lesson.slotDate}-${lesson.slotStartTime}`;
              
              return (
                <TableRow key={lesson.lessonId}>
                  <TableCell className="font-medium">
                    <Link href={`/student/lesson/${lesson.lessonId}`} className="hover:underline">
                      {format(parseISO(lesson.slotDate), 'yyyy年 M月d日 (E)', { locale: ja })}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/student/lesson/${lesson.lessonId}`} className="hover:underline">
                      {lesson.slotStartTime} - {lesson.slotEndTime}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[lesson.status].variant}>
                      {statusMap[lesson.status].text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {canMove && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleMoveClick(lesson.lessonId, currentSlotId, e)}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-1" />
                          移動
                        </Button>
                      )}
                      <Link href={`/student/lesson/${lesson.lessonId}`}>
                        <ChevronRight className="h-4 w-4 inline-block text-muted-foreground" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  授業の記録はありません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedLessonId && selectedSlotId && (
        <MoveLessonDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          lessonId={selectedLessonId}
          currentSlotId={selectedSlotId}
          onMoveSuccess={handleMoveSuccess}
        />
      )}
    </div>
  );
}
