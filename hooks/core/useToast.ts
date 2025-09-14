/**
 * Unified Toast Hook - Optimized and Memoized
 * Combines all toast functionality with performance optimizations
 */
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  listeners: Set<(toasts: Toast[]) => void>;
}

// Global toast store - singleton pattern
class ToastManager {
  private store: ToastStore = {
    toasts: [],
    listeners: new Set(),
  };

  private toastCounter = 0;

  subscribe(listener: (toasts: Toast[]) => void) {
    this.store.listeners.add(listener);
    return () => {
      this.store.listeners.delete(listener);
    };
  }

  notify() {
    this.store.listeners.forEach((listener) =>
      listener([...this.store.toasts])
    );
  }

  addToast(toast: Omit<Toast, 'id'>): string {
    const id = `toast_${++this.toastCounter}_${Date.now()}`;
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    this.store.toasts.push(newToast);
    this.notify();

    // Auto remove
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }

    return id;
  }

  removeToast(id: string) {
    const index = this.store.toasts.findIndex((toast) => toast.id === id);
    if (index > -1) {
      this.store.toasts.splice(index, 1);
      this.notify();
    }
  }

  clearAll() {
    this.store.toasts.length = 0;
    this.notify();
  }

  getToasts() {
    return [...this.store.toasts];
  }
}

// Singleton instance
const toastManager = new ToastManager();

export interface UseToastReturn {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (
    title: string,
    message?: string,
    options?: Partial<Toast>
  ) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (
    title: string,
    message?: string,
    options?: Partial<Toast>
  ) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>(() => toastManager.getToasts());

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  // Memoized actions
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    return toastManager.addToast(toast);
  }, []);

  const removeToast = useCallback((id: string) => {
    toastManager.removeToast(id);
  }, []);

  const clearToasts = useCallback(() => {
    toastManager.clearAll();
  }, []);

  // Convenience methods - memoized
  const success = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'success', title, message, ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'error', title, message, ...options });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'warning', title, message, ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'info', title, message, ...options });
    },
    [addToast]
  );

  // Memoized return object
  return useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      clearToasts,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, clearToasts, success, error, warning, info]
  );
}

export default useToast;
