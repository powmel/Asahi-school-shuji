"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loading } from '@/components/shared/Loading';

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.role === 'admin') {
                router.replace('/admin');
            } else if (userData.linkedStudentId) {
                router.replace('/student');
            } else {
                router.replace('/link-account');
            }
          } else {
             // This can happen briefly after signup before the user doc is created.
             // Let's redirect to login as a safe fallback.
             router.replace('/login');
          }
        }).catch(() => {
            router.replace('/login');
        });
      } else {
        router.replace('/login');
      }
    }
  }, [router, user, isUserLoading, firestore]);

  return <Loading />;
}
