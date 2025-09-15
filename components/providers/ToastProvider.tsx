'use client';

import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { Toast, ToastPosition } from '@/components/ui/Toast';
import {
  ToastContext,
  ToastData,
  ToastOptions,
  ToastContextType,
} from '@/hooks';

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (options: ToastOptions): string => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: ToastData = {
        id,
        createdAt: Date.now(),
        ...options,
      };

      setToasts((prevToasts) => {
        const updatedToasts = [...prevToasts, newToast];

        // Limit the number of toasts
        if (updatedToasts.length > maxToasts) {
          return updatedToasts.slice(-maxToasts);
        }

        return updatedToasts;
      });

      return id;
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      clearAllToasts,
    }),
    [toasts, addToast, removeToast, clearAllToasts]
  );

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container Portal */}
      {typeof window !== 'undefined' && (
        <div
          className={`pointer-events-auto fixed z-50 flex w-full max-w-sm flex-col gap-2 ${positionStyles[position]}`}
          aria-live="polite"
          aria-label="Notifications"
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              duration={toast.duration}
              closable={toast.closable}
              action={toast.action}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
