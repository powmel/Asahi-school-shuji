"use client";

import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Calendar, LayoutDashboard, Users, Repeat, Megaphone, Brush, CalendarClock, CalendarDays } from "lucide-react";
import Link from 'next/link';
import { UserNav } from '@/components/UserNav';
import { format, startOfDay } from 'date-fns';
import { useMemo } from 'react';

const todayPathForLink = `/admin/day/${format(startOfDay(new Date()), 'yyyy-MM-dd')}`;

export const menuItems = [
    { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
    { href: '/admin/schedule', label: '月間スケジュール', icon: Calendar },
    { href: '/admin/monthly-scheduler', label: '月間割り振り', icon: CalendarDays },
    { href: todayPathForLink, label: '本日の運営', icon: CalendarClock, base: '/admin/day' },
    { href: '/admin/students', label: '生徒管理', icon: Users },
    { href: '/admin/swaps', label: '振替申請管理', icon: Repeat },
    { href: '/admin/announcements', label: 'お知らせ管理', icon: Megaphone },
];

export function AdminSidebar() {
  const pathname = usePathname();
  
  const isActive = (item: typeof menuItems[0]) => {
    if (item.base) {
        return pathname.startsWith(item.base)
    }
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  }

  return (
    <>
      <SidebarHeader className="border-b border-border/50">
        <div className="flex items-center gap-2 p-2">
            <Brush className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-lg font-semibold">管理者パネル</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item)}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* Footer can be added here if needed */}
    </>
  );
}
