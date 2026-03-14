'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';

const typeConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-300',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10 border-amber-500/30',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-500/10 border-red-500/30',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
  },
} as const;

export type AlertType = keyof typeof typeConfig;

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={clsx(
        'flex gap-3 rounded-lg border p-4 animate-in slide-in-from-top-2 fade-in duration-300',
        config.bg,
        className,
      )}
      style={{
        animation: 'alertSlideIn 0.3s ease-out',
      }}
    >
      <Icon size={20} className={clsx('shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={clsx('text-sm font-semibold', config.titleColor)}>
            {title}
          </p>
        )}
        {children && (
          <div
            className={clsx(
              'text-sm text-[#a0aec0]',
              title && 'mt-1',
            )}
          >
            {children}
          </div>
        )}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 text-[#a0aec0] transition-colors duration-200 hover:bg-white/5 hover:text-[#e2e8f0] focus:outline-none"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
      <style jsx>{`
        @keyframes alertSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

Alert.displayName = 'Alert';

export default Alert;
