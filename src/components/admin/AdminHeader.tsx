"use client";
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/UserNav";
import { useMemo } from 'react';
import { menuItems } from './AdminSidebar';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export function AdminHeader() {
    const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
       <div className="flex items-center gap-4">
         <SidebarTrigger className="md:flex" />
       </div>
       <div className="flex items-center gap-4">
         <UserNav />
       </div>
    </header>
  );
}
