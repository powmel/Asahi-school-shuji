"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Users, Repeat, Megaphone } from "lucide-react";
import Link from "next/link";

const quickLinks = [
    {
        href: "/admin/schedule",
        title: "月間スケジュール",
        description: "授業の割り当てを管理します",
        icon: Calendar,
    },
    {
        href: "/admin/students",
        title: "生徒管理",
        description: "生徒情報を確認・編集します",
        icon: Users,
    },
    {
        href: "/admin/swaps",
        title: "振替申請管理",
        description: "生徒からの振替申請を処理します",
        icon: Repeat,
    },
    {
        href: "/admin/announcements",
        title: "お知らせ管理",
        description: "お知らせを投稿・編集します",
        icon: Megaphone,
    },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <PageHeader title="管理者ダッシュボード" />
      <div className="space-y-4">
        <h2 className="font-headline text-xl font-semibold">ようこそ、{user?.name || '管理者'}さん</h2>
        <p className="text-muted-foreground">
          こちらから各管理機能にアクセスできます。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
            <Link href={link.href} key={link.href} className="group">
                <Card className="h-full transition-all group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{link.title}</CardTitle>
                        <link.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
