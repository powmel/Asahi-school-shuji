
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
import { MoreHorizontal, FilePenLine, Trash2, Clock, Copy, Check, UserPlus, Loader2 } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateStudent, deleteStudent, createStudent, getDb, getMonthlyLessonCounts } from '@/lib/data';
import type { Student } from '@/lib/types';
import { Loading } from '@/components/shared/Loading';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';


const courseMap: { [key in Student['course']]: {name: string, limit: number} } = {
  '2perMonth': { name: '月2回コース', limit: 2 },
  '3perMonth': { name: '月3回コース', limit: 3 },
};

function CopyToClipboard({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: "コピーしました", description: text });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
}

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
                    <DialogDescription>
                        {student.name}さんの希望日時を設定します。有効にすると、空きがある場合に自動で予約が確保されます。
                    </DialogDescription>
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

function StudentSheet({ 
    student, 
    open, 
    onOpenChange,
    onStudentUpdate,
    onDeleteRequest
}: { 
    student: Partial<Student> | null, 
    open: boolean, 
    onOpenChange: (open: boolean) => void,
    onStudentUpdate: () => void,
    onDeleteRequest: (student: Student) => void
}) {
    const [formData, setFormData] = useState<Partial<Student>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isPrefDialogOpen, setIsPrefDialogOpen] = useState(false);
    const { toast } = useToast();

    const isNew = !student || !student.uid;

    useEffect(() => {
        if (student) {
            setFormData(student);
        } else {
            setFormData({ name: '', email: '', course: '2perMonth', isActive: true, preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } });
        }
    }, [student]);

    const handleFieldChange = (field: keyof Student, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isNew) {
                await createStudent(formData);
                toast({ title: '成功', description: '新しい生徒が追加されました。'});
                onOpenChange(false);
            } else if(student?.uid) {
                await updateStudent(student.uid, formData);
                toast({ title: '成功', description: '生徒情報が更新されました。'});
                onStudentUpdate();
                onOpenChange(false);
            }
        } catch (error: any) {
            toast({ 
                title: '失敗', 
                description: error.message || "保存に失敗しました。", 
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!student) return null;

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-lg overflow-y-auto bg-background">
                    <SheetHeader>
                        <SheetTitle>{isNew ? "新規生徒追加" : student.name}</SheetTitle>
                        <SheetDescription>{isNew ? "新しい生徒の詳細情報を入力してください。" : "生徒の詳細情報を確認・編集します。"}</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6 py-6">
                        {!isNew && (
                             <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                               <h3 className="font-semibold text-sm">アカウント連携情報</h3>
                                <div className="space-y-2">
                                    <Label>生徒コード</Label>
                                    <div className="flex items-center">
                                        <Input readOnly value={formData.studentCode || '生成中...'} className="bg-muted"/>
                                        {formData.studentCode && <CopyToClipboard text={formData.studentCode} />}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>連携トークン</Label>
                                    <div className="flex items-center">
                                        <Input readOnly value={formData.linkToken || '生成中...'} className="bg-muted" />
                                        {formData.linkToken && <CopyToClipboard text={formData.linkToken} />}
                                    </div>
                                    {formData.linkTokenExpiresAt && <p className="text-xs text-muted-foreground">有効期限: {format((formData.linkTokenExpiresAt as any), 'yyyy/MM/dd HH:mm')}</p>}
                                </div>
                                 <p className="text-xs text-muted-foreground">
                                    {formData.linkedUserId ? `連携済み (ユーザーID: ${formData.linkedUserId.substring(0,10)}...)` : '未連携'}
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="name">名前</Label>
                                <Input id="name" value={formData.name || ''} onChange={e => handleFieldChange('name', e.target.value)} disabled={isSaving} />
                            </div>
                             <div className="space-y-2 col-span-2">
                                <Label htmlFor="email">メールアドレス</Label>
                                <Input id="email" type="email" value={formData.email || ''} onChange={e => handleFieldChange('email', e.target.value)} disabled={isSaving} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course">コース</Label>
                                <Select value={formData.course} onValueChange={(value: Student['course']) => handleFieldChange('course', value)} disabled={isSaving}>
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
                                   <Switch id="isActive" checked={formData.isActive} onCheckedChange={value => handleFieldChange('isActive', value)} disabled={isSaving} />
                                   <Label htmlFor="isActive" className="text-sm">{formData.isActive ? '在籍中' : '休会中'}</Label>
                                </div>
                            </div>
                        </div>

                    </div>
                    <SheetFooter className="grid grid-cols-2 gap-2 sm:flex">
                        {!isNew && (
                            <>
                            <Button variant="outline" onClick={() => setIsPrefDialogOpen(true)} disabled={isSaving}>
                                <Clock className="mr-2 h-4 w-4"/>
                                時間指定
                            </Button>
                            <Button variant="destructive" onClick={() => onDeleteRequest(student as Student)} disabled={isSaving}>削除</Button>
                            </>
                        )}
                        <div className="hidden sm:flex-grow" />
                        <SheetClose asChild>
                            <Button variant="outline" disabled={isSaving}>キャンセル</Button>
                        </SheetClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isSaving ? '保存中...' : '保存'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            { !isNew && isPrefDialogOpen && student.uid &&
                <PreferredSlotDialog 
                    student={student as Student}
                    open={isPrefDialogOpen}
                    onOpenChange={setIsPrefDialogOpen}
                    onStudentUpdate={onStudentUpdate}
                />
            }
        </>
    )
}

function StudentRow({ 
    student, 
    lessonCount,
    onEdit, 
    onDelete 
}: { 
    student: Student, 
    lessonCount: number,
    onEdit: (s: Student) => void, 
    onDelete: (s: Student) => void 
}) {
    return (
        <TableRow key={student.uid} onClick={() => onEdit(student)} className="cursor-pointer">
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell className="font-mono text-xs">
                {student.studentCode || `ID: ${student.uid.substring(0, 8)}...`}
            </TableCell>
            <TableCell>
                <Badge variant="outline">{courseMap[student.course]?.name || student.course}</Badge>
            </TableCell>
            <TableCell>
                {lessonCount} / {courseMap[student.course]?.limit || 'N/A'}
            </TableCell>
            <TableCell>
                <Badge variant={student.isActive ? 'default' : 'secondary'}>
                    {student.isActive ? '在籍中' : '休会中'}
                </Badge>
                {student.linkedUserId ? <Badge variant="secondary" className="ml-2">連携済み</Badge> : <Badge variant="outline" className="ml-2">未連携</Badge>}
            </TableCell>
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
                        <DropdownMenuItem onClick={() => onEdit(student)}>
                            <FilePenLine className="mr-2 h-4 w-4" />
                            編集
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onDelete(student); }} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Partial<Student> | null>(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

    // 1. 生徒リストのリアルタイム購読
    useEffect(() => {
        setLoading(true);
        const db = getDb();
        const q = collection(db, 'students');
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const studentsData: Student[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                studentsData.push({
                    ...data,
                    uid: doc.id,
                    createdAt: (data.createdAt as Timestamp)?.toDate(),
                    linkTokenExpiresAt: (data.linkTokenExpiresAt as Timestamp)?.toDate(),
                } as Student);
            });
            setStudents(studentsData.sort((a, b) => ((a.createdAt as any) || 0) - ((b.createdAt as any) || 0)));
            setLoading(false);
        }, (error) => {
            toast({ title: 'エラー', description: '生徒情報の取得に失敗しました。', variant: 'destructive'});
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    // 2. 受講回数の一括取得 (N+1問題の解消)
    useEffect(() => {
        getMonthlyLessonCounts(currentMonth).then(setLessonCounts);
    }, [currentMonth]);
  
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setIsSheetOpen(true);
  }
  
  const handleNewStudent = () => {
      setSelectedStudent({ name: '', email: '', course: '2perMonth', isActive: true, preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } });
      setIsSheetOpen(true);
  }

  const handleMonthChange = (direction: 'prev' | 'next') => {
      setCurrentMonth(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
  }

  const handleDeleteRequest = (student: Student) => {
      // 1. まずサイドバーを閉じる (オーバーレイの競合回避)
      setIsSheetOpen(false);
      // 2. アニメーション時間を待ってから削除確認を表示
      setTimeout(() => {
          setStudentToDelete(student);
      }, 150);
  }

  const handleDelete = async () => {
      if (!studentToDelete) return;
      setIsDeleting(true);
      try {
          await deleteStudent(studentToDelete.uid);
          setStudentToDelete(null);
          setSelectedStudent(null);
          toast({ title: '成功', description: '生徒が削除されました。'});
      } catch (error: any) {
          toast({ title: '失敗', description: error.message || '削除に失敗しました。', variant: 'destructive'});
      } finally {
          setIsDeleting(false);
      }
  }

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader title="生徒管理">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleMonthChange('prev')}>&lt;</Button>
            <span className="w-28 text-center font-semibold">{format(currentMonth, 'yyyy年 M月')}</span>
            <Button variant="outline" size="sm" onClick={() => handleMonthChange('next')}>&gt;</Button>
            <Button onClick={handleNewStudent}><UserPlus className="mr-2 h-4 w-4"/>新規生徒追加</Button>
        </div>
      </PageHeader>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>生徒コード</TableHead>
              <TableHead>コース</TableHead>
              <TableHead>レッスン回数</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? students.map(student => (
              <StudentRow 
                key={student.uid} 
                student={student} 
                lessonCount={lessonCounts[student.uid] || 0}
                onEdit={handleStudentSelect}
                onDelete={handleDeleteRequest}
              />
            )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">生徒情報がありません。</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <StudentSheet 
        student={selectedStudent} 
        open={isSheetOpen}
        onOpenChange={(isOpen) => {
            if(!isOpen) setSelectedStudent(null);
            setIsSheetOpen(isOpen);
        }}
        onStudentUpdate={() => {}}
        onDeleteRequest={handleDeleteRequest}
      />

      <AlertDialog 
        open={!!studentToDelete} 
        onOpenChange={(open) => {
            if (!open && !isDeleting) setStudentToDelete(null);
        }}
      >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <p>「{studentToDelete?.name}」さんを削除します。関連する全てのレッスン予約も削除されます。</p>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={(e) => { e.preventDefault(); handleDelete(); }} 
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    disabled={isDeleting}
                >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    削除
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
