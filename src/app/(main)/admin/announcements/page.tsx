"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { getAllAnnouncements, saveAnnouncement } from '@/lib/data';
import type { Announcement } from '@/lib/types';
import { Loading } from '@/components/shared/Loading';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

function AnnouncementForm({
    open,
    onOpenChange,
    announcement,
    onSave
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    announcement: Partial<Announcement> | null,
    onSave: () => void
}) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [published, setPublished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (announcement) {
            setTitle(announcement.title || '');
            setBody(announcement.body || '');
            setPublished(announcement.published || false);
        } else {
            setTitle('');
            setBody('');
            setPublished(false);
        }
    }, [announcement]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveAnnouncement({ id: announcement?.id, title, body, published });
            toast({ title: "成功", description: "お知らせを保存しました。" });
            onSave();
            onOpenChange(false);
        } catch(e) {
            toast({ title: "失敗", description: "保存に失敗しました。", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{announcement?.id ? 'お知らせを編集' : '新しいお知らせを作成'}</DialogTitle>
                    <DialogDescription>内容を入力して保存してください。</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">タイトル</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="body">本文</Label>
                        <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={5} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="published" checked={published} onCheckedChange={setPublished} />
                        <Label htmlFor="published">公開する</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "保存中..." : "保存"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);

  const fetchAnnouncements = () => {
      setLoading(true);
      getAllAnnouncements().then(data => {
          setAnnouncements(data);
          setLoading(false);
      });
  }

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleNew = () => {
      setEditingAnnouncement(null);
      setIsFormOpen(true);
  }

  const handleEdit = (ann: Announcement) => {
      setEditingAnnouncement(ann);
      setIsFormOpen(true);
  }

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="お知らせ管理">
        <Button onClick={handleNew}>新規作成</Button>
      </PageHeader>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map(ann => (
              <TableRow key={ann.id}>
                <TableCell className="font-medium">{ann.title}</TableCell>
                <TableCell>
                  <Badge variant={ann.published ? 'default' : 'secondary'}>
                    {ann.published ? '公開中' : '下書き'}
                  </Badge>
                </TableCell>
                <TableCell>{format(ann.createdAt, 'yyyy/MM/dd')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(ann)}>編集</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AnnouncementForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        announcement={editingAnnouncement}
        onSave={fetchAnnouncements}
      />
    </div>
  );
}
