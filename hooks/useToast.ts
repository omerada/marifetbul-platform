'use client';

import { useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
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

  const success = (message: string, duration = 5000) => {
    return showToast(message, 'success', duration);
  };

  const error = (message: string, duration = 5000) => {
    return showToast(message, 'error', duration);
  };

  const warning = (message: string, duration = 5000) => {
    return showToast(message, 'warning', duration);
  };

  const info = (message: string, duration = 5000) => {
    return showToast(message, 'info', duration);
  };

  return {
    toasts: toastList,
    showToast,
    hideToast,
    removeToast: hideToast,
    success,
    error,
    warning,
    info,
  };
};
