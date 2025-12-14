
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const courseMap: { [key in Student['course']]: { name: string; limit: number } } = {
  '2perMonth': { name: '月2', limit: 2 },
  '3perMonth': { name: '月3', limit: 3 },
};

type StudentWithUsage = Student & { usage: number };

function StudentCard({ student, selected, onSelect }: { student: StudentWithUsage, selected: boolean, onSelect: () => void }) {
  const { limit } = courseMap[student.course];
  const isOverLimit = student.usage > limit;
  const isAtLimit = student.usage === limit;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-2 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all w-28 h-24 flex-shrink-0 relative",
        selected ? "border-primary ring-2 ring-primary bg-primary/10" : "bg-card hover:bg-muted/50",
        isOverLimit ? "border-destructive bg-destructive/10" : "",
        isAtLimit && !isOverLimit ? "border-yellow-500 bg-yellow-500/10" : ""
      )}
    >
      <p className="font-semibold text-sm text-center truncate w-full">{student.name}</p>
      <Badge variant="outline" className="mt-1 text-xs">{courseMap[student.course].name}</Badge>
      <p className={cn("text-xs mt-1", isOverLimit ? "text-destructive font-bold" : "text-muted-foreground")}>
        {student.usage} / {limit}
      </p>
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
        <CardTitle className={cn("text-lg", isSunday(dateObj) ? "text-destructive" : "")}>
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

function isSunday(date: Date) {
  return date.getDay() === 0;
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

  const handleSlotClick = (slot: TimeSlot) => {
    if (selectedStudentId) {
      onAssign(selectedStudentId, slot.slotId);
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
              isFull && "cursor-not-allowed bg-muted/40"
            )}
            onClick={() => !isFull && handleSlotClick(slot)}
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
  const [studentToConfirm, setStudentToConfirm] = useState<Student | null>(null);
  const [assignmentAction, setAssignmentAction] = useState<(() => void) | null>(null);
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
      assignStudent(selectedStudentId, date);
    } else {
      setIsSlotPanelOpen(true);
    }
  };

  const assignStudent = async (studentId: string, dateOrSlotId: string) => {
    const student = studentsWithUsage.find(s => s.uid === studentId);
    if (!student) return;

    const isSlotId = dateOrSlotId.includes(':');
    const targetDate = isSlotId ? allSlots.find(s => s.slotId === dateOrSlotId)?.date : dateOrSlotId;

    if (!targetDate) {
      toast({ title: "エラー", description: "有効な日付またはスロットではありません。", variant: "destructive" });
      return;
    }

    const originalSlot = allSlots.find(s => s.assignedStudentIds.includes(studentId) && s.date.startsWith(format(currentMonth, 'yyyy-MM')));

    const isSameDate = originalSlot?.date === targetDate;
    const isNewAssignmentToMonth = !originalSlot;
    const effectiveUsage = isNewAssignmentToMonth ? student.usage + 1 : student.usage;

    const { limit } = courseMap[student.course];
    if (effectiveUsage > limit && !isSameDate) {
      setStudentToConfirm(student);
      setAssignmentAction(() => () => {
        if (isSlotId) {
          handleAssignment(studentId, dateOrSlotId, true);
        } else {
          assignStudentToFirstAvailableSlot(studentId, dateOrSlotId);
        }
        setIsSlotPanelOpen(false);
      });
      return;
    }

    if (isSlotId) {
      await handleAssignment(studentId, dateOrSlotId, true);
      setIsSlotPanelOpen(false);
    } else {
      await assignStudentToFirstAvailableSlot(studentId, dateOrSlotId);
    }
  };

  const assignStudentToFirstAvailableSlot = async (studentId: string, date: string) => {
    const dateSlots = allSlots.filter(s => s.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const availableSlot = dateSlots.find(s => s.assignedStudentIds.length < s.capacity);

    if (availableSlot) {
      await handleAssignment(studentId, availableSlot.slotId, true);
    } else {
      toast({ title: "失敗", description: "この日の空きスロットがありません。", variant: "destructive" });
    }
    setSelectedStudentId(null);
  }

  const handleConfirmOverLimit = () => {
    if (assignmentAction) {
      assignmentAction();
    }
    setStudentToConfirm(null);
    setAssignmentAction(null);
  };

  const handleAssignment = async (studentId: string, slotId: string, assign: boolean) => {
    try {
      const student = allStudents.find(s => s.uid === studentId);
      if (!student) throw new Error("Student not found");

      const targetSlot = allSlots.find(s => s.slotId === slotId);
      if (!targetSlot) throw new Error("Slot not found");

      if (assign) {
        if (targetSlot.assignedStudentIds.length >= targetSlot.capacity && !targetSlot.assignedStudentIds.includes(studentId)) {
          toast({ title: "満席", description: "このスロットは満席です。", variant: "destructive" });
          return;
        }
        if (targetSlot.assignedStudentIds.includes(studentId)) {
          // Moving within the same day, do nothing here and wait for the un-assignment
        }
      }

      // First, remove from old slot if exists in the current month
      const originalSlot = allSlots.find(s => s.assignedStudentIds.includes(studentId) && s.date.startsWith(format(currentMonth, 'yyyy-MM')));
      if (originalSlot && originalSlot.slotId !== targetSlot.slotId) {
        await updateSlotAssignments(originalSlot.slotId, originalSlot.assignedStudentIds.filter(id => id !== studentId));
      }

      let newTargetStudentIds = targetSlot.assignedStudentIds.filter(id => id !== studentId);
      if (assign) {
        newTargetStudentIds.push(studentId);
      }

      await updateSlotAssignments(slotId, newTargetStudentIds);

      await fetchData(currentMonth); // Re-fetch all data to ensure consistency
      toast({ title: "成功", description: `割り当てを更新しました。` });

    } catch (error) {
      toast({ title: "エラー", description: "割り当ての更新に失敗しました。", variant: "destructive" });
    } finally {
      setSelectedStudentId(null);
    }
  };

  const handleRemoveStudentFromDate = async (studentId: string, date: string) => {
    const slot = allSlots.find(s => s.date === date && s.assignedStudentIds.includes(studentId));
    if (slot) {
      await handleAssignment(studentId, slot.slotId, false);
    }
  };

  const handleAssignToSlot = (studentId: string, slotId: string) => {
    assignStudent(studentId, slotId);
  };

  useEffect(() => {
    if(!isSlotPanelOpen) {
        setSelectedDate(null);
    }
  }, [isSlotPanelOpen]);

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
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

      {/* Zone A: Student Pool */}
      <div className="pb-4">
        <h3 className="font-headline text-lg mb-2 px-1">生徒プール</h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-4 px-1">
            {studentsWithUsage.map(student => (
              <StudentCard
                key={student.uid}
                student={student}
                selected={selectedStudentId === student.uid}
                onSelect={() => handleSelectStudent(student.uid)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Zone B: Date Buckets */}
      <div className="flex-grow pb-4 overflow-y-auto">
          <h3 className="font-headline text-lg mb-2 px-1">日付バケツ</h3>
          <div className="grid md:grid-cols-2 gap-4">
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

      <AlertDialog open={!!studentToConfirm} onOpenChange={(open) => !open && setStudentToConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>月間上限超過の確認</AlertDialogTitle>
            <AlertDialogDescription>
              {studentToConfirm && `「${studentToConfirm.name}」さんは${courseMap[studentToConfirm.course].name}ですが、この割り当てを行うと今月${(studentUsage[studentToConfirm.uid] || 0) + 1}回目になります。続行しますか？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToConfirm(null)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverLimit}>続行する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    