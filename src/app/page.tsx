"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Brush, CalendarCheck, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              if (userData.role === "admin") {
                router.replace("/admin");
              } else if (userData.linkedStudentId) {
                router.replace("/student");
              } else {
                router.replace("/link-account");
              }
            } else {
              // This can happen briefly after signup before the user doc is created.
              // Let's redirect to login as a safe fallback.
              router.replace("/login");
            }
          })
          .catch(() => {
            router.replace("/login");
          });
      } else {
        router.replace("/login");
      }
    }
  }, [router, user, isUserLoading, firestore]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10 text-foreground">
      <div className="absolute inset-x-0 top-0 h-1 bg-secondary" />
      <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70" />
      <section className="relative z-10 w-full max-w-xl rounded-xl border border-border bg-card/95 p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Brush className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
          朝日書道教室 スケジュール管理
        </p>
        <h1 className="font-headline text-3xl font-semibold tracking-[0.02em] text-foreground">
          予定を確認しています
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          ログイン状態とアカウント情報を確認し、管理者または生徒用の画面へ移動します。
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-primary">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          しばらくお待ちください
        </div>
      </section>
    </main>
  );
}
