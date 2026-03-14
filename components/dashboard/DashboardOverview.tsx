'use client';

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  FileText,
  Send,
  TrendingUp,
  Key,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { ActivityFeed, type Activity } from './ActivityFeed';
import { QuickActions } from './QuickActions';

export interface DashboardOverviewProps {
  userName?: string;
  lastLogin?: string;
  className?: string;
}

// -- Mock data generators --

function generateMockActivities(): Activity[] {
  const now = Date.now();
  const minutes = 60_000;
  const hours = 3_600_000;

  return [
    {
      id: '1',
      type: 'submission',
      description: 'submitted an application to Roblox Development Team',
      timestamp: new Date(now - 12 * minutes).toISOString(),
      status: 'success',
      user: { name: 'Alex Rivera' },
    },
    {
      id: '2',
      type: 'promotion',
      description: 'was promoted to Senior Developer in Alpha Squad',
      timestamp: new Date(now - 45 * minutes).toISOString(),
      status: 'success',
      user: { name: 'Jordan Lee' },
    },
    {
      id: '3',
      type: 'key_creation',
      description: 'generated a new API key for production environment',
      timestamp: new Date(now - 2 * hours).toISOString(),
      status: 'success',
      user: { name: 'Sam Chen' },
    },
    {
      id: '4',
      type: 'submission',
      description: 'submitted an application to QA Testing Division',
      timestamp: new Date(now - 3 * hours).toISOString(),
      status: 'pending',
      user: { name: 'Taylor Kim' },
    },
    {
      id: '5',
      type: 'security',
      description: 'enabled two-factor authentication on their account',
      timestamp: new Date(now - 5 * hours).toISOString(),
      status: 'success',
      user: { name: 'Morgan Blake' },
    },
    {
      id: '6',
      type: 'upload',
      description: 'uploaded portfolio assets for application review',
      timestamp: new Date(now - 7 * hours).toISOString(),
      status: 'success',
      user: { name: 'Casey Wright' },
    },
    {
      id: '7',
      type: 'submission',
      description: 'application to Creative Arts team was declined',
      timestamp: new Date(now - 10 * hours).toISOString(),
      status: 'failed',
      user: { name: 'Riley Patel' },
    },
    {
      id: '8',
      type: 'profile_update',
      description: 'updated profile bio and social links',
      timestamp: new Date(now - 14 * hours).toISOString(),
      status: 'success',
      user: { name: 'Quinn Torres' },
    },
    {
      id: '9',
      type: 'settings',
      description: 'modified notification preferences for email alerts',
      timestamp: new Date(now - 20 * hours).toISOString(),
      status: 'success',
      user: { name: 'Drew Nakamura' },
    },
    {
      id: '10',
      type: 'notification',
      description: 'received an invitation to join Beta Testers group',
      timestamp: new Date(now - 26 * hours).toISOString(),
      status: 'warning',
      user: { name: 'Avery Scott' },
    },
    {
      id: '11',
      type: 'key_creation',
      description: 'rotated API key for staging environment',
      timestamp: new Date(now - 30 * hours).toISOString(),
      status: 'success',
      user: { name: 'Jamie Diaz' },
    },
    {
      id: '12',
      type: 'submission',
      description: 'submitted a new application to Engineering Division',
      timestamp: new Date(now - 36 * hours).toISOString(),
      status: 'pending',
      user: { name: 'Skyler Reeves' },
    },
  ];
}

const mockStats = {
  totalApplications: { value: 1284, change: 12.5, trend: 'up' as const },
  totalSubmissions: { value: 856, change: 8.3, trend: 'up' as const },
  passRate: { value: 73, change: 2.1, trend: 'up' as const },
  activeApiKeys: { value: 42, change: 5.7, trend: 'down' as const },
};

// -- Skeleton loaders --

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-[#1f2933] rounded-xl border border-[#2d3748] p-5 animate-pulse"
        >
          <div className="flex justify-between mb-3">
            <div className="w-10 h-10 bg-[#2d3748] rounded-lg" />
            <div className="w-16 h-6 bg-[#2d3748] rounded-full" />
          </div>
          <div className="w-24 h-4 bg-[#2d3748] rounded mb-2" />
          <div className="w-20 h-7 bg-[#2d3748] rounded" />
          <div className="flex gap-0.5 mt-3 h-8">
            {[...Array(12)].map((_, j) => (
              <div key={j} className="flex-1 bg-[#2d3748] rounded-sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="bg-[#1f2933] rounded-xl border border-[#2d3748] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2d3748]">
        <div className="w-32 h-4 bg-[#2d3748] rounded animate-pulse" />
      </div>
      <div className="px-2 py-2 space-y-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 animate-pulse">
            <div className="w-9 h-9 bg-[#2d3748] rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-3.5 bg-[#2d3748] rounded" />
              <div className="flex gap-2">
                <div className="w-12 h-3 bg-[#2d3748] rounded" />
                <div className="w-16 h-3 bg-[#2d3748] rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="w-28 h-4 bg-[#2d3748] rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[#1f2933] rounded-xl border border-[#2d3748] p-5 animate-pulse"
          >
            <div className="w-11 h-11 bg-[#2d3748] rounded-xl mb-4" />
            <div className="w-28 h-4 bg-[#2d3748] rounded mb-2" />
            <div className="w-full h-3 bg-[#2d3748] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Section reveal animation hook --

function useSectionReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useSectionReveal();

  return (
    <div
      ref={ref}
      className={clsx(
        'transition-all ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className
      )}
      style={{
        transitionDuration: '700ms',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// -- Greeting helpers --

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatLastLogin(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// -- Main component --

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  userName = 'User',
  lastLogin,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activities] = useState<Activity[]>(generateMockActivities);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const greeting = getGreeting();
  const formattedLastLogin = lastLogin
    ? formatLastLogin(lastLogin)
    : formatLastLogin(new Date(Date.now() - 86_400_000).toISOString());

  return (
    <div className={clsx('min-h-screen', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome header */}
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1f2933] to-[#1a1f25] border border-[#2d3748] p-6 sm:p-8">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03]">
              <Sparkles className="w-full h-full text-[#ff4b6e]" />
            </div>
            <div
              className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl"
              style={{ backgroundColor: '#ff4b6e', opacity: 0.04 }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-[#ff4b6e]" />
                <span className="text-xs text-[#ff4b6e] font-medium uppercase tracking-wider">
                  Dashboard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {greeting},{' '}
                <span className="bg-gradient-to-r from-[#ff4b6e] to-[#ff8f6e] bg-clip-text text-transparent">
                  {userName}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#a0aec0]">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <span className="text-[#2d3748]">|</span>
                <span>Last login: {formattedLastLogin}</span>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Stats row */}
        <AnimatedSection delay={100}>
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Applications"
                value={mockStats.totalApplications.value}
                change={mockStats.totalApplications.change}
                trend={mockStats.totalApplications.trend}
                icon={FileText}
                color="#3b82f6"
                sparklineData={[20, 35, 45, 30, 55, 40, 65, 50, 70, 60, 80, 75]}
              />
              <StatsCard
                title="Total Submissions"
                value={mockStats.totalSubmissions.value}
                change={mockStats.totalSubmissions.change}
                trend={mockStats.totalSubmissions.trend}
                icon={Send}
                color="#8b5cf6"
                sparklineData={[15, 28, 22, 38, 32, 48, 40, 52, 45, 58, 50, 62]}
              />
              <StatsCard
                title="Pass Rate"
                value={mockStats.passRate.value}
                change={mockStats.passRate.change}
                trend={mockStats.passRate.trend}
                icon={TrendingUp}
                color="#10b981"
                suffix="%"
                sparklineData={[60, 58, 65, 62, 68, 66, 70, 68, 72, 70, 74, 73]}
              />
              <StatsCard
                title="Active API Keys"
                value={mockStats.activeApiKeys.value}
                change={mockStats.activeApiKeys.change}
                trend={mockStats.activeApiKeys.trend}
                icon={Key}
                color="#f59e0b"
                sparklineData={[50, 48, 52, 46, 50, 44, 48, 42, 46, 44, 43, 42]}
              />
            </div>
          )}
        </AnimatedSection>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity feed — takes 2 columns */}
          <AnimatedSection delay={200} className="lg:col-span-2">
            {isLoading ? (
              <ActivitySkeleton />
            ) : (
              <ActivityFeed activities={activities} maxVisible={5} />
            )}
          </AnimatedSection>

          {/* Quick actions — takes 1 column */}
          <AnimatedSection delay={300}>
            {isLoading ? (
              <QuickActionsSkeleton />
            ) : (
              <QuickActions />
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

DashboardOverview.displayName = 'DashboardOverview';
export default DashboardOverview;
