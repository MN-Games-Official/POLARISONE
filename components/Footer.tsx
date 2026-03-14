'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Footer links                                                       */
/* ------------------------------------------------------------------ */
interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const footerLinks: FooterLink[] = [
  { label: 'Documentation', href: '/docs', external: true },
  { label: 'Support', href: '/support', external: true },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

/* ------------------------------------------------------------------ */
/*  Footer component                                                   */
/* ------------------------------------------------------------------ */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#0f1419]/60 px-4 py-4 md:px-6">
      <div className="mx-auto flex flex-col items-center justify-between gap-3 sm:flex-row">
        {/* Copyright & version */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>&copy; {year} Polaris Pilot</span>
          <span className="text-gray-700">·</span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
            v0.1.0
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-300"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-gray-500 transition-colors hover:text-gray-300"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
