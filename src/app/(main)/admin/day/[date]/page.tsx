"use client"

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/shared/Loading';
import { getSlotsForDay, getAllStudents, fixedTimeSlotsDefinition } from '@/lib/data';
import type { TimeSlot, Student } from '@/lib/types';
import { format, parseISO, isSaturday, isSunday, addDays, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);

  const currentDate = useMemo(() => parseISO(date), [date]);

  useEffect(() => {
    if (date) {
      setLoading(true);
      Promise.all([
        getSlotsForDay(date),
        getAllStudents().then(studentList => {
          const studentMap: Record<string, Student> = {};
          studentList.forEach(s => studentMap[s.uid] = s);
          return studentMap;
        }),
      ]).then(([slotsData, studentMap]) => {
        setSlots(slotsData);
        setStudents(studentMap);
        setLoading(false);
      });
    }
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


  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="運営詳細">
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTodayClick}>今日</Button>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleNav('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="w-40 text-center font-headline font-semibold text-lg">
                    {format(currentDate, 'yyyy年 M月 d日 (E)', { locale: ja })}
                </span>
                <Button variant="outline" size="icon" onClick={() => handleNav('next')}><ChevronRight className="h-4 w-4" /></Button>
            </div>
        </div>
      </PageHeader>

      <div className="space-y-4">
        {fixedTimeSlotsDefinition.map(timeDef => {
          const slot = slots.find(s => s.startTime === timeDef.startTime);
          const occupancy = slot ? slot.assignedStudentIds.length : 0;
          const capacity = slot ? slot.capacity : fixedTimeSlotsDefinition.length > 0 ? DEFAULT_SLOT_CAPACITY : 0;
          const isFull = slot ? occupancy >= slot.capacity : false;

          return (
            <Card key={timeDef.startTime}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-headline text-xl">{timeDef.startTime} - {timeDef.endTime}</CardTitle>
                  <div>
                    <span className={cn('mr-4', isFull ? 'text-destructive font-bold' : '')}>{isFull ? '満席' : `残り${capacity - occupancy}`}</span>
                    <span className="text-muted-foreground">{occupancy} / {capacity}人</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {slot && slot.assignedStudentIds.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slot.assignedStudentIds.map(studentId => {
                      const student = students[studentId];
                      return student ? (
                        <div key={studentId} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.displayTag}</p>
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
        {!slots.length && (
            <div className="text-center text-muted-foreground py-16">
                <p>この日の授業スロットはありません。</p>
            </div>
        )}
      </div>
    </div>
  );
}

const DEFAULT_SLOT_CAPACITY = 4;
