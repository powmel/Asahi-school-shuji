"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase";
import {
  ArrowRight,
  Brush,
  CalendarClock,
  CalendarDays,
  Megaphone,
  Repeat,
  Users,
} from "lucide-react";
import Link from "next/link";

const primaryActions = [
  {
    href: "/admin/today",
    title: "今日の運営",
    description: "直近の授業日へ移動し、当日の枠と生徒を確認します。",
    icon: Brush,
  },
  {
    href: "/admin/monthly-scheduler",
    title: "月間割り振り",
    description: "生徒ごとの回数を見ながら、月内の授業枠へ割り振ります。",
    icon: CalendarClock,
  },
];

const quickLinks = [
  {
    href: "/admin/students",
    title: "生徒管理",
    description: "生徒情報、コース、連携コードを確認・編集します。",
    icon: Users,
  },
  {
    href: "/admin/schedule",
    title: "月間スケジュール",
    description: "開校日、時間枠、定員状況を月単位で確認します。",
    icon: CalendarDays,
  },
  {
    href: "/admin/swaps",
    title: "振替申請",
    description: "生徒からの振替申請を確認し、承認・却下します。",
    icon: Repeat,
  },
  {
    href: "/admin/announcements",
    title: "お知らせ管理",
    description: "教室からのお知らせを作成・公開します。",
    icon: Megaphone,
  },
];

export default function AdminDashboard() {
  const { user } = useUser();
  const displayName = user?.displayName || "管理者";

  return (
    <div className="space-y-8">
      <PageHeader title="管理者ダッシュボード">
        <Button asChild>
          <Link href="/admin/today">
            今日の運営
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </PageHeader>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          ようこそ、{displayName}さん
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-headline text-2xl font-semibold tracking-[0.02em]">
              今日の確認から、月間調整までをここから始めます。
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              授業日の確認、生徒管理、振替申請、お知らせ投稿へすぐ移動できます。
              朱色の強調は重要な運営アクションに限定しています。
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            優先順: 今日の運営 → 振替確認 → 月間割り振り
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {primaryActions.map((action) => (
          <Link href={action.href} key={action.href} className="group">
            <Card className="h-full border-border transition-all group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="font-headline text-xl tracking-[0.02em]">
                    {action.title}
                  </CardTitle>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <action.icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                  開く
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="mb-4 font-headline text-xl font-semibold tracking-[0.02em]">
          主要機能
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link href={link.href} key={link.href} className="group">
              <Card className="h-full border-border transition-all group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base font-semibold">{link.title}</CardTitle>
                  <link.icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
