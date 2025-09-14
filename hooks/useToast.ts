'use client';

import React, { useCallback, useContext } from 'react';
import { ToastVariant } from '@/components/ui/Toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastData extends ToastOptions {
  id: string;
  createdAt: number;
}

// Context interface
export interface ToastContextType {
  toasts: ToastData[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

// Create context (will be defined in ToastProvider)
export const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearAllToasts, toasts } = context;

  // Convenience methods for different toast types
  const toast = useCallback(
    (options: ToastOptions) => {
      return addToast(options);
    },
    [addToast]
  );

  const success = useCallback(
    (
      title: string,
      description?: string,
      options?: Omit<ToastOptions, 'title' | 'description' | 'variant'>
    ) => {
      return addToast({
        title,
        description,
        variant: 'success',
        ...options,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (
      title: string,
      description?: string,
      options?: Omit<ToastOptions, 'title' | 'description' | 'variant'>
    ) => {
      return addToast({
        title,
        description,
        variant: 'error',
        duration: 7000, // Longer duration for errors
        ...options,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (
      title: string,
      description?: string,
      options?: Omit<ToastOptions, 'title' | 'description' | 'variant'>
    ) => {
      return addToast({
        title,
        description,
        variant: 'warning',
        ...options,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (
      title: string,
      description?: string,
      options?: Omit<ToastOptions, 'title' | 'description' | 'variant'>
    ) => {
      return addToast({
        title,
        description,
        variant: 'info',
        ...options,
      });
    },
    [addToast]
  );

  // Promise-based toast for async operations
  const promise = useCallback(
    <T>(
      promise: Promise<T>,
      options: {
        loading?: ToastOptions;
        success?: ToastOptions | ((data: T) => ToastOptions);
        error?: ToastOptions | ((error: Error) => ToastOptions);
      }
    ) => {
      let loadingToastId: string | null = null;

      // Show loading toast
      if (options.loading) {
        loadingToastId = addToast({
          ...options.loading,
          duration: 0, // Don't auto-close loading toast
        });
      }

      return promise
        .then((data) => {
          // Remove loading toast
          if (loadingToastId) {
            removeToast(loadingToastId);
          }

          // Show success toast
          if (options.success) {
            const successOptions =
              typeof options.success === 'function'
                ? options.success(data)
                : options.success;
            addToast({
              variant: 'success',
              ...successOptions,
            });
          }

          return data;
        })
        .catch((error) => {
          // Remove loading toast
          if (loadingToastId) {
            removeToast(loadingToastId);
          }

          // Show error toast
          if (options.error) {
            const errorOptions =
              typeof options.error === 'function'
                ? options.error(error)
                : options.error;
            addToast({
              variant: 'error',
              duration: 7000,
              ...errorOptions,
            });
          }

          throw error;
        });
    },
    [addToast, removeToast]
  );

  // Dismiss specific toast
  const dismiss = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast]
  );

  // Clear all toasts
  const clear = useCallback(() => {
    clearAllToasts();
  }, [clearAllToasts]);

  return {
    toast,
    success,
    error,
    warning,
    info,
    promise,
    dismiss,
    clear,
    toasts,
  };
}

// Export types for convenience
export type { ToastVariant };
