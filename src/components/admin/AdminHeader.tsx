"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/UserNav";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
       <div className="md:hidden">
         <SidebarTrigger />
       </div>
       <div className="hidden md:block">
         <UserNav />
       </div>
    </header>
  );
}
