"use client";

import { useEffect, useState } from 'react';
import { getPublishedAnnouncements } from '@/lib/data';
import type { Announcement } from '@/lib/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loading } from '@/components/shared/Loading';
import { format } from 'date-fns';

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedAnnouncements().then(data => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="お知らせ一覧" />
      <div className="space-y-4">
        {announcements.length > 0 ? announcements.map(ann => (
          <Card key={ann.id}>
            <CardHeader>
              <CardTitle>{ann.title}</CardTitle>
              <CardDescription>{format(ann.createdAt, 'yyyy年MM月dd日')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ann.body}</p>
            </CardContent>
          </Card>
        )) : (
           <div className="text-center text-muted-foreground py-16">
                <p>現在、お知らせはありません。</p>
            </div>
        )}
      </div>
    </div>
  );
}
