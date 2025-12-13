import { AppLayout } from "@/components/AppLayout";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentHeader } from "@/components/student/StudentHeader";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout
      sidebar={<StudentSidebar />}
      header={<StudentHeader />}
    >
      {children}
    </AppLayout>
  );
}
