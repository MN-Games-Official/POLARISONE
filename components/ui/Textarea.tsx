'use client';

import React, { forwardRef, useState, useEffect, useRef, useId } from 'react';
import clsx from 'clsx';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  maxCharacters?: number;
  variant?: 'default' | 'filled';
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      autoResize = false,
      maxCharacters,
      variant = 'default',
      className,
      wrapperClassName,
      id: externalId,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const [focused, setFocused] = useState(false);
    const [charCount, setCharCount] = useState(
      () => String(value ?? defaultValue ?? '').length,
    );
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    };

    const resize = () => {
      const el = internalRef.current;
      if (!el || !autoResize) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
      resize();
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const isOverLimit = maxCharacters != null && charCount > maxCharacters;

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
        <textarea
          ref={setRefs}
          id={id}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={clsx(
            'w-full rounded-lg text-[#e2e8f0] placeholder-[#4a5568] transition-all duration-200 resize-y min-h-[80px]',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0f1419]',
            variant === 'default' && 'bg-[#0f1419] border border-[#2d3748]',
            variant === 'filled' && 'bg-[#1f2933] border border-transparent',
            !(error || isOverLimit) &&
              'focus:border-[#ff4b6e] focus:ring-[#ff4b6e]/30 hover:border-[#4a5568]',
            (error || isOverLimit) && 'border-red-500 focus:ring-red-500/30',
            autoResize && 'resize-none overflow-hidden',
            'px-4 py-2.5 text-sm',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between">
          <div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {!error && helperText && (
              <p className="text-xs text-[#a0aec0]">{helperText}</p>
            )}
          </div>
          {maxCharacters != null && (
            <p
              className={clsx(
                'text-xs tabular-nums',
                isOverLimit ? 'text-red-400' : 'text-[#a0aec0]',
              )}
            >
              {charCount}/{maxCharacters}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
