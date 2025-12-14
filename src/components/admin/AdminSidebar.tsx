
"use client";

import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Calendar, LayoutDashboard, Users, Repeat, Megaphone, Brush, CalendarClock, CalendarDays } from "lucide-react";
import Link from 'next/link';
import { UserNav } from '@/components/UserNav';
import { format } from 'date-fns';
import { useMemo } from 'react';

const todayPathForLink = `/admin/day/${format(new Date(), 'yyyy-MM-dd')}`;

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
  const { state } = useSidebar();
  
  const isActive = (item: typeof menuItems[0]) => {
    if (item.base) {
      return pathname.startsWith(item.base);
    }
    if (item.exact) {
      return pathname === item.href;
    }
    // Handle /admin being a prefix for all other admin routes
    if (item.href === '/admin') {
        return pathname === '/admin';
    }
    return pathname.startsWith(item.href);
  };
  
  const activeItemLabel = useMemo(() => {
    // Find the most specific match first
    const specificItem = menuItems.slice().reverse().find(isActive);
    return specificItem ? specificItem.label : 'ダッシュボード';
  }, [pathname]);

  return (
    <>
      <SidebarHeader className="border-b border-border/50 p-2">
        <SidebarTrigger asChild>
            <div className="flex w-full cursor-pointer items-center gap-2">
                <Brush className="h-6 w-6 shrink-0 text-primary" />
                <div className="flex-grow overflow-hidden">
                    <h2 className="font-headline text-lg font-semibold truncate">管理者パネル</h2>
                    <p className="text-xs text-muted-foreground truncate transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                        {activeItemLabel}
                    </p>
                </div>
            </div>
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item)}
                tooltip={{ children: item.label }}
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
