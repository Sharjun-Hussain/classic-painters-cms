'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCheck({ session, children }) {
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
