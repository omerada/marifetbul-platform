'use client';

/**
 * ================================================
 * TOAST MANAGER COMPONENT
 * ================================================
 * Renders and manages toast notifications
 * Connected to useToast hook via global state
 *
 * Day 2 Story 2.3 - Sprint 2
 */

'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/hooks/core/useToast';
import { Toast } from '@/components/ui/Toast';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Get icon for toast type
 */
const getToastIcon = (type: 'success' | 'error' | 'warning' | 'info') => {
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };
  return icons[type];
};

/**
 * Toast Manager Component
 */
export function ToastManager() {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            title={toast.title}
            description={toast.message}
            variant={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
            icon={getToastIcon(toast.type)}
            action={toast.action}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}

export default ToastManager;
