"use client";

import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Calendar, LayoutDashboard, Users, Repeat, Megaphone, Brush, CalendarClock, CalendarDays } from "lucide-react";
import Link from 'next/link';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const todayPathForLink = `/admin/day/${format(new Date(), 'yyyy-MM-dd')}`;

export const menuItems = [
    { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
    { href: '/admin/schedule', label: '月間スケジュール', icon: Calendar },
    { href: '/admin/monthly-scheduler', label: '月間割り振り', icon: CalendarDays, base: '/admin/monthly-scheduler' },
    { href: todayPathForLink, label: '本日の運営', icon: CalendarClock, base: '/admin/day' },
    { href: '/admin/students', label: '生徒管理', icon: Users, base: '/admin/students' },
    { href: '/admin/swaps', label: '振替申請管理', icon: Repeat, base: '/admin/swaps' },
    { href: '/admin/announcements', label: 'お知らせ管理', icon: Megaphone, base: '/admin/announcements' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  
  const isActive = (item: typeof menuItems[0]) => {
    if (item.base) {
      return pathname.startsWith(item.base);
    }
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.href === '/admin') {
        return pathname === '/admin';
    }
    return pathname.startsWith(item.href);
  };
  
  const activeItemLabel = useMemo(() => {
    const specificItem = [...menuItems].reverse().find(isActive);
    return specificItem ? specificItem.label : 'ダッシュボード';
  }, [pathname]);

  return (
    <>
      <SidebarHeader className="border-b border-border/50 p-2">
        <button 
          onClick={toggleSidebar}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all",
            "bg-primary text-primary-foreground shadow-lg hover:brightness-110 active:scale-[0.98]",
            "border border-primary/20"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/20 text-white shadow-sm">
            <Brush className="h-6 w-6" />
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-300",
            state === "collapsed" ? "w-0 opacity-0" : "w-full opacity-100"
          )}>
            <span className="font-headline text-base font-bold leading-none text-white">
              管理者パネル
            </span>
            <span className="mt-1 truncate text-[10px] font-medium uppercase tracking-wider text-white/80">
              {activeItemLabel}
            </span>
          </div>
        </button>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarMenu className="gap-2">
          {menuItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item)}
                tooltip={{ children: item.label }}
                className={cn(
                  "transition-all duration-200 h-11 px-4 rounded-md border border-transparent font-medium",
                  "bg-muted/50 text-foreground",
                  "hover:bg-primary hover:text-primary-foreground hover:shadow-md",
                  "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:border-primary/20",
                  "flex items-center"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="shrink-0 mr-2" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
