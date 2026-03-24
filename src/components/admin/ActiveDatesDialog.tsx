'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { updateAppSettings, getDefaultActiveDatesForMonth } from '@/lib/data';
import type { AppSettings } from '@/lib/types';

interface ActiveDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMonth: Date;
  appSettings: AppSettings | null;
  onSave: () => void;
}

export function ActiveDatesDialog({
  open,
  onOpenChange,
  currentMonth,
  appSettings,
  onSave
}: ActiveDatesDialogProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const monthKey = format(currentMonth, 'yyyy-MM');

  useEffect(() => {
    if (open && appSettings) {
      const activeDatesStr = appSettings.activeDatesByMonth[monthKey] || getDefaultActiveDatesForMonth(currentMonth);
      setSelectedDates(activeDatesStr.map(d => new Date(d + 'T00:00:00')));
    }
  }, [open, appSettings, monthKey, currentMonth]);

  const handleSave = async () => {
    if (!appSettings) return;
    setIsSaving(true);
    try {
      const activeDatesStr = selectedDates
        .map(d => format(d, 'yyyy-MM-dd'))
        .sort((a, b) => a.localeCompare(b));

      const newActiveDatesByMonth = {
        ...(appSettings.activeDatesByMonth || {}),
        [monthKey]: activeDatesStr
      };

      await updateAppSettings({ activeDatesByMonth: newActiveDatesByMonth });
      toast({ title: '成功', description: '開講日を更新しました。' });
      onSave();
      onOpenChange(false);
    } catch (e) {
      toast({ title: 'エラー', description: '保存に失敗しました。', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background">
        <DialogHeader>
          <DialogTitle>{format(currentMonth, 'yyyy年M月')}の開講日設定</DialogTitle>
          <DialogDescription>
            カレンダーをタップして開講日を選択してください。
            選択された日がスケジュールの対象となります。
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={(dates) => setSelectedDates(dates || [])}
            defaultMonth={currentMonth}
            locale={ja}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '設定を保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
