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
import { RotateCcw, CalendarCheck } from 'lucide-react';

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

  // 初期化：既存の設定があればそれを、なければデフォルトの土日をセット
  useEffect(() => {
    if (open && appSettings) {
      const activeDatesStr = appSettings.activeDatesByMonth[monthKey];
      if (activeDatesStr && activeDatesStr.length > 0) {
        setSelectedDates(activeDatesStr.map(d => new Date(d + 'T00:00:00')));
      } else {
        // 設定がない場合は自動的にデフォルトをセット
        handleResetToDefault();
      }
    }
  }, [open, appSettings, monthKey, currentMonth]);

  const handleResetToDefault = () => {
    const defaultDatesStr = getDefaultActiveDatesForMonth(currentMonth);
    setSelectedDates(defaultDatesStr.map(d => new Date(d + 'T00:00:00')));
    toast({ title: 'デフォルト適用', description: '週末（土日）をベースにした日程を選択しました。' });
  };

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
      <DialogContent className="max-w-md bg-background border-2 shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <CalendarCheck className="h-5 w-5" />
            <DialogTitle className="text-xl">{format(currentMonth, 'yyyy年M月')}の開講日設定</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            カレンダーで青くなっている日がスケジュール対象日です。
            クリックして追加・削除ができます。
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4 gap-4">
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates || [])}
              defaultMonth={currentMonth}
              locale={ja}
              className="rounded-md"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-full",
                day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary/20",
              }}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetToDefault}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            土日のみのデフォルトに戻す
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSave} disabled={isSaving} className="font-bold px-8">
            {isSaving ? '保存中...' : 'この日程で確定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
