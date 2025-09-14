'use client';

import { cn } from '@/lib/utils';
import {
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

export interface ToastContainerProps {
  position?: ToastPosition;
  maxToasts?: number;
  className?: string;
}

const ToastIcons = {
  success: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  warning: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  ),
  info: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  default: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-5 5-5-5h5z"
      />
    </svg>
  ),
};

export function Toast({
  title,
  description,
  variant = 'default',
  duration = 5000,
  closable = true,
  onClose,
  action,
  icon,
  className,
  ...props
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    // Animation entrance
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto close
    let autoCloseTimer: NodeJS.Timeout;
    if (duration > 0) {
      autoCloseTimer = setTimeout(handleClose, duration);
    }

    return () => {
      clearTimeout(enterTimer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [duration, handleClose]);

  const variantStyles = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColorStyles = {
    default: 'text-gray-500',
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const progressBarStyles = {
    default: 'bg-gray-300',
    success: 'bg-green-300',
    error: 'bg-red-300',
    warning: 'bg-yellow-300',
    info: 'bg-blue-300',
  };

  return (
    <div
      className={cn(
        'relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200 ease-in-out',
        variantStyles[variant],
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        isExiting && 'scale-95',
        className
      )}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 pt-0.5', iconColorStyles[variant])}>
        {icon || ToastIcons[variant]}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {title && (
          <div className="mb-1 text-sm leading-5 font-semibold">{title}</div>
        )}
        {description && (
          <div className="text-sm leading-5 opacity-90">{description}</div>
        )}
        {action && (
          <div className="mt-2">
            <button
              onClick={action.onClick}
              className={cn(
                'text-xs font-medium underline-offset-4 hover:underline focus:outline-none',
                iconColorStyles[variant]
              )}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      {/* Close Button */}
      {closable && (
        <button
          onClick={handleClose}
          className={cn(
            'flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:ring-2 focus:ring-offset-2 focus:outline-none',
            iconColorStyles[variant]
          )}
          aria-label="Close notification"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-lg bg-black/10">
          <div
            className={cn(
              'h-full transition-all ease-linear',
              progressBarStyles[variant]
            )}
            style={{
              width: '100%',
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer({
  position = 'top-right',
  className,
}: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex w-full max-w-sm flex-col gap-2',
        positionStyles[position],
        className
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {/* Container for toasts - will be populated by toast manager */}
    </div>,
    document.body
  );
}

// CSS for progress bar animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-progress {
      from { width: 100%; }
      to { width: 0%; }
    }
  `;
  if (!document.head.querySelector('style[data-toast-styles]')) {
    style.setAttribute('data-toast-styles', 'true');
    document.head.appendChild(style);
  }
}
