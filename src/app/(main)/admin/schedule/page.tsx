
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, UserPlus, Sparkles, AlertCircle, Settings, Star } from 'lucide-react';
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
import { getSlotsForMonth, getAllStudents, updateSlotAssignments, fixedTimeSlotsDefinition, countStudentLessonsInMonth, getAppSettings, AppSettings, getDefaultActiveDatesForMonth } from '@/lib/data';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';


const courseMap: { [key in Student['course']]: { name: string; limit: number } } = {
  '2perMonth': { name: '月2', limit: 2 },
  '3perMonth': { name: '月3', limit: 3 },
};


export function EditSlotDialog({
  open,
  onOpenChange,
  slot,
  allStudents,
  onSave,
  currentMonth
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  slot: TimeSlot | null,
  allStudents: Student[],
  onSave: (slotId: string, studentIds: string[]) => Promise<void>,
  currentMonth: Date
}) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentMonthlyCounts, setStudentMonthlyCounts] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [studentsToConfirm, setStudentsToConfirm] = useState<Student[]>([]);

  useEffect(() => {
    if (slot) {
      setSelectedStudentIds(slot.assignedStudentIds);
    }
  }, [slot]);

  useEffect(() => {
    if (open && allStudents.length > 0 && slot) {
      const fetchCounts = async () => {
        const counts: Record<string, number> = {};
        const promises = allStudents.map(student =>
            countStudentLessonsInMonth(student.uid, currentMonth).then(count => {
                counts[student.uid] = count;
            })
        );
        await Promise.all(promises);
        setStudentMonthlyCounts(counts);
      };
      fetchCounts();
    }
  }, [open, allStudents, currentMonth, slot]);

  const handleAttemptSave = () => {
    if (!slot) return;
    
    const overLimitStudents = selectedStudentIds
      .map(id => allStudents.find(s => s.uid === id))
      .filter((student): student is Student => {
        if (!student) return false;
        const projectedCount = getProjectedCount(student);
        const limit = courseMap[student.course].limit;
        return projectedCount > limit;
      });

    if (overLimitStudents.length > 0) {
      setStudentsToConfirm(overLimitStudents);
    } else {
      handleFinalSave();
    }
  };

  const handleFinalSave = async () => {
    if (!slot) return;
    setIsSaving(true);
    await onSave(slot.slotId, selectedStudentIds);
    setIsSaving(false);
    onOpenChange(false);
    setStudentsToConfirm([]);
  };

  const capacity = slot?.capacity || 0;
  const isOverCapacity = selectedStudentIds.length > capacity;
  
  const getProjectedCount = (student: Student) => {
      const currentCount = studentMonthlyCounts[student.uid] ?? 0;
      const isOriginallyInSlot = slot ? slot.assignedStudentIds.includes(student.uid) : false;
      const isNowSelected = selectedStudentIds.includes(student.uid);
      
      if (isNowSelected && !isOriginallyInSlot) return currentCount + 1;
      if (!isNowSelected && isOriginallyInSlot) return currentCount - 1;
      return currentCount;
  }
  
  const sortedStudents = useMemo(() => {
    return allStudents.filter(s => s.isActive).sort((a,b) => a.name.localeCompare(b.name, 'ja'));
  }, [allStudents]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>生徒の割り当て</DialogTitle>
            <DialogDescription>
              {slot ? `${format(new Date(slot.date), 'M月d日')} ${slot.startTime}` : ''} の枠を編集します。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center pr-2">
              <p className="text-sm font-medium">定員: {selectedStudentIds.length} / {capacity}</p>
              {isOverCapacity && <Badge variant="destructive">定員オーバー</Badge>}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedStudents.map(student => {
                const limit = courseMap[student.course].limit;
                const projectedCount = getProjectedCount(student);
                const isOverLimit = projectedCount > limit;
                const isSelected = selectedStudentIds.includes(student.uid);
                const isPreferredSlot = student.preferredSlot.enabled && student.preferredSlot.slotKey === slot?.startTime;

                return (
                    <Card
                      key={student.uid}
                      onClick={() => {
                        setSelectedStudentIds(prev =>
                          isSelected ? prev.filter(id => id !== student.uid) : [...prev, student.uid]
                        );
                      }}
                      className={cn(
                        "p-3 flex flex-col justify-between cursor-pointer transition-all",
                        isSelected ? "ring-2 ring-primary bg-primary/10" : "bg-muted/40 hover:bg-muted"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm pr-2">{student.name}</span>
                        {isPreferredSlot && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400 shrink-0" />}
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <Badge variant="outline" className="font-normal text-xs">{courseMap[student.course].name}</Badge>
                        <span className={cn('text-xs', isOverLimit ? 'text-destructive font-bold' : 'text-muted-foreground')}>
                          今月 {projectedCount}/{limit}
                        </span>
                      </div>
                    </Card>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
            <Button onClick={handleAttemptSave} disabled={isSaving || isOverCapacity}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={studentsToConfirm.length > 0} onOpenChange={() => setStudentsToConfirm([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>月間上限超過の確認</AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                <p>以下の生徒は月間の授業回数上限を超えます。本当に割り当てますか？</p>
                <ul className="mt-2 list-disc list-inside">
                  {studentsToConfirm.map(s => <li key={s.uid}>{s.name}</li>)}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalSave}>続行する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const { toast } = useToast();

  const weekendDays = useMemo(() => {
    if (!appSettings) return [];
    
    const monthKey = format(currentMonth, 'yyyy-MM');
    const activeDates = appSettings.activeDatesByMonth[monthKey] || getDefaultActiveDatesForMonth(currentMonth);

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end }).map(day => ({
        day,
        isWeekend: isSaturday(day) || isSunday(day),
        isActive: activeDates.includes(format(day, 'yyyy-MM-dd'))
    })).filter(d => d.isWeekend);

  }, [currentMonth, appSettings]);

  const fetchData = async (month: Date) => {
    setLoading(true);
    try {
        const [slotsData, studentsData, settingsData] = await Promise.all([
            getSlotsForMonth(month),
            getAllStudents(),
            getAppSettings()
        ]);
        setSlots(slotsData);
        setAllStudents(studentsData);
        setAppSettings(settingsData);
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
            <Button variant="outline" disabled>
                <Settings className="mr-2 h-4 w-4" />
                開講日設定 (準備中)
            </Button>
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
            {weekendDays.map(({day, isActive}) => {
              const dayString = format(day, 'yyyy-MM-dd');
              const daySlots = isActive ? slots.filter(s => s.date === dayString) : [];
              
              return (
                <div key={day.toString()} className={cn("flex flex-col border-r last:border-r-0 w-32", !isActive && "bg-muted/30")}>
                  <Link href={isActive ? `/admin/day/${dayString}` : '#'} className={cn("block", isActive && "hover:bg-muted/50", !isActive && "cursor-not-allowed")}>
                    <div className={cn("p-3 text-center border-b font-semibold", isSunday(day) ? "text-destructive" : "", !isActive && "text-muted-foreground")}>
                      <p>{format(day, 'd')}</p>
                      <p className="text-xs">{format(day, 'E', { locale: ja })}</p>
                    </div>
                  </Link>
                  <div className="flex-grow">
                    {fixedTimeSlotsDefinition.map(timeDef => {
                      if (!isActive) {
                        return <div key={timeDef.startTime} className="h-24 border-b p-2 text-xs text-muted-foreground flex items-center justify-center">休講</div>
                      }
                      
                      const slot = daySlots.find(s => s.startTime === timeDef.startTime);
                      if (!slot) {
                          const mockSlot: TimeSlot = {
                              slotId: `${dayString}-${timeDef.startTime}`,
                              date: dayString,
                              startTime: timeDef.startTime,
                              endTime: timeDef.endTime,
                              capacity: 4,
                              assignedStudentIds: [],
                          };
                          return (
                             <div key={mockSlot.slotId} className={cn("h-24 border-b p-2 text-xs relative group")}>
                                <p className="font-semibold">{mockSlot.startTime}</p>
                                <div className="text-sm">残{mockSlot.capacity}</div>
                                <p className="text-muted-foreground">0/{mockSlot.capacity}人</p>
                                <Button
                                    variant="ghost" size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setEditingSlot(mockSlot)}
                                >
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                             </div>
                          )
                      }
                      
                      const occupancy = slot.assignedStudentIds.length;
                      const capacity = slot.capacity;
                      const isFull = occupancy >= capacity;
                      const remaining = capacity - occupancy;
                      
                      return (
                        <div key={slot.slotId} className={cn("h-24 border-b p-2 text-xs relative group")}>
                          <p className="font-semibold">{slot.startTime}</p>
                          <div className={cn('text-sm', isFull ? 'text-destructive font-bold' : '')}>
                              {isFull ? '満席' : `残${remaining}`}
                          </div>
                          <p className="text-muted-foreground">{occupancy}/{capacity}人</p>
                          
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
          currentMonth={currentMonth}
        />
      </div>
    </TooltipProvider>
  );
}
