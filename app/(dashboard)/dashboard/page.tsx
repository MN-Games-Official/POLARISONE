'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardOverview
      userName={user?.full_name ?? user?.username ?? 'User'}
    />
  );
}
