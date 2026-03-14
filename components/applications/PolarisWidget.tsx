'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Sparkles, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PolarisWidgetProps {
  /** Callback fired when the widget button is clicked. */
  onClick: () => void;
  /** Optional label shown in the tooltip. */
  label?: string;
  /** If true the widget starts visible without requiring hover. */
  showLabel?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PolarisWidget({
  onClick,
  label = 'Generate with AI',
  showLabel = false,
}: PolarisWidgetProps) {
  const [hovered, setHovered] = useState(showLabel);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2">
      {/* Tooltip / label */}
      <div
        className={clsx(
          'mb-2 whitespace-nowrap rounded-lg border border-[#2d3748] bg-[#1a1f25] px-3 py-1.5 text-xs text-[#e2e8f0] shadow-xl transition-all duration-300',
          hovered
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-2 opacity-0',
        )}
      >
        <span className="mr-1 text-[#ff4b6e]">✦</span>
        {label}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="ml-2 text-[#4a5568] transition hover:text-[#a0aec0]"
          aria-label="Dismiss"
        >
          <X className="inline h-3 w-3" />
        </button>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={clsx(
          'group relative flex h-14 w-14 items-center justify-center rounded-2xl',
          'bg-gradient-to-br from-[#ff4b6e] to-[#e8435f] text-white',
          'shadow-lg shadow-[#ff4b6e]/30 transition-all duration-300',
          'hover:scale-110 hover:shadow-xl hover:shadow-[#ff4b6e]/40',
          'active:scale-95',
        )}
        aria-label="Open AI form generator"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 animate-ping rounded-2xl bg-[#ff4b6e]/30" />
        <span className="absolute inset-0 animate-pulse rounded-2xl bg-[#ff4b6e]/10" />

        {/* Icon */}
        <Sparkles className="relative h-6 w-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />

        {/* Polaris badge */}
        <span className="absolute -right-1 -top-1 flex h-5 items-center rounded-full bg-[#1a1f25] px-1.5 text-[8px] font-bold tracking-wider text-[#ff4b6e] shadow-md ring-1 ring-[#2d3748]">
          AI
        </span>
      </button>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
