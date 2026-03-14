'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

/* ─── Types ─── */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (data: Omit<ToastData, 'id'>) => string;
  dismiss: (id: string) => void;
}

/* ─── Context ─── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

/* ─── Config ─── */

const typeConfig = {
  success: {
    icon: CheckCircle2,
    accent: 'border-l-emerald-500',
    iconColor: 'text-emerald-400',
    progressColor: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    accent: 'border-l-red-500',
    iconColor: 'text-red-400',
    progressColor: 'bg-red-500',
  },
  info: {
    icon: Info,
    accent: 'border-l-blue-500',
    iconColor: 'text-blue-400',
    progressColor: 'bg-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'border-l-amber-500',
    iconColor: 'text-amber-400',
    progressColor: 'bg-amber-500',
  },
} as const;

/* ─── Single Toast ─── */

interface ToastItemProps {
  data: ToastData;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ data, onDismiss }) => {
  const { type, title, description, duration = 5000, id } = data;
  const config = typeConfig[type];
  const Icon = config.icon;

  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number>();

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        dismiss();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, dismiss]);

  return (
    <div
      className={clsx(
        'pointer-events-auto relative w-80 overflow-hidden rounded-lg border border-[#2d3748] border-l-4 bg-[#1a1f25] shadow-xl',
        'transition-all duration-300 ease-out',
        config.accent,
        exiting
          ? 'translate-x-full opacity-0'
          : 'translate-x-0 opacity-100 animate-in slide-in-from-right',
      )}
      style={{
        animation: exiting ? undefined : 'toastSlideIn 0.3s ease-out',
      }}
    >
      <div className="flex gap-3 p-4">
        <Icon size={20} className={clsx('shrink-0 mt-0.5', config.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#e2e8f0]">{title}</p>
          {description && (
            <p className="mt-1 text-xs text-[#a0aec0]">{description}</p>
          )}
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-[#a0aec0] transition-colors duration-200 hover:bg-white/5 hover:text-[#e2e8f0] focus:outline-none"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* progress bar */}
      <div className="h-0.5 w-full bg-[#2d3748]">
        <div
          className={clsx('h-full transition-none', config.progressColor)}
          style={{ width: `${progress}%` }}
        />
      </div>

      <style jsx>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

/* ─── Provider ─── */

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const counter = useRef(0);

  const toast = useCallback((data: Omit<ToastData, 'id'>): string => {
    const id = `toast-${++counter.current}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...data, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none"
            aria-live="polite"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} data={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
};

/* ─── Standalone Toast display component ─── */

export const Toast: React.FC<ToastItemProps> = ToastItem;

ToastProvider.displayName = 'ToastProvider';
Toast.displayName = 'Toast';

export default Toast;
