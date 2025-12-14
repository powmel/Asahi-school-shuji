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
import { Calendar, LayoutDashboard, Megaphone, Brush } from "lucide-react";
import Link from 'next/link';
import { UserNav } from '@/components/UserNav';

const menuItems = [
  { href: '/student', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
  { href: '/student/lessons', label: '全授業一覧', icon: Calendar },
  { href: '/student/announcements', label: 'お知らせ', icon: Megaphone },
];

export function StudentSidebar() {
  const pathname = usePathname();

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <SidebarHeader className="border-b border-border/50">
        <div className="flex items-center gap-2 p-2">
            <Brush className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-lg font-semibold">書道教室</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.href}>
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
      <SidebarFooter className="p-2 border-t border-border/50">
          <div className="flex items-center justify-center p-2">
              <UserNav />
          </div>
      </SidebarFooter>
    </>
  );
}
