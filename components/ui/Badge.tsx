'use client';

import React from 'react';
import clsx from 'clsx';

const variantStyles = {
  primary: 'bg-[#ff4b6e]/15 text-[#ff4b6e] border-[#ff4b6e]/30',
  secondary: 'bg-[#1f2933] text-[#a0aec0] border-[#2d3748]',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  outline: 'bg-transparent text-[#a0aec0] border-[#2d3748]',
} as const;

const sizeStyles = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
} as const;

const dotColors = {
  primary: 'bg-[#ff4b6e]',
  secondary: 'bg-[#a0aec0]',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  outline: 'bg-[#a0aec0]',
} as const;

export type BadgeVariant = keyof typeof variantStyles;
export type BadgeSize = keyof typeof sizeStyles;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'sm',
  dot = false,
  pulse = false,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap',
        'transition-colors duration-200',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={clsx(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                dotColors[variant],
              )}
            />
          )}
          <span
            className={clsx(
              'relative inline-flex h-2 w-2 rounded-full',
              dotColors[variant],
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
