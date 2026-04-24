"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { getAllAnnouncements, getStudentUpcomingLessons } from "@/lib/data";
import type { Announcement, LessonWithDetails } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/shared/Loading";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  Megaphone,
  Repeat,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

function formatLessonDate(date: string) {
  return format(parseISO(date), "M月d日 (E)", { locale: ja });
}

function AnnouncementSection({ announcements }: { announcements: Announcement[] }) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle className="font-headline text-xl tracking-[0.02em]">
            お知らせ
          </CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/student/announcements">
            すべて見る
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {announcements.length > 0 ? (
          announcements.slice(0, 3).map((ann) => (
            <div key={ann.id} className="rounded-md border border-border bg-muted/40 p-3">
              <p className="text-sm font-semibold text-foreground">{ann.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(ann.createdAt, "yyyy年M月d日")}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            現在、表示できるお知らせはありません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingLessonsSection({ lessons }: { lessons: LessonWithDetails[] }) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle className="font-headline text-xl tracking-[0.02em]">
            今後の授業
          </CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/student/lessons">
            授業一覧
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.length > 0 ? (
          lessons.slice(0, 4).map((lesson) => (
            <Link
              href={`/student/lesson/${lesson.lessonId}`}
              key={lesson.lessonId}
              className="block rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    {formatLessonDate(lesson.slotDate)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {lesson.slotStartTime} - {lesson.slotEndTime}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
            </Link>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            今後の授業予定はまだ登録されていません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [lessons, setLessons] = useState<LessonWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([getAllAnnouncements(), getStudentUpcomingLessons(user.uid)])
      .then(([announcementsData, lessonsData]) => {
        const publishedAnnouncements = announcementsData.filter(
          (announcement) => (announcement as Announcement & { published?: boolean }).published !== false
        );
        setAnnouncements(publishedAnnouncements);
        setLessons(lessonsData);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <Loading />;
  }

  const nextLesson = lessons[0];

  return (
    <div className="space-y-8">
      <PageHeader title={`${user?.displayName || "生徒"}さんのページ`} />

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardDescription>次回授業</CardDescription>
            <CardTitle className="font-headline text-2xl tracking-[0.02em]">
              {nextLesson ? formatLessonDate(nextLesson.slotDate) : "予定はまだありません"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextLesson ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {nextLesson.slotStartTime} - {nextLesson.slotEndTime}
                  </p>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    予定の詳細確認や、可能な場合の振替・移動は授業詳細から行えます。
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/student/lesson/${nextLesson.lessonId}`}>
                    詳細を見る
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                授業予定が登録されると、ここに次回授業が表示されます。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Repeat className="h-5 w-5 text-primary" aria-hidden="true" />
              振替について
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              授業一覧または授業詳細から、移動できる授業を確認できます。
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/student/lessons">
                授業一覧を開く
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingLessonsSection lessons={lessons} />
        <AnnouncementSection announcements={announcements} />
      </div>
    </div>
  );
}
