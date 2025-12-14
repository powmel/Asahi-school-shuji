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
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllStudents } from '@/lib/data';
import type { Student } from '@/lib/types';
import { Loading } from '@/components/shared/Loading';
import { format } from 'date-fns';

const courseMap: { [key in Student['course']]: string } = {
  '2perMonth': '月2回コース',
  '3perMonth': '月3回コース',
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllStudents().then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

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
              <TableHead>詳細</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>コース</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? students.map(student => (
              <TableRow key={student.uid}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-muted-foreground">{student.displayTag}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{courseMap[student.course]}</Badge>
                </TableCell>
                <TableCell>{format(student.createdAt, 'yyyy/MM/dd')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">メニューを開く</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem disabled>編集</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" disabled>削除</DropdownMenuItem>
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
    </div>
  );
}
