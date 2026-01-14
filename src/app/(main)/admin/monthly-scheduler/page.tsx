
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
  countStudentLessonsInMonth,
  updateSlotAssignments,
  getAppSettings,
  getDefaultActiveDatesForMonth
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
}: {
  date: string;
  students: Student[];
  slots: TimeSlot[];
  onSelectDate: () => void;
  onRemoveStudent: (studentId: string, date: string) => void;
  onSelectStudent: (studentId: string) => void;
  selectedStudentId: string | null;
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
        {students.map(student => (
          <div
            key={student.uid}
            onClick={(e) => { e.stopPropagation(); onSelectStudent(student.uid); }}
            className={cn(
              "group bg-background p-1.5 rounded-md text-xs flex items-center justify-between cursor-pointer",
              selectedStudentId === student.uid && "ring-2 ring-primary"
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
        ))}
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
}: {
  slots: TimeSlot[];
  allStudents: Student[];
  onAssign: (studentId: string, slotId: string) => void;
  onUnassign: (studentId: string, slotId: string) => void;
  onSelectStudent: (studentId: string) => void;
  selectedStudentId: string | null;
}) {
  const { toast } = useToast();
  const studentsWithUsage = useMemo((): StudentWithUsage[] => {
    return allStudents
      .map(s => ({ ...s, usage: 0 /* This usage is not real-time, just for type compliance */ }))
  }, [allStudents]);


  const handleSlotClick = (slot: TimeSlot) => {
    if (selectedStudentId) {
       const student = studentsWithUsage.find(s => s.uid === selectedStudentId);
       if (!student) return;

       if (slot.assignedStudentIds.includes(selectedStudentId)) {
        // If student is already in this slot, unassign
        onUnassign(selectedStudentId, slot.slotId);
      } else {
        // If student is not in this slot, try to assign
        onAssign(selectedStudentId, slot.slotId);
      }
    }
  }

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1">
      {slots.map(slot => {
        const isFull = slot.assignedStudentIds.length >= slot.capacity;
        return (
          <div
            key={slot.slotId}
            className={cn(
              "p-3 border rounded-lg",
              selectedStudentId && !isFull && "cursor-pointer hover:bg-muted/50",
               selectedStudentId && slot.assignedStudentIds.includes(selectedStudentId) && "cursor-pointer hover:bg-muted/50", // Allow un-assigning
              isFull && !slot.assignedStudentIds.includes(selectedStudentId || '') && "cursor-not-allowed bg-muted/40"
            )}
            onClick={() => {
                if (selectedStudentId && !isFull && !slot.assignedStudentIds.includes(selectedStudentId)) {
                     handleSlotClick(slot);
                } else if (selectedStudentId && slot.assignedStudentIds.includes(selectedStudentId)) {
                     handleSlotClick(slot);
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
                return (
                  <div
                    key={studentId}
                    onClick={(e) => { e.stopPropagation(); onSelectStudent(studentId); }}
                    className={cn(
                      "group bg-muted/50 p-1.5 rounded-md text-xs flex items-center justify-between cursor-pointer",
                      selectedStudentId === studentId && "ring-2 ring-primary"
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSlotPanelOpen, setIsSlotPanelOpen] = useState(false);

  const { toast } = useToast();

  const studentsWithUsage = useMemo((): StudentWithUsage[] => {
    return allStudents
      .filter(s => s.isActive)
      .map(s => ({ ...s, usage: studentUsage[s.uid] || 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allStudents, studentUsage]);

  const activeDates = useMemo(() => {
    if (!appSettings) return [];
    const monthKey = format(currentMonth, 'yyyy-MM');
    return appSettings.activeDatesByMonth[monthKey] || getDefaultActiveDatesForMonth(currentMonth);
  }, [currentMonth, appSettings]);

  const fetchData = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const [studentsData, slotsData, settingsData] = await Promise.all([
        getAllStudents(),
        getSlotsForMonth(month),
        getAppSettings()
      ]);
      setAllStudents(studentsData);
      setAllSlots(slotsData);
      setAppSettings(settingsData);

      const usage: Record<string, number> = {};
      await Promise.all(studentsData.map(async (student) => {
        usage[student.uid] = await countStudentLessonsInMonth(student.uid, month);
      }));
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
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(prev => (prev === studentId ? null : studentId));
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    if (selectedStudentId) {
      addStudentToDate(selectedStudentId, date);
    } else {
      setIsSlotPanelOpen(true);
    }
  };
  
  // New logic to just ADD a student to a date
  const addStudentToDate = async (studentId: string, date: string) => {
      const student = studentsWithUsage.find(s => s.uid === studentId);
      if (!student) return;

      const { limit } = courseMap[student.course];
      const currentUsage = student.usage;

      if (currentUsage >= limit) {
          toast({
              title: "上限超過",
              description: `「${student.name}」さんは今月の上限 ${limit} 回に達しています。`,
              variant: "default",
          });
          return;
      }
      
      const dateSlots = allSlots.filter(s => s.date === date);
      if (dateSlots.some(s => s.assignedStudentIds.includes(studentId))) {
        toast({ title: "重複", description: "この生徒は既にこの日に予約があります。", variant: "default" });
        return;
      }
      
      const availableSlot = dateSlots.sort((a,b) => a.startTime.localeCompare(b.startTime)).find(s => s.assignedStudentIds.length < s.capacity);

      if (availableSlot) {
        await handleAssignment(studentId, availableSlot.slotId, true);
      } else {
        toast({ title: "満席", description: "この日の空きスロットがありません。", variant: "destructive" });
      }
      setSelectedStudentId(null); // Deselect student after action
  }
  
  // Unified assignment handler
  const handleAssignment = async (studentId: string, slotId: string, assign: boolean) => {
    try {
        const targetSlot = allSlots.find(s => s.slotId === slotId) || {
            slotId: slotId,
            date: slotId.substring(0, 10),
            startTime: slotId.substring(11),
            capacity: appSettings?.defaultSlotCapacity || 4,
            assignedStudentIds: []
        };
        
        let newTargetStudentIds: string[];
        if (assign) {
            // Prevent adding if slot is full
            if (targetSlot.assignedStudentIds.length >= targetSlot.capacity && !targetSlot.assignedStudentIds.includes(studentId)) {
                toast({ title: "満席", description: "このスロットは満席です。", variant: "destructive" });
                return;
            }
            newTargetStudentIds = Array.from(new Set([...targetSlot.assignedStudentIds, studentId]));
        } else {
            newTargetStudentIds = targetSlot.assignedStudentIds.filter(id => id !== studentId);
        }

        await updateSlotAssignments(slotId, newTargetStudentIds);
        
        toast({ title: "成功", description: `割り当てを更新しました。` });
        await fetchData(currentMonth); // Re-fetch all data to ensure consistency

    } catch (error) {
        const message = error instanceof Error ? error.message : "割り当ての更新に失敗しました。";
        toast({ title: "エラー", description: message, variant: "destructive" });
    } finally {
        setSelectedStudentId(null);
    }
  };

  const handleRemoveStudentFromDate = async (studentId: string, date: string) => {
    const slot = allSlots.find(s => s.date === date && s.assignedStudentIds.includes(studentId));
    if (slot) {
      await handleAssignment(studentId, slot.slotId, false);
    } else {
      toast({ title: "エラー", description: "削除対象の予約が見つかりません。", variant: "destructive" });
    }
  };

  const handleAssignToSlot = (studentId: string, slotId: string) => {
    const student = studentsWithUsage.find(s => s.uid === studentId);
    if (!student) return;

    const { limit } = courseMap[student.course];
    const currentUsage = student.usage;
    const isAlreadyInSlot = allSlots.find(s => s.slotId === slotId)?.assignedStudentIds.includes(studentId);

    if (!isAlreadyInSlot && currentUsage >= limit) {
        toast({
            title: "上限超過",
            description: `「${student.name}」さんは今月の上限 ${limit} 回に達しています。`,
            variant: "default",
        });
        return;
    }

    handleAssignment(studentId, slotId, true);
    setIsSlotPanelOpen(false);
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
        {/* Zone A: Student Pool */}
        <div className="flex flex-col min-h-0">
            <h3 className="font-headline text-lg mb-2 px-1">生徒プール</h3>
            <ScrollArea className="flex-1 pr-2">
                <div className="grid grid-cols-2 gap-2">
                    {studentsWithUsage.map(student => (
                    <StudentCard
                        key={student.uid}
                        student={student}
                        selected={selectedStudentId === student.uid}
                        onSelect={() => handleSelectStudent(student.uid)}
                    />
                    ))}
                </div>
            </ScrollArea>
        </div>

        {/* Zone B: Date Buckets */}
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
                            onSelectStudent={handleSelectStudent}
                            selectedStudentId={selectedStudentId}
                        />
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
      </div>
      
      <Dialog open={isSlotPanelOpen} onOpenChange={setIsSlotPanelOpen}>
        <DialogContent className="max-w-md">
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
                onUnassign={(studentId, slotId) => handleAssignment(studentId, slotId, false)}
                onSelectStudent={handleSelectStudent}
                selectedStudentId={selectedStudentId}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-lg">
                <p>エラー：日付が選択されていません</p>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
    
    

    
