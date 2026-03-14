'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import {
  FileText,
  Star,
  Key,
  UserCheck,
  Shield,
  Upload,
  Settings,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Inbox,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

export type ActivityType =
  | 'submission'
  | 'promotion'
  | 'key_creation'
  | 'profile_update'
  | 'security'
  | 'upload'
  | 'settings'
  | 'notification';

export type ActivityStatus = 'success' | 'failed' | 'pending' | 'warning';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  status: ActivityStatus;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
  maxVisible?: number;
}

const activityIcons: Record<ActivityType, LucideIcon> = {
  submission: FileText,
  promotion: Star,
  key_creation: Key,
  profile_update: UserCheck,
  security: Shield,
  upload: Upload,
  settings: Settings,
  notification: Bell,
};

const activityColors: Record<ActivityType, string> = {
  submission: '#3b82f6',
  promotion: '#f59e0b',
  key_creation: '#8b5cf6',
  profile_update: '#06b6d4',
  security: '#ef4444',
  upload: '#10b981',
  settings: '#6366f1',
  notification: '#ff4b6e',
};

const statusConfig: Record<
  ActivityStatus,
  { icon: LucideIcon; color: string; label: string }
> = {
  success: { icon: CheckCircle2, color: '#10b981', label: 'Success' },
  failed: { icon: XCircle, color: '#ef4444', label: 'Failed' },
  pending: { icon: Clock, color: '#f59e0b', label: 'Pending' },
  warning: { icon: AlertTriangle, color: '#f97316', label: 'Warning' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

function ActivityItem({
  activity,
  index,
}: {
  activity: Activity;
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  const Icon = activityIcons[activity.type];
  const iconColor = activityColors[activity.type];
  const status = statusConfig[activity.status];
  const StatusIcon = status.icon;

  return (
    <div
      ref={itemRef}
      className={clsx(
        'group flex items-start gap-3 p-3.5 rounded-lg',
        'border border-transparent transition-all duration-300 ease-out',
        'hover:bg-[#2d3748]/50 hover:border-[#2d3748]',
        isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-4'
      )}
      style={{
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out, background-color 0.3s, border-color 0.3s',
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        {activity.user?.avatar ? (
          <img
            src={activity.user.avatar}
            alt={activity.user.name}
            className="w-9 h-9 rounded-full ring-2 ring-[#2d3748]"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-[#2d3748]"
            style={{
              backgroundColor: `${iconColor}22`,
              color: iconColor,
            }}
          >
            {activity.user
              ? getInitials(activity.user.name)
              : <Icon size={16} />}
          </div>
        )}
        {/* Activity type indicator dot */}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1f2933] flex items-center justify-center"
          style={{ backgroundColor: iconColor }}
        >
          <Icon size={8} className="text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#e2e8f0] leading-snug">
          {activity.user && (
            <span className="font-semibold text-white">
              {activity.user.name}{' '}
            </span>
          )}
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-[#a0aec0]">
            {formatRelativeTime(activity.timestamp)}
          </span>
          <span className="text-[#2d3748]">·</span>
          <div
            className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${status.color}18`,
              color: status.color,
            }}
          >
            <StatusIcon size={11} />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      {/* Hover timestamp */}
      <span className="text-[10px] text-[#a0aec0] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-1">
        {new Date(activity.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-[#2d3748]/50 flex items-center justify-center">
          <Inbox size={28} className="text-[#a0aec0]" />
        </div>
        <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-[#ff4b6e]/5 animate-ping" />
      </div>
      <h3 className="text-[#e2e8f0] text-sm font-semibold mb-1">
        No recent activity
      </h3>
      <p className="text-[#a0aec0] text-xs text-center max-w-[200px]">
        Your recent actions and updates will appear here.
      </p>
    </div>
  );
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  className,
  maxVisible = 5,
}) => {
  const [visibleCount, setVisibleCount] = useState(maxVisible);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 5, activities.length));
      setIsLoadingMore(false);
    }, 600);
  }, [activities.length]);

  const visibleActivities = activities.slice(0, visibleCount);
  const hasMore = visibleCount < activities.length;

  return (
    <div
      className={clsx(
        'bg-[#1f2933] rounded-xl border border-[#2d3748] overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3748]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff4b6e] animate-pulse" />
          <h3 className="text-[#e2e8f0] text-sm font-semibold">
            Recent Activity
          </h3>
        </div>
        {activities.length > 0 && (
          <span className="text-xs text-[#a0aec0] bg-[#2d3748] px-2 py-0.5 rounded-full">
            {activities.length} total
          </span>
        )}
      </div>

      {/* Activity list */}
      <div
        ref={scrollRef}
        className="activity-feed-scroll max-h-[420px] overflow-y-auto px-2 py-2"
      >
        {activities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0.5">
            {visibleActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="px-5 py-3 border-t border-[#2d3748]">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium',
              'bg-[#2d3748]/50 text-[#a0aec0] border border-[#2d3748]',
              'hover:bg-[#2d3748] hover:text-[#e2e8f0]',
              'transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-[0.98]'
            )}
          >
            {isLoadingMore ? (
              <div className="w-4 h-4 border-2 border-[#a0aec0] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ChevronDown size={14} />
                <span>Load more</span>
              </>
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .activity-feed-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .activity-feed-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .activity-feed-scroll::-webkit-scrollbar-thumb {
          background: #2d3748;
          border-radius: 10px;
        }
        .activity-feed-scroll::-webkit-scrollbar-thumb:hover {
          background: #4a5568;
        }
      `}</style>
    </div>
  );
};

ActivityFeed.displayName = 'ActivityFeed';
export default ActivityFeed;
