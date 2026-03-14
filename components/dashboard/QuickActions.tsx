'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import {
  FilePlus2,
  Award,
  KeyRound,
  UserCircle,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  gradient: string;
}

export interface QuickActionsProps {
  className?: string;
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    id: 'new-application',
    title: 'New Application',
    description: 'Create and submit a new application for review',
    icon: FilePlus2,
    href: '/applications/new',
    color: '#3b82f6',
    gradient: 'from-blue-500/10 to-blue-600/5',
  },
  {
    id: 'new-rank-center',
    title: 'New Rank Center',
    description: 'Set up a new rank center for your organization',
    icon: Award,
    href: '/rank-centers/new',
    color: '#f59e0b',
    gradient: 'from-amber-500/10 to-amber-600/5',
  },
  {
    id: 'manage-api-keys',
    title: 'Manage API Keys',
    description: 'Create, rotate, or revoke your API access keys',
    icon: KeyRound,
    href: '/api-keys',
    color: '#8b5cf6',
    gradient: 'from-violet-500/10 to-violet-600/5',
  },
  {
    id: 'view-profile',
    title: 'View Profile',
    description: 'Review and update your account information',
    icon: UserCircle,
    href: '/profile',
    color: '#ff4b6e',
    gradient: 'from-pink-500/10 to-pink-600/5',
  },
];

function QuickActionCard({ action, index }: { action: QuickAction; index: number }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const Icon = action.icon;

  return (
    <button
      onClick={() => router.push(action.href)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        'group relative w-full text-left overflow-hidden rounded-xl p-5',
        'bg-[#1f2933] border border-[#2d3748]',
        'transition-all duration-400 ease-out',
        'hover:shadow-xl hover:-translate-y-1.5',
        'active:scale-[0.98] active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b6e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]'
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'quick-action-in 0.5s ease-out forwards',
        opacity: 0,
        transform: 'translateY(12px)',
      }}
    >
      {/* Background gradient on hover */}
      <div
        className={clsx(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
          action.gradient
        )}
        style={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* Accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${action.color}, transparent)`,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
        }}
      />

      {/* Corner glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundColor: action.color,
          opacity: isHovered ? 0.08 : 0,
        }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
          style={{
            backgroundColor: `${action.color}15`,
            boxShadow: isHovered ? `0 4px 15px ${action.color}25` : 'none',
          }}
        >
          <Icon
            size={22}
            style={{ color: action.color }}
            className={clsx(
              'transition-transform duration-300',
              isHovered && 'scale-110'
            )}
          />
        </div>

        {/* Text */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[#e2e8f0] text-sm font-semibold mb-1 group-hover:text-white transition-colors duration-200">
              {action.title}
            </h3>
            <p className="text-[#a0aec0] text-xs leading-relaxed line-clamp-2">
              {action.description}
            </p>
          </div>

          {/* Arrow */}
          <div
            className={clsx(
              'flex-shrink-0 mt-0.5 p-1 rounded-md transition-all duration-300',
              'text-[#a0aec0] group-hover:text-white'
            )}
            style={{
              backgroundColor: isHovered ? `${action.color}20` : 'transparent',
            }}
          >
            <ArrowRight
              size={14}
              className={clsx(
                'transition-transform duration-300',
                isHovered && 'translate-x-0.5'
              )}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  className,
  actions = defaultActions,
}) => {
  return (
    <>
      <div className={clsx('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <h3 className="text-[#e2e8f0] text-sm font-semibold">
            Quick Actions
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#2d3748] to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <QuickActionCard key={action.id} action={action} index={index} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes quick-action-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

QuickActions.displayName = 'QuickActions';
export default QuickActions;
