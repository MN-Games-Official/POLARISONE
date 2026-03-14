'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronRight,
  Menu,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/* ------------------------------------------------------------------ */
/*  Route → readable title map                                        */
/* ------------------------------------------------------------------ */
const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/application-center': 'Application Center',
  '/rank-center': 'Rank Center',
  '/api-keys': 'API Keys',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  for (const [route, title] of Object.entries(routeTitles)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return title;
    }
  }
  return 'Dashboard';
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });
}

/* ------------------------------------------------------------------ */
/*  Header component                                                  */
/* ------------------------------------------------------------------ */
interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationCount = 3; // decorative

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);
  const breadcrumbs = useMemo(() => getBreadcrumbs(pathname), [pathname]);

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? '??';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <header className="header-glass sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 px-4 py-3 md:px-6">
      {/* Left: hamburger + breadcrumbs + title */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          {/* Breadcrumbs */}
          <nav className="mb-0.5 flex items-center gap-1 text-xs text-gray-500">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-gray-300"
            >
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight className="h-3 w-3 shrink-0 text-gray-600" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="truncate text-gray-400">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate transition-colors hover:text-gray-300"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Page title */}
          <h1 className="truncate text-lg font-semibold text-white">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: search + notifications + user */}
      <div className="flex items-center gap-2">
        {/* Search bar – decorative */}
        <div className="relative hidden items-center md:flex">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-56 rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-gray-300 placeholder-gray-500 outline-none transition-all duration-200 focus:border-[#ff4b6e]/40 focus:ring-1 focus:ring-[#ff4b6e]/20 lg:w-64"
          />
        </div>

        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff4b6e] px-1 text-[10px] font-bold text-white shadow-[0_0_6px_rgba(255,75,110,0.5)]">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/5"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name ?? user.username}
                className="h-8 w-8 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ff4b6e] to-[#ff6b8a] text-xs font-bold text-white">
                {userInitials}
              </div>
            )}
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#151b23] shadow-xl shadow-black/40">
              {/* User info */}
              <div className="border-b border-white/5 p-3">
                <p className="truncate text-sm font-medium text-white">
                  {user?.full_name ?? user?.username ?? 'User'}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {user?.email ?? ''}
                </p>
              </div>

              {/* Links */}
              <div className="p-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Settings className="h-4 w-4 text-gray-500" />
                  Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-white/5 p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4 text-gray-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Glass-morphism styles */}
      <style jsx>{`
        .header-glass {
          background: rgba(15, 20, 25, 0.78);
          backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
        }
      `}</style>
    </header>
  );
}
