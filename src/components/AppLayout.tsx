
"use client";

import { useFirebase } from "@/firebase";
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
  const { isUserLoading, user } = useFirebase();

  if (isUserLoading || !user) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <Sidebar>{sidebar}</Sidebar>
      <SidebarInset className="bg-muted/30">
        <div className="flex h-screen flex-col">
          {header}
          <main className="flex-1 flex flex-col min-h-0 p-4 pt-6 md:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
