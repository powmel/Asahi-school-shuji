"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/shared/Loading';

export default function Home() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(isAdmin ? '/admin' : '/student');
      } else {
        router.replace('/login');
      }
    }
  }, [router, user, isAdmin, loading]);

  return <Loading />;
}
