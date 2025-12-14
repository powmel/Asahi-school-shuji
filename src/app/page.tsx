"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/shared/Loading';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return <Loading />;
}
