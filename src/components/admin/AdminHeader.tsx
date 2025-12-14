"use client";
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/UserNav";
import { useMemo } from 'react';
import { menuItems } from './AdminSidebar';

export function AdminHeader() {
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        const currentItem = menuItems.find(item => {
             if (item.base) {
                return pathname.startsWith(item.base);
            }
            if (item.exact) {
                return pathname === item.href;
            }
            return pathname.startsWith(item.href);
        });
        return currentItem?.label || '';
    }, [pathname]);

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
       <div className="flex items-center gap-4">
         <SidebarTrigger className="md:flex" />
         <h1 className="font-headline text-xl font-semibold hidden md:block">{pageTitle}</h1>
       </div>
       <div className="flex items-center gap-4">
         <UserNav />
       </div>
    </header>
  );
}
