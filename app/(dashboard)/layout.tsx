'use client';

import React, { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { AuthProvider } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleMobileToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-[#0f1419]">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMobileMenuToggle={handleMobileToggle} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
