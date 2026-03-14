'use client';

import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary:
    'bg-[#ff4b6e] text-white hover:bg-[#e8435f] active:bg-[#d43b55] shadow-md hover:shadow-[0_0_20px_rgba(255,75,110,0.3)] focus-visible:ring-[#ff4b6e]',
  secondary:
    'bg-[#1f2933] text-[#e2e8f0] hover:bg-[#2d3748] active:bg-[#374151] border border-[#2d3748] focus-visible:ring-[#2d3748]',
  outline:
    'bg-transparent text-[#e2e8f0] border border-[#2d3748] hover:bg-[#1a1f25] hover:border-[#ff4b6e] active:bg-[#1f2933] focus-visible:ring-[#ff4b6e]',
  ghost:
    'bg-transparent text-[#a0aec0] hover:text-[#e2e8f0] hover:bg-[#1a1f25] active:bg-[#1f2933] focus-visible:ring-[#2d3748]',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] focus-visible:ring-red-500',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] focus-visible:ring-emerald-500',
} as const;

const sizeStyles = {
  xs: 'px-2.5 py-1 text-xs gap-1 rounded-md',
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-base gap-2 rounded-xl',
  xl: 'px-6 py-3 text-lg gap-2.5 rounded-xl',
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]',
          'transform active:scale-[0.97]',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'pointer-events-none opacity-50',
          className,
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin shrink-0" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
        )}
        {!loading && iconLeft && <span className="shrink-0">{iconLeft}</span>}
        {children}
        {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
