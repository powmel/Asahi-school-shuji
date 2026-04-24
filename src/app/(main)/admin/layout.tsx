"use client";

import { AppLayout } from "@/components/AppLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Loading } from "@/components/shared/Loading";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const checkAdminRole = async () => {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        router.replace("/login");
        return;
      }

      if (userDoc.data().role === "admin") {
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      router.replace("/student");
    };

    checkAdminRole();
  }, [user, isUserLoading, firestore, router]);

  if (isUserLoading || isLoading || !isAdmin) {
    return <Loading />;
  }

  return (
    <AppLayout
      sidebar={<AdminSidebar />}
      header={<AdminHeader />}
    >
      {children}
    </AppLayout>
  );
}
