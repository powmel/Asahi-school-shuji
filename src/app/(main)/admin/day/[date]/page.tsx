
"use client"

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/shared/Loading';
import { getSlotsForDay, getAllStudents, fixedTimeSlotsDefinition, updateSlotAssignments, moveStudentBetweenSlots } from '@/lib/data';
import type { TimeSlot, Student } from '@/lib/types';
import { format, parseISO, isSaturday, isSunday, addDays, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, UserPlus, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EditSlotDialog } from '@/app/(main)/admin/schedule/page';
import { useToast } from '@/hooks/use-toast';


const courseMap: { [key in Student['course']]: string } = {
  '2perMonth': '月2',
  '3perMonth': '月3',
};


function findNextWeekend(date: Date) {
  let currentDate = date;
  while (!isSaturday(currentDate) && !isSunday(currentDate)) {
    currentDate = addDays(currentDate, 1);
  }
  return currentDate;
}


export default function DayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;
  const { toast } = useToast();

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [movingStudent, setMovingStudent] = useState<{ studentId: string, slotId: string } | null>(null);

  const currentDate = useMemo(() => parseISO(date), [date]);
  const currentMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);

  const fetchData = () => {
    if (date) {
        setLoading(true);
        Promise.all([
            getSlotsForDay(date),
            getAllStudents(),
        ]).then(([slotsData, studentsData]) => {
            const allPossibleSlots = fixedTimeSlotsDefinition.map(timeDef => {
                const existingSlot = slotsData.find(s => s.startTime === timeDef.startTime);
                if (existingSlot) {
                    return existingSlot;
                }
                return {
                    slotId: `${date}-${timeDef.startTime}`,
                    date: date,
                    startTime: timeDef.startTime,
                    endTime: timeDef.endTime,
                    capacity: 4,
                    assignedStudentIds: [],
                };
            });

            setSlots(allPossibleSlots);
            setAllStudents(studentsData);
            setLoading(false);
        });
    }
  }

  useEffect(() => {
    fetchData();
  }, [date]);
  
  const handleTodayClick = () => {
    const today = new Date();
    const targetDay = isSaturday(today) || isSunday(today) ? today : findNextWeekend(today);
    router.push(`/admin/day/${format(targetDay, 'yyyy-MM-dd')}`);
  }
  
  const handleNav = (direction: 'prev' | 'next') => {
      let dayToFind = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
      while(!isSaturday(dayToFind) && !isSunday(dayToFind)) {
          dayToFind = direction === 'prev' ? subDays(dayToFind, 1) : addDays(dayToFind, 1);
      }
      router.push(`/admin/day/${format(dayToFind, 'yyyy-MM-dd')}`);
  }
  
  const handleSlotSave = async (slotId: string, studentIds: string[]) => {
    try {
        await updateSlotAssignments(slotId, studentIds);
        toast({ title: "成功", description: "スロットが更新されました。" });
        fetchData();
    } catch (error) {
        const message = error instanceof Error ? error.message : "更新に失敗しました。";
        toast({ title: "エラー", description: message, variant: "destructive" });
    }
  };

  const handleMoveExecute = async (targetSlotId: string) => {
    if (!movingStudent) return;
    try {
        await moveStudentBetweenSlots(movingStudent.studentId, movingStudent.slotId, targetSlotId);
        toast({ title: "移動完了", description: "レッスンを移動しました。" });
        setMovingStudent(null);
        fetchData();
    } catch (error: any) {
        toast({ title: "エラー", description: error.message || "移動に失敗しました。", variant: "destructive" });
    }
  };


  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="運営詳細">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTodayClick}>今日</Button>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleNav('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="w-40 text-center font-headline font-semibold text-lg">
                    {format(currentDate, 'yyyy年 M月 d日 (E)', { locale: ja })}
                </span>
                <Button variant="outline" size="icon" onClick={() => handleNav('next')}><ChevronRight className="h-4 w-4" /></Button>
            </div>
        </div>
      </PageHeader>

      {movingStudent && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-medium">
                <span className="font-bold">{allStudents.find(s => s.uid === movingStudent.studentId)?.name}</span> さんの移動先を選択してください。
            </p>
            <Button variant="ghost" size="sm" onClick={() => setMovingStudent(null)}>キャンセル</Button>
        </div>
      )}

      <div className="space-y-4">
        {slots.map(slot => {
          const occupancy = slot.assignedStudentIds.length;
          const capacity = slot.capacity;
          const isFull = occupancy >= capacity;
          const isMovingToThisSlot = movingStudent && movingStudent.slotId !== slot.slotId;

          return (
            <Card key={slot.slotId} className={cn(movingStudent?.slotId === slot.slotId ? 'border-primary ring-1 ring-primary' : '')}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-headline text-xl">{slot.startTime} - {slot.endTime}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={cn('font-semibold mr-4', isFull ? 'text-destructive' : '')}>{isFull ? '満席' : `残り${capacity - occupancy}`}</span>
                    {isMovingToThisSlot ? (
                        <Button size="sm" disabled={isFull} onClick={() => handleMoveExecute(slot.slotId)}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            ここに移動
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setEditingSlot(slot)}>
                            <UserPlus className="mr-2 h-4 w-4"/>
                            追加・編集
                        </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {slot.assignedStudentIds.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slot.assignedStudentIds.map(studentId => {
                      const student = allStudents.find(s => s.uid === studentId);
                      const isSelectedForMove = movingStudent?.studentId === studentId && movingStudent?.slotId === slot.slotId;
                      
                      return student ? (
                        <div 
                            key={studentId} 
                            onClick={() => setMovingStudent(isSelectedForMove ? null : { studentId, slotId: slot.slotId })}
                            className={cn(
                                "p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all border",
                                isSelectedForMove ? "border-primary bg-primary/10 ring-2 ring-primary" : "bg-muted/50 hover:bg-muted border-transparent"
                            )}
                        >
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            {student.displayTag && <p className="text-sm text-muted-foreground">{student.displayTag}</p>}
                          </div>
                          <Badge variant="outline">{courseMap[student.course]}</Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <p>この時間帯の予約はありません。</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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
  );
}
