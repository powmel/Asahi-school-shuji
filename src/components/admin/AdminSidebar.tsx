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
import { Calendar, LayoutDashboard, Users, Repeat, Megaphone, Brush, CalendarClock } from "lucide-react";
import Link from 'next/link';
import { UserNav } from '@/components/UserNav';
import { format } from 'date-fns';

const menuItems = [
  { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/admin/schedule', label: '月間スケジュール', icon: Calendar },
  { href: `/admin/day/${format(new Date(), 'yyyy-MM-dd')}`, label: '本日の運営', icon: CalendarClock },
  { href: '/admin/students', label: '生徒管理', icon: Users },
  { href: '/admin/swaps', label: '振替申請管理', icon: Repeat },
  { href: '/admin/announcements', label: 'お知らせ管理', icon: Megaphone },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href.includes('/admin/day') ? pathname.startsWith('/admin/day') : (item.href !== '/admin' || pathname === '/admin'))}
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
      <SidebarFooter className="p-2 border-t border-border/50">
          <div className="flex items-center justify-center p-2">
              <UserNav />
          </div>
      </SidebarFooter>
    </>
  );
}
