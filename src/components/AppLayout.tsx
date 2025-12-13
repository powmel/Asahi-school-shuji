"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/shared/Loading";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

type AppLayoutProps = {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
};

export function AppLayout({ sidebar, header, children }: AppLayoutProps) {
  const { loading, user } = useAuth();

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <Sidebar>{sidebar}</Sidebar>
      <SidebarInset className="bg-muted/30">
        <div className="flex h-full flex-col">
          {header}
          <main className="flex-1 overflow-y-auto p-4 pt-6 md:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
