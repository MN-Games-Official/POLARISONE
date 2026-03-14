'use client';

import React, { forwardRef, useState, useId } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  options: SelectOption[];
  placeholder?: string;
  selectSize?: 'sm' | 'md' | 'lg';
  wrapperClassName?: string;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm pr-9',
  md: 'px-4 py-2.5 text-sm pr-10',
  lg: 'px-4 py-3 text-base pr-11',
} as const;

const iconSizeStyles = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-11',
} as const;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      options,
      placeholder,
      selectSize = 'md',
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

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
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
          {icon && (
            <span
              className={clsx(
                'absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aec0] transition-colors duration-200 pointer-events-none',
                focused && 'text-[#ff4b6e]',
                error && 'text-red-400',
              )}
            >
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={id}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={clsx(
              'w-full rounded-lg text-[#e2e8f0] bg-[#0f1419] border border-[#2d3748] appearance-none cursor-pointer transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0f1419]',
              !error &&
                'focus:border-[#ff4b6e] focus:ring-[#ff4b6e]/30 hover:border-[#4a5568]',
              error && 'border-red-500 focus:ring-red-500/30',
              sizeStyles[selectSize],
              icon && iconSizeStyles[selectSize],
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-[#4a5568]">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-[#1a1f25] text-[#e2e8f0]"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className={clsx(
              'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200',
              focused ? 'text-[#ff4b6e]' : 'text-[#a0aec0]',
            )}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#a0aec0]">{helperText}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
