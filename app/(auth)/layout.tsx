'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Suspense>{children}</Suspense>
    </AuthProvider>
  );
}
