'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Shield,
  Key,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Application Center', href: '/application-center', icon: FileText },
  { label: 'Rank Center', href: '/rank-center', icon: Shield },
  { label: 'API Keys', href: '/api-keys', icon: Key },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = useCallback(
    (href: string) => {
      if (href === '/dashboard') {
        return pathname === '/dashboard';
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // Close mobile drawer on route change
  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
  };

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? '??';

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand / Logo */}
      <div className="relative flex items-center gap-3 border-b border-white/5 px-4 py-5">
        <div className="sidebar-logo-glow relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4b6e] to-[#ff6b8a]">
          <Sparkles className="h-5 w-5 text-white" />
          <span className="sidebar-logo-ring absolute inset-0 rounded-xl" />
        </div>

        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold tracking-wide text-white">
              Polaris Pilot
            </span>
            <span className="text-[11px] text-gray-500">
              Management Platform
            </span>
          </div>
        )}

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto hidden h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white md:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Navigation
          </p>
        )}

        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                sidebar-nav-item group relative flex items-center gap-3 rounded-lg px-3 py-2.5
                text-sm font-medium transition-all duration-200
                ${
                  active
                    ? 'bg-gradient-to-r from-[#ff4b6e]/15 to-transparent text-white'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                }
              `}
            >
              {/* Active left border accent */}
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#ff4b6e] shadow-[0_0_8px_rgba(255,75,110,0.6)]" />
              )}

              <span
                className={`
                  flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200
                  ${
                    active
                      ? 'bg-[#ff4b6e]/20 text-[#ff4b6e] shadow-[0_0_12px_rgba(255,75,110,0.25)]'
                      : 'text-gray-500 group-hover:text-gray-300'
                  }
                `}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>

              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {/* Hover glow */}
              {!active && (
                <span className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(ellipse at left, rgba(255,75,110,0.04) 0%, transparent 70%)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/5" />

      {/* User section */}
      <div className="p-3">
        <div
          className={`
            flex items-center gap-3 rounded-lg p-3 transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {/* Avatar */}
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name ?? user.username}
              className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4b6e] to-[#ff6b8a] text-xs font-bold text-white">
              {userInitials}
            </div>
          )}

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.full_name ?? user?.username ?? 'User'}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user?.email ?? ''}
              </p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`
            mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
            text-gray-400 transition-all duration-200
            hover:bg-red-500/10 hover:text-red-400
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform bg-[#0f1419] transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          sidebar-desktop hidden h-screen flex-col border-r border-white/5 bg-[#0f1419]
          transition-[width] duration-300 ease-in-out md:flex
          ${collapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Styles */}
      <style jsx global>{`
        /* Logo animated glow */
        .sidebar-logo-glow {
          animation: sidebarLogoGlow 3s ease-in-out infinite;
        }
        @keyframes sidebarLogoGlow {
          0%,
          100% {
            box-shadow: 0 0 12px rgba(255, 75, 110, 0.3);
          }
          50% {
            box-shadow: 0 0 24px rgba(255, 75, 110, 0.55);
          }
        }

        .sidebar-logo-ring {
          border: 1.5px solid rgba(255, 75, 110, 0.25);
          animation: sidebarRingPulse 3s ease-in-out infinite;
        }
        @keyframes sidebarRingPulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        /* Sidebar desktop sticky */
        .sidebar-desktop {
          position: sticky;
          top: 0;
        }

        /* Smooth transition for nav items */
        .sidebar-nav-item {
          will-change: background-color, color;
        }
      `}</style>
    </>
  );
}
