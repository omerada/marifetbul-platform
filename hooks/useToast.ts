'use client';

import { useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastCounter = 0;
const toasts: Toast[] = [];
const listeners: ((toasts: Toast[]) => void)[] = [];

const addToast = (
  message: string,
  type: ToastType = 'info',
  duration = 5000
) => {
  const toast: Toast = {
    id: `toast-${++toastCounter}`,
    message,
    type,
    duration,
  };

  toasts.push(toast);
  listeners.forEach((listener) => listener([...toasts]));

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast.id);
    }, duration);
  }

  return toast.id;
};

const removeToast = (id: string) => {
  const index = toasts.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach((listener) => listener([...toasts]));
  }
};

export const useToast = () => {
  const [toastList, setToastList] = useState<Toast[]>([]);

  // Subscribe to toast changes
  useState(() => {
    const listener = (newToasts: Toast[]) => {
      setToastList(newToasts);
    };

    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  });

  const showToast = (
    message: string,
    type: ToastType = 'info',
    duration = 5000
  ) => {
    return addToast(message, type, duration);
  };

  const hideToast = (id: string) => {
    removeToast(id);
  };

  return {
    toasts: toastList,
    showToast,
    hideToast,
  };
};
