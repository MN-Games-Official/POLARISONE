'use client';

import React, { forwardRef, useState, useId } from 'react';
import clsx from 'clsx';

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
} as const;

const iconSizeStyles = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-11',
} as const;

const rightIconSizeStyles = {
  sm: 'pr-9',
  md: 'pr-10',
  lg: 'pr-11',
} as const;

export type InputSize = keyof typeof sizeStyles;
export type InputVariant = 'default' | 'filled';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  variant?: InputVariant;
  inputSize?: InputSize;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      iconLeft,
      iconRight,
      variant = 'default',
      inputSize = 'md',
      className,
      wrapperClassName,
      id: externalId,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const [focused, setFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    return (
      <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={id}
            className={clsx(
              'text-sm font-medium transition-colors duration-200',
              focused ? 'text-[#ff4b6e]' : 'text-[#a0aec0]',
              error && 'text-red-400',
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span
              className={clsx(
                'absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aec0] transition-colors duration-200',
                focused && 'text-[#ff4b6e]',
                error && 'text-red-400',
              )}
            >
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={clsx(
              'w-full rounded-lg text-[#e2e8f0] placeholder-[#4a5568] transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0f1419]',
              variant === 'default' && 'bg-[#0f1419] border border-[#2d3748]',
              variant === 'filled' && 'bg-[#1f2933] border border-transparent',
              !error && 'focus:border-[#ff4b6e] focus:ring-[#ff4b6e]/30 hover:border-[#4a5568]',
              error && 'border-red-500 focus:ring-red-500/30',
              sizeStyles[inputSize],
              iconLeft && iconSizeStyles[inputSize],
              iconRight && rightIconSizeStyles[inputSize],
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            {...props}
          />
          {iconRight && (
            <span
              className={clsx(
                'absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] transition-colors duration-200',
                focused && 'text-[#ff4b6e]',
                error && 'text-red-400',
              )}
            >
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#a0aec0]">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
