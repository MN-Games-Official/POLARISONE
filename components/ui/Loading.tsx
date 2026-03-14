'use client';

import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

/* ─── Spinner ─── */

const spinnerSizes = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
} as const;

export type SpinnerSize = keyof typeof spinnerSizes;

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
}) => (
  <Loader2
    className={clsx('animate-spin text-[#ff4b6e]', spinnerSizes[size], className)}
  />
);

/* ─── Skeleton ─── */

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = '1rem',
  rounded = 'md',
  className,
}) => {
  const roundedMap = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  } as const;

  return (
    <div
      className={clsx(
        'animate-pulse bg-[#2d3748]',
        roundedMap[rounded],
        className,
      )}
      style={{ width, height }}
    />
  );
};

/* ─── Dots ─── */

export interface DotsProps {
  className?: string;
}

export const Dots: React.FC<DotsProps> = ({ className }) => (
  <span className={clsx('inline-flex items-center gap-1', className)}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2 w-2 rounded-full bg-[#ff4b6e]"
        style={{
          animation: `dotBounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
        }}
      />
    ))}
    <style jsx>{`
      @keyframes dotBounce {
        0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </span>
);

/* ─── Bar ─── */

export interface BarProps {
  progress?: number;
  indeterminate?: boolean;
  className?: string;
}

export const Bar: React.FC<BarProps> = ({
  progress,
  indeterminate = false,
  className,
}) => (
  <div
    className={clsx(
      'h-1.5 w-full overflow-hidden rounded-full bg-[#2d3748]',
      className,
    )}
  >
    {indeterminate ? (
      <div
        className="h-full rounded-full bg-[#ff4b6e]"
        style={{
          animation: 'barIndeterminate 1.5s ease-in-out infinite',
        }}
      />
    ) : (
      <div
        className="h-full rounded-full bg-[#ff4b6e] transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress ?? 0))}%` }}
      />
    )}
    <style jsx>{`
      @keyframes barIndeterminate {
        0% { width: 0%; margin-left: 0%; }
        50% { width: 60%; margin-left: 20%; }
        100% { width: 0%; margin-left: 100%; }
      }
    `}</style>
  </div>
);

/* ─── Full-page loading overlay ─── */

export interface LoadingOverlayProps {
  visible?: boolean;
  label?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  label,
  className,
}) => {
  if (!visible) return null;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-4',
        'bg-[#0f1419]/80 backdrop-blur-sm',
        'animate-in fade-in duration-200',
        className,
      )}
    >
      <Spinner size="lg" />
      {label && <p className="text-sm text-[#a0aec0]">{label}</p>}
    </div>
  );
};

/* ─── Unified Loading component ─── */

export interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'dots' | 'bar' | 'overlay';
  size?: SpinnerSize;
  label?: string;
  progress?: number;
  indeterminate?: boolean;
  skeletonWidth?: string | number;
  skeletonHeight?: string | number;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size,
  label,
  progress,
  indeterminate,
  skeletonWidth,
  skeletonHeight,
  className,
}) => {
  switch (variant) {
    case 'spinner':
      return <Spinner size={size} className={className} />;
    case 'skeleton':
      return (
        <Skeleton
          width={skeletonWidth}
          height={skeletonHeight}
          className={className}
        />
      );
    case 'dots':
      return <Dots className={className} />;
    case 'bar':
      return (
        <Bar
          progress={progress}
          indeterminate={indeterminate}
          className={className}
        />
      );
    case 'overlay':
      return <LoadingOverlay label={label} className={className} />;
    default:
      return <Spinner size={size} className={className} />;
  }
};

Loading.displayName = 'Loading';
Spinner.displayName = 'Spinner';
Skeleton.displayName = 'Skeleton';
Dots.displayName = 'Dots';
Bar.displayName = 'Bar';
LoadingOverlay.displayName = 'LoadingOverlay';

export default Loading;
