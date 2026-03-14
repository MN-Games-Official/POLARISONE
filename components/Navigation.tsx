'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Shield,
  Key,
  User,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */
interface TabItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const tabs: TabItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Apps', href: '/application-center', icon: FileText },
  { label: 'Ranks', href: '/rank-center', icon: Shield },
  { label: 'Keys', href: '/api-keys', icon: Key },
  { label: 'Profile', href: '/profile', icon: User },
];

/* ------------------------------------------------------------------ */
/*  Mobile bottom navigation                                           */
/* ------------------------------------------------------------------ */
export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const activeIndex = tabs.findIndex((t) => isActive(t.href));

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-white/5 md:hidden">
      <div className="relative mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {/* Animated active pill */}
        {activeIndex >= 0 && (
          <span
            className="active-pill absolute top-1 h-[calc(100%-8px)] rounded-xl bg-[#ff4b6e]/10 transition-all duration-300 ease-in-out"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${(activeIndex / tabs.length) * 100}%`,
            }}
          />
        )}

        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5
                text-[10px] font-medium transition-colors duration-200
                ${active ? 'text-[#ff4b6e]' : 'text-gray-500'}
              `}
            >
              <span
                className={`
                  flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200
                  ${active ? 'text-[#ff4b6e] drop-shadow-[0_0_6px_rgba(255,75,110,0.45)]' : ''}
                `}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Background & safe-area */}
      <style jsx>{`
        .mobile-bottom-nav {
          background: rgba(15, 20, 25, 0.92);
          backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .active-pill {
          will-change: left;
        }
      `}</style>
    </nav>
  );
}
