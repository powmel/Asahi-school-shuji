"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loading } from '@/components/shared/Loading';
import { cn } from '@/lib/utils';
import {
  getAllStudents,
  getSlotsForMonth,
  updateSlotAssignments,
  moveStudentBetweenSlots,
  getAppSettings,
  getDefaultActiveDatesForMonth,
  getMonthlyLessonCounts
} from '@/lib/data';
import type { Student, TimeSlot, AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const courseMap: { [key in Student['course']]: { name: string; limit: number } } = {
  '2perMonth': { name: '月2', limit: 2 },
  '3perMonth': { name: '月3', limit: 3 },
};

type StudentWithUsage = Student & { usage: number };

function StudentCard({ student, selected, onSelect }: { student: StudentWithUsage, selected: boolean, onSelect: () => void }) {
  const { limit } = courseMap[student.course];
  const isOverLimit = student.usage >= limit;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all w-full h-16 flex-shrink-0 relative",
        selected ? "border-primary ring-2 ring-primary bg-primary/10" : "bg-card hover:bg-muted/50",
        isOverLimit ? "border-yellow-500 bg-yellow-500/10" : ""
      )}
    >
      <div className='flex flex-col'>
        <p className="font-semibold text-sm truncate">{student.name}</p>
        <p className={cn("text-xs", isOverLimit ? "text-yellow-600 font-bold" : "text-muted-foreground")}>
          {student.usage} / {limit}回
        </p>
      </div>
      <Badge variant="outline" className="text-xs">{courseMap[student.course].name}</Badge>
      {student.preferredSlot.enabled && <Star className="h-3 w-3 text-yellow-500 fill-yellow-400 absolute top-1 right-1" />}
    </div>
  );
}

function DateBucket({
  date,
  students,
  slots,
  onSelectDate,
  onRemoveStudent,
  onSelectStudent,
  selectedStudentId,
  sourceSlotId,
}: {
  date: string;
  students: Student[];
  slots: TimeSlot[];
  onSelectDate: () => void;
  onRemoveStudent: (studentId: string, date: string) => void;
  onSelectStudent: (studentId: string, slotId: string) => void;
  selectedStudentId: string | null;
  sourceSlotId: string | null;
}) {
  const totalCapacity = slots.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = slots.reduce((acc, s) => acc + s.assignedStudentIds.length, 0);
  const dateObj = new Date(date);

  return (
    <Card
      onClick={onSelectDate}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md h-full flex flex-col",
      )}
    >
      <CardHeader className="text-center pb-2">
        <CardTitle className={cn("text-lg", dateObj.getDay() === 0 ? "text-destructive" : "")}>
          {format(dateObj, 'd')}
          <span className="text-sm font-normal ml-1">({format(dateObj, 'E', { locale: ja })})</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{totalOccupancy} / {totalCapacity} 人</p>
      </CardHeader>
      <CardContent className="flex-grow bg-muted/20 rounded-b-lg p-2 space-y-1 overflow-y-auto">
        {students.map(student => {
          const studentSlot = slots.find(s => s.assignedStudentIds.includes(student.uid));
          const isSelectedFromHere = selectedStudentId === student.uid && sourceSlotId === studentSlot?.slotId;

          return (
            <div
              key={student.uid}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (studentSlot) onSelectStudent(student.uid, studentSlot.slotId); 
              }}
              className={cn(
                "group bg-background p-1.5 rounded-md text-xs flex items-center justify-between cursor-pointer",
                isSelectedFromHere && "ring-2 ring-primary"
              )}
            >
              <span className="truncate">{student.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); onRemoveStudent(student.uid, date); }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}

function SlotAssignmentPanel({
  slots,
  allStudents,
  onAssign,
  onUnassign,
  onSelectStudent,
  selectedStudentId,
  sourceSlotId,
}: {
  slots: TimeSlot[];
  allStudents: Student[];
  onAssign: (studentId: string, slotId: string) => void;
  onUnassign: (studentId: string, slotId: string) => void;
  onSelectStudent: (studentId: string, slotId: string) => void;
  selectedStudentId: string | null;
  sourceSlotId: string | null;
}) {
  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1">
      {slots.map(slot => {
        const isFull = slot.assignedStudentIds.length >= slot.capacity;
        const isSelectedStudentInThisSlot = selectedStudentId && slot.assignedStudentIds.includes(selectedStudentId);

        return (
          <div
            key={slot.slotId}
            className={cn(
              "p-3 border rounded-lg",
              selectedStudentId && !isFull && !isSelectedStudentInThisSlot && "cursor-pointer hover:bg-muted/50",
              isSelectedStudentInThisSlot && "cursor-pointer bg-primary/5 border-primary",
              isFull && !isSelectedStudentInThisSlot && "cursor-not-allowed bg-muted/40"
            )}
            onClick={() => {
                if (selectedStudentId) {
                    if (isSelectedStudentInThisSlot) {
                        onUnassign(selectedStudentId, slot.slotId);
                    } else if (!isFull) {
                        onAssign(selectedStudentId, slot.slotId);
                    }
                }
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">{slot.startTime}</p>
              <p className={cn("text-sm", isFull ? "text-destructive font-bold" : "")}>
                {slot.assignedStudentIds.length} / {slot.capacity}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {slot.assignedStudentIds.map(studentId => {
                const student = allStudents.find(s => s.uid === studentId);
                const isSelectedFromHere = selectedStudentId === studentId && sourceSlotId === slot.slotId;

                return (
                  <div
                    key={studentId}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onSelectStudent(studentId, slot.slotId); 
                    }}
                    className={cn(
                      "group bg-muted/50 p-1.5 rounded-md text-xs flex items-center justify-between cursor-pointer",
                      isSelectedFromHere && "ring-2 ring-primary"
                    )}
                  >
                    <span className="truncate">{student?.name || '不明'}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); onUnassign(studentId, slot.slotId); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MonthlySchedulerPage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentUsage, setStudentUsage] = useState<Record<string, number>>({});
  const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [sourceSlotId, setSourceSlotId] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSlotPanelOpen, setIsSlotPanelOpen] = useState(false);

  const { toast } = useToast();

  const studentsWithUsage = useMemo((): StudentWithUsage[] => {
    return allStudents
      .filter(s => s.isActive)
      .map(s => ({ ...s, usage: studentUsage[s.uid] || 0 }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  }, [allStudents, studentUsage]);

  const activeDates = useMemo(() => {
    if (!appSettings) return [];
    const monthKey = format(currentMonth, 'yyyy-MM');
    return appSettings.activeDatesByMonth[monthKey] || getDefaultActiveDatesForMonth(currentMonth);
  }, [currentMonth, appSettings]);

  const fetchData = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const [studentsData, slotsData, settingsData, usage] = await Promise.all([
        getAllStudents(),
        getSlotsForMonth(month),
        getAppSettings(),
        getMonthlyLessonCounts(month)
      ]);
      setAllStudents(studentsData);
      setAllSlots(slotsData);
      setAppSettings(settingsData);
      setStudentUsage(usage);
    } catch (error) {
      toast({ title: "エラー", description: "データの取得に失敗しました。", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(currentMonth);
  }, [currentMonth, fetchData]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
    setSelectedDate(null);
    setSelectedStudentId(null);
    setSourceSlotId(null);
  };

  const handleSelectStudentFromPool = (studentId: string) => {
    if (selectedStudentId === studentId && sourceSlotId === null) {
      setSelectedStudentId(null);
    } else {
      setSelectedStudentId(studentId);
      setSourceSlotId(null);
    }
  };

  const handleSelectStudentFromBucket = (studentId: string, slotId: string) => {
    if (selectedStudentId === studentId && sourceSlotId === slotId) {
      setSelectedStudentId(null);
      setSourceSlotId(null);
    } else {
      setSelectedStudentId(studentId);
      setSourceSlotId(slotId);
    }
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    if (selectedStudentId) {
      addStudentToDate(selectedStudentId, date);
    } else {
      setIsSlotPanelOpen(true);
    }
  };
  
  const addStudentToDate = async (studentId: string, date: string) => {
      const student = studentsWithUsage.find(s => s.uid === studentId);
      if (!student) return;

      const dateSlots = allSlots.filter(s => s.date === date);
      const existingSlotOnDate = dateSlots.find(s => s.assignedStudentIds.includes(studentId));

      // 同じ日の別の枠に移動する場合
      const isInternalMove = sourceSlotId && allSlots.find(s => s.slotId === sourceSlotId)?.date === date;

      if (existingSlotOnDate && !isInternalMove) {
        toast({ title: "重複", description: "この生徒は既にこの日に予約があります。", variant: "default" });
        setSelectedStudentId(null);
        setSourceSlotId(null);
        return;
      }

      // 「移動」の場合は上限チェックをスキップ
      const effectiveSourceSlotId = sourceSlotId || allSlots.find(s => s.assignedStudentIds.includes(studentId))?.slotId || null;
      const isMove = effectiveSourceSlotId !== null;

      if (!isMove) {
          const { limit } = courseMap[student.course];
          if (student.usage >= limit) {
              toast({
                  title: "上限超過",
                  description: `「${student.name}」さんは今月の上限 ${limit} 回に達しています。`,
                  variant: "default",
              });
              return;
          }
      }
      
      const availableSlot = dateSlots.sort((a,b) => a.startTime.localeCompare(b.startTime)).find(s => s.assignedStudentIds.length < s.capacity);

      if (availableSlot) {
        await handleAssignToSlot(studentId, availableSlot.slotId);
      } else {
        toast({ title: "満席", description: "この日の空きスロットがありません。", variant: "destructive" });
      }
      setSelectedStudentId(null);
      setSourceSlotId(null);
  }
  
  const handleAssignToSlot = async (studentId: string, slotId: string) => {
    const student = studentsWithUsage.find(s => s.uid === studentId);
    if (!student) return;

    const targetSlot = allSlots.find(s => s.slotId === slotId);
    if (!targetSlot) return;

    if (targetSlot.assignedStudentIds.length >= targetSlot.capacity) {
        toast({ title: "満席", description: "このスロットは満席です。", variant: "destructive" });
        return;
    }

    // すでに別のスロットにいる場合は移動扱いにする
    const effectiveSourceSlotId = sourceSlotId || allSlots.find(s => s.assignedStudentIds.includes(studentId))?.slotId || null;
    const isMove = effectiveSourceSlotId !== null;

    if (!isMove) {
        const { limit } = courseMap[student.course];
        if (student.usage >= limit) {
            toast({
                title: "上限超過",
                description: `「${student.name}」さんは今月の上限 ${limit} 回に達しています。`,
                variant: "default",
            });
            return;
        }
    }

    try {
        if (isMove) {
            await moveStudentBetweenSlots(studentId, effectiveSourceSlotId!, slotId);
            toast({ title: "成功", description: `レッスンを移動しました。` });
        } else {
            const newStudentIds = Array.from(new Set([...targetSlot.assignedStudentIds, studentId]));
            await updateSlotAssignments(slotId, newStudentIds);
            toast({ title: "成功", description: `レッスンを追加しました。` });
        }
        
        await fetchData(currentMonth);
        setIsSlotPanelOpen(false);
        setSelectedStudentId(null);
        setSourceSlotId(null);

    } catch (error) {
        const message = error instanceof Error ? error.message : "割り当ての更新に失敗しました。";
        toast({ title: "エラー", description: message, variant: "destructive" });
    }
  };

  const handleUnassign = async (studentId: string, slotId: string) => {
    try {
        const targetSlot = allSlots.find(s => s.slotId === slotId);
        if (!targetSlot) return;
        
        const newStudentIds = targetSlot.assignedStudentIds.filter(id => id !== studentId);
        await updateSlotAssignments(slotId, newStudentIds);
        
        toast({ title: "成功", description: `割り当てを解除しました。` });
        await fetchData(currentMonth);
    } catch (error) {
        toast({ title: "エラー", description: "解除に失敗しました。", variant: "destructive" });
    }
  }

  const handleRemoveStudentFromDate = async (studentId: string, date: string) => {
    const slot = allSlots.find(s => s.date === date && s.assignedStudentIds.includes(studentId));
    if (slot) {
      await handleUnassign(studentId, slot.slotId);
    }
  };

  useEffect(() => {
    if(!isSlotPanelOpen) {
        setSelectedDate(null);
    }
  }, [isSlotPanelOpen]);

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="月間割り振り">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-32 text-center font-headline font-semibold text-lg">
            {format(currentMonth, 'yyyy年 M月')}
          </span>
          <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 grid md:grid-cols-3 gap-4 overflow-hidden">
        <div className="flex flex-col min-h-0">
            <h3 className="font-headline text-lg mb-2 px-1">生徒プール</h3>
            <ScrollArea className="flex-1 pr-2">
                <div className="grid grid-cols-2 gap-2">
                    {studentsWithUsage.map(student => (
                    <StudentCard
                        key={student.uid}
                        student={student}
                        selected={selectedStudentId === student.uid && sourceSlotId === null}
                        onSelect={() => handleSelectStudentFromPool(student.uid)}
                    />
                    ))}
                </div>
            </ScrollArea>
        </div>

        <div className="md:col-span-2 flex flex-col min-h-0">
            <h3 className="font-headline text-lg mb-2 px-1">日付バケツ</h3>
            <ScrollArea className='flex-1' hideScrollbar>
                <div className="grid md:grid-cols-2 gap-4 pb-4">
                    {activeDates.map(date => {
                        const dateSlots = allSlots.filter(s => s.date === date);
                        const studentIdsOnDate = new Set(dateSlots.flatMap(s => s.assignedStudentIds));
                        const studentsOnDate = allStudents.filter(s => studentIdsOnDate.has(s.uid));
                        return (
                        <DateBucket
                            key={date}
                            date={date}
                            students={studentsOnDate}
                            slots={dateSlots}
                            onSelectDate={() => handleSelectDate(date)}
                            onRemoveStudent={handleRemoveStudentFromDate}
                            onSelectStudent={handleSelectStudentFromBucket}
                            selectedStudentId={selectedStudentId}
                            sourceSlotId={sourceSlotId}
                        />
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
      </div>
      
      <Dialog open={isSlotPanelOpen} onOpenChange={setIsSlotPanelOpen}>
        <DialogContent className="max-w-md bg-background">
            <DialogHeader>
                <DialogTitle>時間スロット割り当て</DialogTitle>
                <DialogDescription>
                    {selectedDate ? format(new Date(selectedDate), 'yyyy年M月d日', {locale: ja}) : ''}
                </DialogDescription>
            </DialogHeader>
             {selectedDate ? (
              <SlotAssignmentPanel
                slots={allSlots.filter(s => s.date === selectedDate).sort((a,b) => a.startTime.localeCompare(b.startTime))}
                allStudents={allStudents}
                onAssign={handleAssignToSlot}
                onUnassign={handleUnassign}
                onSelectStudent={handleSelectStudentFromBucket}
                selectedStudentId={selectedStudentId}
                sourceSlotId={sourceSlotId}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground bg-muted/20 rounded-lg">
                <p>エラー：日付が選択されていません</p>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
