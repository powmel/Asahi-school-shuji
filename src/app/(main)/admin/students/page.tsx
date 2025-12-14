"use client";

import { useEffect, useState } from 'react';
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
import { MoreHorizontal, FilePenLine, Trash2 } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getAllStudents, updateStudent, deleteStudent, countStudentLessonsInMonth } from '@/lib/data';
import type { Student } from '@/lib/types';
import { Loading } from '@/components/shared/Loading';
import { format, startOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';


const courseMap: { [key in Student['course']]: {name: string, limit: number} } = {
  '2perMonth': { name: '月2回コース', limit: 2 },
  '3perMonth': { name: '月3回コース', limit: 3 },
};

function StudentEditSheet({ 
    student, 
    open, 
    onOpenChange,
    onStudentUpdate
}: { 
    student: Student | null, 
    open: boolean, 
    onOpenChange: (open: boolean) => void,
    onStudentUpdate: () => void,
}) {
    const [formData, setFormData] = useState<Partial<Student>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [monthlyCount, setMonthlyCount] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (student) {
            setFormData(student);
            countStudentLessonsInMonth(student.uid, startOfMonth(new Date()))
                .then(setMonthlyCount);
        } else {
            setFormData({ name: '', email: '', course: '2perMonth', isActive: true });
            setMonthlyCount(null);
        }
    }, [student]);

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
                                <p className="text-sm text-muted-foreground">今月のレッスン回数</p>
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
                    <SheetFooter>
                        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>削除</Button>
                        <div className="flex-grow" />
                        <SheetClose asChild>
                            <Button variant="outline">キャンセル</Button>
                        </SheetClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? '保存中...' : '保存'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
        </>
    )
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({});
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const fetchStudents = async () => {
    setLoading(true);
    try {
        const data = await getAllStudents();
        setStudents(data);
        await fetchMonthlyCounts(data, currentMonth);
    } catch (e) {
        // handle error
    } finally {
        setLoading(false);
    }
  };

  const fetchMonthlyCounts = async (studentList: Student[], month: Date) => {
      const counts: Record<string, number> = {};
      for (const student of studentList) {
          counts[student.uid] = await countStudentLessonsInMonth(student.uid, month);
      }
      setMonthlyCounts(counts);
  }

  useEffect(() => {
    fetchStudents();
  }, [currentMonth]);
  
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  }

  const onStudentUpdate = () => {
      fetchStudents();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="生徒管理">
        <Button disabled>新規生徒追加</Button>
      </PageHeader>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>コース</TableHead>
              <TableHead>今月のレッスン</TableHead>
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
                  <DropdownMenu>
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
                      <DropdownMenuItem className="text-destructive" onClick={() => handleStudentSelect(student)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
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
      />
    </div>
  );
}
