"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/UserNav";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
       <div className="flex items-center gap-2">
         <SidebarTrigger className="md:flex" />
       </div>
       <div className="flex items-center gap-4">
         <UserNav />
       </div>
    </header>
  );
}
