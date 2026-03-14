'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
} as const;

export type ModalSize = keyof typeof sizeStyles;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  title,
  description,
  footer,
  children,
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onClose();
    },
    [onClose, closeOnEscape],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, handleEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === overlayRef.current) onClose();
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-sm',
        'transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={clsx(
          'w-full rounded-xl bg-[#1a1f25] border border-[#2d3748] shadow-2xl',
          'transition-all duration-300 ease-out',
          visible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-8 scale-95 opacity-0',
          sizeStyles[size],
          className,
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-0">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-[#e2e8f0]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-[#a0aec0]">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-[#a0aec0] transition-all duration-200 hover:bg-[#2d3748] hover:text-[#e2e8f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b6e]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[#2d3748] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

Modal.displayName = 'Modal';

export default Modal;
