import { AppLayout } from "@/components/AppLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout
      sidebar={<AdminSidebar />}
      header={<AdminHeader />}
    >
      {children}
    </AppLayout>
  );
}
