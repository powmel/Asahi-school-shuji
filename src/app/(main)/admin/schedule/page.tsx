"use client";

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, UserPlus, Sparkles } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSaturday,
  isSunday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getSlotsForMonth, getAllStudents, updateSlotAssignments, fixedTimeSlotsDefinition } from '@/lib/data';
import type { TimeSlot, Student } from '@/lib/types';
import { Loading } from '@/components/shared/Loading';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const courseMap: { [key: string]: string } = {
  '2perMonth': '月2',
  '3perMonth': '月3',
};


function EditSlotDialog({
  open,
  onOpenChange,
  slot,
  allStudents,
  onSave
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  slot: TimeSlot | null,
  allStudents: Student[],
  onSave: (slotId: string, studentIds: string[]) => Promise<void>
}) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (slot) {
      setSelectedStudentIds(slot.assignedStudentIds);
    }
  }, [slot]);

  const handleSave = async () => {
    if (!slot) return;
    setIsSaving(true);
    await onSave(slot.slotId, selectedStudentIds);
    setIsSaving(false);
    onOpenChange(false);
  };
  
  const capacity = slot?.capacity || 0;
  const isOverCapacity = selectedStudentIds.length > capacity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>生徒の割り当て</DialogTitle>
          <DialogDescription>
            {slot ? `${format(new Date(slot.date), 'M月d日')} ${slot.startTime}` : ''} の枠を編集します。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center">
             <p className="text-sm font-medium">定員: {selectedStudentIds.length} / {capacity}</p>
             {isOverCapacity && <Badge variant="destructive">定員オーバー</Badge>}
          </div>
          {allStudents.map(student => (
            <div key={student.uid} className="flex items-center space-x-2">
              <Checkbox
                id={`student-${student.uid}`}
                checked={selectedStudentIds.includes(student.uid)}
                onCheckedChange={(checked) => {
                  setSelectedStudentIds(prev => 
                    checked ? [...prev, student.uid] : prev.filter(id => id !== student.uid)
                  );
                }}
              />
              <Label htmlFor={`student-${student.uid}`}>{student.name} <Badge variant="outline" className="ml-2">{courseMap[student.course]}</Badge></Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
          <Button onClick={handleSave} disabled={isSaving || isOverCapacity}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const { toast } = useToast();

  const weekendDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end }).filter(day => isSaturday(day) || isSunday(day));
  }, [currentMonth]);

  const fetchData = async (month: Date) => {
    setLoading(true);
    try {
        const [slotsData, studentsData] = await Promise.all([
            getSlotsForMonth(month),
            getAllStudents()
        ]);
        setSlots(slotsData);
        setAllStudents(studentsData);
    } catch (error) {
        toast({ title: "エラー", description: "データの取得に失敗しました。", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentMonth);
  }, [currentMonth]);

  const handleSlotSave = async (slotId: string, studentIds: string[]) => {
    try {
        await updateSlotAssignments(slotId, studentIds);
        toast({ title: "成功", description: "スロットが更新されました。" });
        fetchData(currentMonth);
    } catch (error) {
        const message = error instanceof Error ? error.message : "更新に失敗しました。";
        toast({ title: "エラー", description: message, variant: "destructive" });
    }
  };

  if(loading) return <Loading />;

  return (
    <TooltipProvider>
      <div>
        <PageHeader title="月間スケジューラ">
          <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" disabled>
                        <Sparkles className="mr-2 h-4 w-4" />
                        自動割り振り (準備中)
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>日時指定を優先し、月2・月3コースを考慮して自動配置する機能は今後追加予定</p>
                </TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="w-32 text-center font-headline font-semibold text-lg">
                {format(currentMonth, 'yyyy年 M月')}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PageHeader>
        
        <div className="overflow-x-auto rounded-lg border bg-card">
          <div className="grid grid-flow-col auto-cols-fr min-w-max">
            {weekendDays.map(day => {
              const daySlots = slots.filter(s => s.date === format(day, 'yyyy-MM-dd'));
              return (
                <div key={day.toString()} className="flex flex-col border-r last:border-r-0">
                  <div className={cn("p-3 text-center border-b font-semibold", isSunday(day) ? "text-destructive" : "")}>
                    <p>{format(day, 'd')}</p>
                    <p className="text-xs">{format(day, 'E', { locale: ja })}</p>
                  </div>
                  <div className="flex-grow">
                    {fixedTimeSlotsDefinition.map(timeDef => {
                      const slot = daySlots.find(s => s.startTime === timeDef.startTime);
                      if (!slot) return <div key={timeDef.startTime} className="h-24 border-b p-2 text-xs text-muted-foreground">データなし</div>
                      
                      const occupancy = slot.assignedStudentIds.length;
                      const capacity = slot.capacity;
                      const isFull = occupancy >= capacity;
                      
                      return (
                        <div key={slot.slotId} className={cn("h-24 border-b p-2 text-xs relative group")}>
                          <p className="font-semibold">{slot.startTime}</p>
                          <p>
                            {isFull ? <span className='font-bold text-destructive'>満席</span> : '空き'}
                            : {occupancy}/{capacity}
                          </p>
                          <Button
                              variant="ghost" size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setEditingSlot(slot)}
                          >
                              <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
         <EditSlotDialog
          open={!!editingSlot}
          onOpenChange={(isOpen) => !isOpen && setEditingSlot(null)}
          slot={editingSlot}
          allStudents={allStudents}
          onSave={handleSlotSave}
        />
      </div>
    </TooltipProvider>
  );
}
