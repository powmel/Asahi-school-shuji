"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getPublishedAnnouncements, getStudentUpcomingLessons } from "@/lib/data";
import type { Announcement, LessonWithDetails } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArrowRight, BookOpen, Calendar as CalendarIcon, Megaphone } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

function AnnouncementSection({ announcements }: { announcements: Announcement[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <CardTitle className="font-headline text-xl">お知らせ</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/student/announcements">全て表示 <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.slice(0, 3).map((ann) => (
          <div key={ann.id} className="p-3 rounded-lg bg-muted/50">
            <p className="font-bold text-sm text-foreground">{ann.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{format(ann.createdAt, 'yyyy年MM月dd日')}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function UpcomingLessonsSection({ lessons }: { lessons: LessonWithDetails[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle className="font-headline text-xl">今後の授業予定</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.length > 0 ? lessons.slice(0, 5).map((lesson) => (
          <Link href={`/student/lesson/${lesson.lessonId}`} key={lesson.lessonId} className="block p-3 rounded-lg bg-muted/50 hover:bg-accent transition-colors">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-bold text-sm">{format(parseISO(lesson.slotDate), 'M月d日 (E)', { locale: ja })}</p>
                    <p className="text-xs text-muted-foreground">{lesson.slotStartTime} - {lesson.slotEndTime}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        )) : (
            <p className="text-sm text-muted-foreground text-center py-4">今後の授業予定はありません。</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [lessons, setLessons] = useState<LessonWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        getPublishedAnnouncements(),
        getStudentUpcomingLessons(user.uid),
      ]).then(([announcementsData, lessonsData]) => {
        setAnnouncements(announcementsData);
        setLessons(lessonsData);
        setLoading(false);
      });
    }
  }, [user]);

  const lessonDates = lessons.map(l => parseISO(l.slotDate));

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title={`${user?.name || '生徒'}さんのダッシュボード`} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <AnnouncementSection announcements={announcements} />
            <UpcomingLessonsSection lessons={lessons} />
        </div>
        
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="font-headline text-xl">授業カレンダー</CardTitle>
                </div>
                <CardDescription>授業が予定されている日</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <Calendar
                    mode="multiple"
                    selected={lessonDates}
                    className="p-0"
                    classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                    }}
                    locale={ja}
                />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
