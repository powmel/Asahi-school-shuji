"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { getAllSwapRequests, updateSwapRequestStatus } from '@/lib/data';
import type { SwapRequestWithDetails } from '@/lib/types';
import { Loading } from '@/components/shared/Loading';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const statusMap: { [key in SwapRequestWithDetails['status']]: { text: string; component: React.ReactNode } } = {
    pending: { text: "保留中", component: <Badge variant="secondary">保留中</Badge> },
    approved: { text: "承認済み", component: <Badge className="bg-green-100 text-green-800">承認済み</Badge> },
    rejected: { text: "却下済み", component: <Badge variant="destructive">却下済み</Badge> },
};


export default function SwapsPage() {
  const [requests, setRequests] = useState<SwapRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = () => {
    setLoading(true);
    getAllSwapRequests().then((data: any) => {
      setRequests(data.sort((a: SwapRequestWithDetails, b: SwapRequestWithDetails) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      }));
      setLoading(false);
    });
  }

  useEffect(() => {
    fetchRequests();
  }, []);
  
  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
        await updateSwapRequestStatus(requestId, status);
        toast({ title: '更新成功', description: `申請を${status === 'approved' ? '承認' : '却下'}しました。`});
        fetchRequests();
    } catch (error) {
        toast({ title: '更新失敗', description: 'ステータスの更新に失敗しました。', variant: 'destructive'});
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="振替申請管理" />
      <div className="space-y-4">
        {requests.length > 0 ? requests.map(req => (
          <Card key={req.requestId}>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{req.studentName}</CardTitle>
                    <CardDescription>申請日: {format(req.createdAt, 'yyyy/MM/dd HH:mm')}</CardDescription>
                  </div>
                  {statusMap[req.status].component}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold">元の授業:</p>
                <p className="text-sm text-muted-foreground">
                    {format(parseISO(req.fromLesson.slotDate), 'M月d日 (E)', {locale: ja})} {req.fromLesson.slotStartTime}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">希望日:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {req.preferredDates.map(date => <li key={date}>{format(parseISO(date), 'M月d日 (E)', {locale: ja})}</li>)}
                </ul>
              </div>
              {req.note && (
                <div>
                  <p className="text-sm font-semibold">メモ:</p>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">{req.note}</p>
                </div>
              )}
              {req.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(req.requestId, 'approved')}>
                        <Check className="mr-2 h-4 w-4" /> 承認
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(req.requestId, 'rejected')}>
                        <X className="mr-2 h-4 w-4" /> 却下
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
            <div className="text-center text-muted-foreground py-16">
                <p>現在、振替申請はありません。</p>
            </div>
        )}
      </div>
    </div>
  );
}
