
"use client";

import { AppLayout } from "@/components/AppLayout";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentHeader } from "@/components/student/StudentHeader";
import { useUser } from "@/firebase";
import { useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/shared/Loading";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [isLinked, setIsLinked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (isUserLoading) return;
        if (!user) {
            router.replace('/login');
            return;
        }

        const checkLinkStatus = async () => {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().linkedStudentId) {
                setIsLinked(true);
            } else {
                router.replace('/link-account');
            }
            setIsLoading(false);
        };

        checkLinkStatus();
    }, [user, isUserLoading, firestore, router]);

    if (isLoading || !isLinked) {
        return <Loading />
    }

  return (
    <AppLayout
      sidebar={<StudentSidebar />}
      header={<StudentHeader />}
    >
      {children}
    </AppLayout>
  );
}
