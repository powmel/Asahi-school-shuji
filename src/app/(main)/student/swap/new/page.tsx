"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { createSwapRequest } from '@/lib/data';
import { Loading } from '@/components/shared/Loading';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { ja } from 'date-fns/locale';

const swapRequestSchema = z.object({
  preferredDates: z.array(z.date()).min(1, '希望日を1つ以上選択してください。').max(3, '希望日は3つまで選択できます。'),
  note: z.string().max(500, 'メモは500文字以内で入力してください。').optional(),
});

function SwapRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const lessonId = searchParams.get('lessonId');

  const form = useForm<z.infer<typeof swapRequestSchema>>({
    resolver: zodResolver(swapRequestSchema),
    defaultValues: {
      preferredDates: [],
      note: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof swapRequestSchema>) => {
    if (!user || !lessonId) {
      toast({ title: "エラー", description: "ユーザー情報またはレッスン情報がありません。", variant: "destructive" });
      return;
    }

    try {
      await createSwapRequest({
        studentId: user.uid,
        fromLessonId: lessonId,
        preferredDates: values.preferredDates.map(d => d.toISOString().split('T')[0]),
        note: values.note || '',
      });
      toast({ title: "申請完了", description: "振替申請を送信しました。" });
      router.push('/student');
    } catch (error) {
      toast({ title: "申請失敗", description: "振替申請の送信に失敗しました。", variant: "destructive" });
    }
  };
  
  if (!lessonId) {
    return <div>無効なレッスンIDです。</div>
  }

  return (
    <div>
      <PageHeader title="授業の振替申請">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">振替希望日を選択</CardTitle>
          <CardDescription>振替を希望する日を1〜3つ選択してください。土日のみ選択可能です。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="preferredDates"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormControl>
                      <Calendar
                        mode="multiple"
                        selected={field.value}
                        onSelect={field.onChange}
                        min={1}
                        max={3}
                        locale={ja}
                        disabled={(date) => date < new Date() || (date.getDay() !== 0 && date.getDay() !== 6)}
                        className="rounded-md border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メモ（任意）</FormLabel>
                    <FormControl>
                      <Textarea placeholder="連絡事項があればご記入ください。" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '送信中...' : '振替を申請する'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewSwapRequestPage() {
    return (
        <Suspense fallback={<Loading />}>
            <SwapRequestForm />
        </Suspense>
    )
}
