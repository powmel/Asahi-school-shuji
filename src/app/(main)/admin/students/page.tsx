
"use client";

import { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FilePenLine, Trash2, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getAllStudents, updateStudent, deleteStudent, countStudentLessonsInMonth } from '@/lib/data';
import type { Student } from '@/lib/types';
import { Loading } from '@/components/shared/Loading';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';


const courseMap: { [key in Student['course']]: {name: string, limit: number} } = {
  '2perMonth': { name: '月2回コース', limit: 2 },
  '3perMonth': { name: '月3回コース', limit: 3 },
};

function PreferredSlotDialog({
    student,
    open,
    onOpenChange,
    onStudentUpdate
}: {
    student: Student,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onStudentUpdate: () => void,
}) {
    const [prefs, setPrefs] = useState(student.preferredSlot);
    const { toast } = useToast();

    useEffect(() => {
        setPrefs(student.preferredSlot);
    }, [student]);

    const handleSave = async () => {
        try {
            await updateStudent(student.uid, { preferredSlot: prefs });
            toast({ title: '成功', description: '希望日時を更新しました。'});
            onStudentUpdate();
            onOpenChange(false);
        } catch (e) {
            toast({ title: '失敗', description: '更新に失敗しました。', variant: 'destructive'});
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>授業時間指定</DialogTitle>
                    <DialogDescription>{student.name}さんの希望日時を設定します。有効にすると、空きがある場合に自動で予約が確保されます。</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch id="pref-enabled" checked={prefs.enabled} onCheckedChange={enabled => setPrefs(p => ({...p, enabled}))} />
                        <Label htmlFor="pref-enabled">希望日時を有効にする</Label>
                    </div>

                    <fieldset disabled={!prefs.enabled} className="space-y-4">
                         <div>
                            <Label className="text-base font-medium">希望曜日</Label>
                            <RadioGroup value={prefs.dow} onValueChange={(dow: 'sat' | 'sun' | 'either') => setPrefs(p => ({...p, dow}))} className="mt-2 grid grid-cols-3 gap-4">
                                <div><RadioGroupItem value="sat" id="dow-sat" className="peer sr-only" /><Label htmlFor="dow-sat" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">土曜日</Label></div>
                                <div><RadioGroupItem value="sun" id="dow-sun" className="peer sr-only" /><Label htmlFor="dow-sun" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">日曜日</Label></div>
                                <div><RadioGroupItem value="either" id="dow-either" className="peer sr-only" /><Label htmlFor="dow-either" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">どちらでも</Label></div>
                            </RadioGroup>
                        </div>
                        <div>
                             <Label htmlFor="slot-key" className="text-base font-medium">希望時間</Label>
                             <Select value={prefs.slotKey} onValueChange={(slotKey: string) => setPrefs(p => ({...p, slotKey}))}>
                                <SelectTrigger id="slot-key" className="mt-2">
                                    <SelectValue placeholder="時間を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10:00">10:00</SelectItem>
                                    <SelectItem value="11:00">11:00</SelectItem>
                                    <SelectItem value="13:00">13:00</SelectItem>
                                    <SelectItem value="14:00">14:00</SelectItem>
                                    <SelectItem value="15:00">15:00</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </fieldset>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
                    <Button onClick={handleSave}>保存</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StudentEditSheet({ 
    student, 
    open, 
    onOpenChange,
    onStudentUpdate,
    currentMonth
}: { 
    student: Student | null, 
    open: boolean, 
    onOpenChange: (open: boolean) => void,
    onStudentUpdate: () => void,
    currentMonth: Date
}) {
    const [formData, setFormData] = useState<Partial<Student>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);
    const [monthlyCount, setMonthlyCount] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (student) {
            setFormData(student);
            countStudentLessonsInMonth(student.uid, currentMonth)
                .then(setMonthlyCount);
        } else {
            setFormData({ name: '', email: '', course: '2perMonth', isActive: true, preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } });
            setMonthlyCount(null);
        }
    }, [student, currentMonth]);

    const handleFieldChange = (field: keyof Student, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleSave = async () => {
        if (!student) return;
        setIsSaving(true);
        try {
            await updateStudent(student.uid, formData);
            toast({ title: '成功', description: '生徒情報が更新されました。'});
            onStudentUpdate();
            onOpenChange(false);
        } catch (error) {
            toast({ title: '失敗', description: '更新に失敗しました。', variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!student) return;
        try {
            await deleteStudent(student.uid);
            toast({ title: '成功', description: '生徒が削除されました。'});
            onStudentUpdate();
            setIsDeleteDialogOpen(false);
            onOpenChange(false);
        } catch (error) {
            toast({ title: '失敗', description: '削除に失敗しました。', variant: 'destructive'});
        }
    }
    
    if (!student) return null;

    const currentPlan = courseMap[student.course];

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{student.name}</SheetTitle>
                        <SheetDescription>生徒の詳細情報を確認・編集します。</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6 py-6">
                        <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">{format(currentMonth, 'M月')}のレッスン回数</p>
                                <p className="text-2xl font-bold">
                                    {monthlyCount !== null ? `${monthlyCount} / ${currentPlan.limit}` : '読込中...'}
                                </p>
                            </div>
                            <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                                {formData.isActive ? '在籍中' : '休会中'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">名前</Label>
                                <Input id="name" value={formData.name || ''} onChange={e => handleFieldChange('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">メールアドレス</Label>
                                <Input id="email" type="email" value={formData.email || ''} onChange={e => handleFieldChange('email', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course">コース</Label>
                                <Select value={formData.course} onValueChange={(value: Student['course']) => handleFieldChange('course', value)}>
                                    <SelectTrigger id="course">
                                        <SelectValue placeholder="コースを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(courseMap).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{value.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="isActive">ステータス</Label>
                                <div className="flex items-center space-x-2 h-10">
                                   <Switch id="isActive" checked={formData.isActive} onCheckedChange={value => handleFieldChange('isActive', value)} />
                                   <Label htmlFor="isActive" className="text-sm">{formData.isActive ? '在籍中' : '休会中'}</Label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grade">学年</Label>
                                <Input id="grade" value={formData.grade || ''} onChange={e => handleFieldChange('grade', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age">年齢</Label>
                                <Input id="age" type="number" value={formData.age || ''} onChange={e => handleFieldChange('age', e.target.valueAsNumber)} />
                            </div>
                             <div className="space-y-2 col-span-2">
                                <Label htmlFor="gender">性別</Label>
                                 <Select value={formData.gender} onValueChange={(value: Student['gender']) => handleFieldChange('gender', value)}>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="性別を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">男性</SelectItem>
                                        <SelectItem value="female">女性</SelectItem>
                                        <SelectItem value="other">その他</SelectItem>
                                        <SelectItem value="unknown">不明</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2 col-span-2">
                                <Label htmlFor="notes">メモ</Label>
                                <Textarea id="notes" value={formData.notes || ''} onChange={e => handleFieldChange('notes', e.target.value)} />
                            </div>
                        </div>

                    </div>
                    <SheetFooter className="grid grid-cols-2 gap-2 sm:flex">
                        <Button variant="outline" onClick={() => setIsPrefDialogOpen(true)}>
                            <Clock className="mr-2 h-4 w-4"/>
                            時間指定
                        </Button>
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                           <AlertDialogTrigger asChild>
                             <Button variant="destructive">削除</Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                                   <AlertDialogDescription>
                                      「{student.name}」さんを削除します。この操作は元に戻せません。関連する全てのレッスン予約も削除されます。
                                   </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                   <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                   <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">削除</AlertDialogAction>
                               </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                        <div className="hidden sm:flex-grow" />
                        <SheetClose asChild>
                            <Button variant="outline">キャンセル</Button>
                        </SheetClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? '保存中...' : '保存'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            { isPrefDialogOpen && 
                <PreferredSlotDialog 
                    student={student}
                    open={isPrefDialogOpen}
                    onOpenChange={setIsPrefDialogOpen}
                    onStudentUpdate={onStudentUpdate}
                />
            }
        </>
    )
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({});
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const fetchStudents = async (month: Date) => {
    setLoading(true);
    try {
        const data = await getAllStudents();
        setStudents(data);
        await fetchMonthlyCounts(data, month);
    } catch (e) {
        // handle error
    } finally {
        setLoading(false);
    }
  };

  const fetchMonthlyCounts = async (studentList: Student[], month: Date) => {
      const counts: Record<string, number> = {};
      const promises = studentList.map(student => 
        countStudentLessonsInMonth(student.uid, month).then(count => {
            counts[student.uid] = count;
        })
      );
      await Promise.all(promises);
      setMonthlyCounts(counts);
  }

  useEffect(() => {
    fetchStudents(currentMonth);
  }, [currentMonth]);
  
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  }

  const onStudentUpdate = () => {
      fetchStudents(currentMonth);
  }

  const handleMonthChange = (direction: 'prev' | 'next') => {
      setCurrentMonth(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
  }

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="生徒管理">
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleMonthChange('prev')}>&lt;</Button>
            <span className="w-28 text-center font-semibold">{format(currentMonth, 'yyyy年 M月')}</span>
            <Button variant="outline" onClick={() => handleMonthChange('next')}>&gt;</Button>
            <Button disabled>新規生徒追加</Button>
        </div>
      </PageHeader>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>コース</TableHead>
              <TableHead>レッスン回数</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? students.map(student => (
              <TableRow key={student.uid} onClick={() => handleStudentSelect(student)} className="cursor-pointer">
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{courseMap[student.course].name}</Badge>
                </TableCell>
                <TableCell>
                    {monthlyCounts[student.uid] !== undefined ? `${monthlyCounts[student.uid]} / ${courseMap[student.course].limit}` : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={student.isActive ? 'default' : 'secondary'}>
                    {student.isActive ? '在籍中' : '休会中'}
                  </Badge>
                </TableCell>
                <TableCell>{format(student.createdAt, 'yyyy/MM/dd')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu onOpenChange={(open) => open && setSelectedStudent(student)}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" onClick={e => e.stopPropagation()}>
                        <span className="sr-only">メニューを開く</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleStudentSelect(student)}>
                        <FilePenLine className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                               <Trash2 className="mr-2 h-4 w-4" />
                               削除
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                           <AlertDialogContent>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                                   <AlertDialogDescription>
                                      「{student.name}」さんを削除します。この操作は元に戻せません。関連する全てのレッスン予約も削除されます。
                                   </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                   <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => {
                                       handleDelete();
                                       setSelectedStudent(null);
                                   }} className="bg-destructive hover:bg-destructive/90">削除</AlertDialogAction>
                               </AlertDialogFooter>
                           </AlertDialogContent>
                       </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">生徒情報がありません。</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <StudentEditSheet 
        student={selectedStudent} 
        open={!!selectedStudent}
        onOpenChange={(isOpen) => !isOpen && setSelectedStudent(null)}
        onStudentUpdate={onStudentUpdate}
        currentMonth={currentMonth}
      />
    </div>
  );
  async function handleDelete() {
      if (!selectedStudent) return;
      try {
          await deleteStudent(selectedStudent.uid);
          toast({ title: '成功', description: '生徒が削除されました。'});
          onStudentUpdate();
      } catch (error) {
          toast({ title: '失敗', description: '削除に失敗しました。', variant: 'destructive'});
      }
  }
}
