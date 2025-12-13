"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/shared/Loading';

export default function Home() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (isAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/student');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isAdmin, loading, router]);

  return <Loading />;
}
