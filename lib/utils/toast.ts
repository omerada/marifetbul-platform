/**
 * TOAST UTILITY FUNCTIONS
 * ================================================
 * Enhanced toast notification system
 * Sprint EPIC 4 - Story 4.4: Enhanced Toast System
 *
 * Built on top of sonner (already installed)
 * Provides standardized toast messages for common scenarios
 *
 * Features:
 * - API error handling
 * - Success messages
 * - Warning notifications
 * - Action confirmations
 * - Loading states
 * - Custom duration and actions
 */

import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  icon?: React.ReactNode;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ============================================================================
// SUCCESS TOASTS
// ============================================================================

/**
 * Show success toast
 */
export function showSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action,
    icon: options?.icon,
  });
}

/**
 * Common success messages
 */
export const successToasts = {
  created: (entityName: string) =>
    showSuccess(`${entityName} başarıyla oluşturuldu`),

  updated: (entityName: string) =>
    showSuccess(`${entityName} başarıyla güncellendi`),

  deleted: (entityName: string) =>
    showSuccess(`${entityName} başarıyla silindi`),

  saved: () => showSuccess('Değişiklikler kaydedildi'),

  sent: () => showSuccess('Mesaj gönderildi'),

  uploaded: () => showSuccess('Dosya yüklendi'),

  copied: () => showSuccess('Panoya kopyalandı', { duration: 2000 }),
};

// ============================================================================
// ERROR TOASTS
// ============================================================================

/**
 * Show error toast
 */
export function showError(message: string, options?: ToastOptions) {
  return toast.error(message, {
    duration: options?.duration || 6000,
    description: options?.description,
    action: options?.action,
    icon: options?.icon,
  });
}

/**
 * Handle API errors
 */
export function showApiError(error: unknown, fallbackMessage?: string) {
  const errorResponse = error as ApiErrorResponse;

  // Extract error message
  let message = fallbackMessage || 'Bir hata oluştu';
  let description: string | undefined;

  if (errorResponse?.message) {
    message = errorResponse.message;
  } else if (errorResponse?.error) {
    message = errorResponse.error;
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Handle validation errors
  if (errorResponse?.errors) {
    const firstError = Object.values(errorResponse.errors)[0];
    if (firstError && firstError.length > 0) {
      description = firstError[0];
    }
  }

  return showError(message, { description });
}

/**
 * Common error messages
 */
export const errorToasts = {
  fetchFailed: (entityName: string) =>
    showError(`${entityName} yüklenirken hata oluştu`),

  saveFailed: () => showError('Kaydetme işlemi başarısız oldu'),

  deleteFailed: () => showError('Silme işlemi başarısız oldu'),

  uploadFailed: () => showError('Dosya yüklenemedi'),

  networkError: () =>
    showError('Bağlantı hatası', {
      description: 'İnternet bağlantınızı kontrol edin',
    }),

  unauthorized: () =>
    showError('Yetki hatası', {
      description: 'Bu işlem için yetkiniz bulunmuyor',
    }),

  notFound: (entityName: string) => showError(`${entityName} bulunamadı`),
};

// ============================================================================
// WARNING TOASTS
// ============================================================================

/**
 * Show warning toast
 */
export function showWarning(message: string, options?: ToastOptions) {
  return toast.warning(message, {
    duration: options?.duration || 5000,
    description: options?.description,
    action: options?.action,
    icon: options?.icon,
  });
}

/**
 * Common warning messages
 */
export const warningToasts = {
  unsavedChanges: () =>
    showWarning('Kaydedilmemiş değişiklikler var', {
      description: 'Değişiklikleriniz kaybolabilir',
    }),

  limitReached: (limitName: string) =>
    showWarning(`${limitName} sınırına ulaşıldı`),

  slowConnection: () =>
    showWarning('Bağlantı yavaş', {
      description: 'İşlem daha uzun sürebilir',
    }),
};

// ============================================================================
// INFO TOASTS
// ============================================================================

/**
 * Show info toast
 */
export function showInfo(message: string, options?: ToastOptions) {
  return toast.info(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action,
    icon: options?.icon,
  });
}

/**
 * Common info messages
 */
export const infoToasts = {
  processing: () => showInfo('İşleminiz gerçekleştiriliyor'),

  queued: () => showInfo('İşleminiz sıraya alındı'),

  emailSent: (email: string) =>
    showInfo('E-posta gönderildi', {
      description: `${email} adresine gönderildi`,
    }),
};

// ============================================================================
// LOADING TOASTS
// ============================================================================

/**
 * Show loading toast
 */
export function showLoading(
  message: string,
  options?: Omit<ToastOptions, 'action'>
) {
  return toast.loading(message, {
    duration: options?.duration || Infinity,
    description: options?.description,
  });
}

/**
 * Update toast (useful for loading states)
 */
export function updateToast(
  toastId: string | number,
  type: 'success' | 'error' | 'info',
  message: string,
  options?: ToastOptions
) {
  if (type === 'success') {
    toast.success(message, { id: toastId, ...options });
  } else if (type === 'error') {
    toast.error(message, { id: toastId, ...options });
  } else {
    toast.info(message, { id: toastId, ...options });
  }
}

/**
 * Dismiss toast
 */
export function dismissToast(toastId?: string | number) {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
}

// ============================================================================
// PROMISE TOASTS (for async operations)
// ============================================================================

/**
 * Toast for promise-based operations
 */
export function showPromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return toast.promise(promise, messages);
}

// ============================================================================
// CONFIRMATION TOASTS (with actions)
// ============================================================================

/**
 * Show confirmation toast with action
 */
export function showConfirmation(
  message: string,
  onConfirm: () => void,
  options?: {
    description?: string;
    confirmLabel?: string;
    duration?: number;
  }
) {
  return toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 10000,
    action: {
      label: options?.confirmLabel || 'Onayla',
      onClick: onConfirm,
    },
  });
}

/**
 * Show delete confirmation
 */
export function showDeleteConfirmation(
  entityName: string,
  onConfirm: () => void
) {
  return showConfirmation(`${entityName} silinecek`, onConfirm, {
    description: 'Bu işlem geri alınamaz',
    confirmLabel: 'Sil',
    duration: 8000,
  });
}

// ============================================================================
// BULK OPERATION TOASTS
// ============================================================================

/**
 * Show bulk operation result
 */
export function showBulkOperationResult(
  successCount: number,
  failCount: number,
  entityName: string
) {
  if (failCount === 0) {
    showSuccess(`${successCount} ${entityName} başarıyla işlendi`);
  } else if (successCount === 0) {
    showError(`Tüm işlemler başarısız oldu (${failCount} hata)`);
  } else {
    showWarning('İşlem kısmen tamamlandı', {
      description: `Başarılı: ${successCount}, Başarısız: ${failCount}`,
    });
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const toastUtils = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  apiError: showApiError,
  update: updateToast,
  dismiss: dismissToast,
  promise: showPromiseToast,
  confirmation: showConfirmation,
  deleteConfirmation: showDeleteConfirmation,
  bulkResult: showBulkOperationResult,

  // Pre-configured messages
  successToasts,
  errorToasts,
  warningToasts,
  infoToasts,
};

export default toastUtils;
