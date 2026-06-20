'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // TODO: Initialize auth from session/token
  }, [setUser]);

  return <>{children}</>;
}