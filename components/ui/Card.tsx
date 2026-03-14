'use client';

import React, { forwardRef } from 'react';
import clsx from 'clsx';

const variantStyles = {
  default: 'bg-[#1a1f25] border border-[#2d3748]',
  outlined: 'bg-transparent border border-[#2d3748]',
  elevated: 'bg-[#1a1f25] border border-[#2d3748] shadow-lg shadow-black/20',
  gradient:
    'bg-gradient-to-br from-[#1a1f25] to-[#0f1419] border border-[#2d3748]',
} as const;

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

export type CardVariant = keyof typeof variantStyles;
export type CardPadding = keyof typeof paddingStyles;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      header,
      footer,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-xl overflow-hidden transition-all duration-300',
          variantStyles[variant],
          interactive && [
            'cursor-pointer',
            'hover:border-[#ff4b6e]/40 hover:shadow-xl hover:shadow-[#ff4b6e]/5',
            'hover:-translate-y-0.5',
            'active:translate-y-0 active:shadow-lg',
          ],
          className,
        )}
        {...props}
      >
        {header && (
          <div className="border-b border-[#2d3748] px-6 py-4">{header}</div>
        )}
        <div className={paddingStyles[padding]}>{children}</div>
        {footer && (
          <div className="border-t border-[#2d3748] px-6 py-4">{footer}</div>
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
