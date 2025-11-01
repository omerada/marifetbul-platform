/**
 * ================================================
 * ORDER ERROR HANDLING
 * ================================================
 * Centralized error handling for order operations
 * Provides user-friendly error messages and recovery
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 10: Validation & Error Handling
 */

import { toast } from 'sonner';
import type { OrderStatus } from '@/types/backend-aligned';

// ================================================
// ERROR TYPES
// ================================================

export enum OrderErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',

  // Permission errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation errors
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',

  // Business logic errors
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  INSUFFICIENT_REVISIONS = 'INSUFFICIENT_REVISIONS',
  DEADLINE_PASSED = 'DEADLINE_PASSED',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  ALREADY_CANCELED = 'ALREADY_CANCELED',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface OrderError {
  code: OrderErrorCode;
  message: string;
  details?: unknown;
  isRecoverable: boolean;
  retryAfter?: number; // milliseconds
}

// ================================================
// ERROR PARSERS
// ================================================

/**
 * Parse API error response
 */
export function parseOrderError(error: unknown): OrderError {
  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      code: OrderErrorCode.NETWORK_ERROR,
      message: 'İnternet bağlantınızı kontrol edin',
      isRecoverable: true,
      retryAfter: 5000,
    };
  }

  // HTTP errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;

    switch (status) {
      case 400:
        return parseValidationError(error);
      case 401:
        return {
          code: OrderErrorCode.UNAUTHORIZED,
          message: 'Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın',
          isRecoverable: false,
        };
      case 403:
        return {
          code: OrderErrorCode.FORBIDDEN,
          message: 'Bu işlem için yetkiniz yok',
          isRecoverable: false,
        };
      case 404:
        return {
          code: OrderErrorCode.ORDER_NOT_FOUND,
          message: 'Sipariş bulunamadı',
          isRecoverable: false,
        };
      case 408:
        return {
          code: OrderErrorCode.TIMEOUT_ERROR,
          message: 'İşlem zaman aşımına uğradı',
          isRecoverable: true,
          retryAfter: 3000,
        };
      case 500:
      case 502:
      case 503:
        return {
          code: OrderErrorCode.SERVER_ERROR,
          message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin',
          isRecoverable: true,
          retryAfter: 10000,
        };
      default:
        break;
    }
  }

  // API error with message
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const apiMessage = (error as { message: string }).message;
    return parseApiErrorMessage(apiMessage);
  }

  // Unknown error
  return {
    code: OrderErrorCode.UNKNOWN_ERROR,
    message: 'Beklenmeyen bir hata oluştu',
    details: error,
    isRecoverable: true,
    retryAfter: 5000,
  };
}

/**
 * Parse validation error (400)
 */
function parseValidationError(error: unknown): OrderError {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message;
    return parseApiErrorMessage(message);
  }

  return {
    code: OrderErrorCode.MISSING_REQUIRED_FIELD,
    message: 'Geçersiz veri',
    isRecoverable: false,
  };
}

/**
 * Parse API error message and map to error code
 */
function parseApiErrorMessage(message: string): OrderError {
  const lowerMessage = message.toLowerCase();

  // Status transition errors
  if (
    lowerMessage.includes('invalid status') ||
    lowerMessage.includes('status transition')
  ) {
    return {
      code: OrderErrorCode.INVALID_STATUS_TRANSITION,
      message: 'Geçersiz sipariş durumu değişikliği',
      isRecoverable: false,
    };
  }

  // Revision errors
  if (
    lowerMessage.includes('revision') &&
    (lowerMessage.includes('limit') || lowerMessage.includes('exceeded'))
  ) {
    return {
      code: OrderErrorCode.INSUFFICIENT_REVISIONS,
      message: 'Revizyon hakkınız kalmadı',
      isRecoverable: false,
    };
  }

  // Deadline errors
  if (lowerMessage.includes('deadline') && lowerMessage.includes('passed')) {
    return {
      code: OrderErrorCode.DEADLINE_PASSED,
      message: 'Sipariş süresi dolmuş',
      isRecoverable: false,
    };
  }

  // Payment errors
  if (lowerMessage.includes('payment')) {
    return {
      code: OrderErrorCode.PAYMENT_REQUIRED,
      message: 'Ödeme gerekli',
      isRecoverable: false,
    };
  }

  // Already completed/canceled
  if (lowerMessage.includes('already completed')) {
    return {
      code: OrderErrorCode.ALREADY_COMPLETED,
      message: 'Sipariş zaten tamamlanmış',
      isRecoverable: false,
    };
  }

  if (lowerMessage.includes('already canceled')) {
    return {
      code: OrderErrorCode.ALREADY_CANCELED,
      message: 'Sipariş zaten iptal edilmiş',
      isRecoverable: false,
    };
  }

  // File errors
  if (lowerMessage.includes('file type')) {
    return {
      code: OrderErrorCode.INVALID_FILE_TYPE,
      message: 'Geçersiz dosya türü',
      isRecoverable: false,
    };
  }

  if (
    lowerMessage.includes('file size') ||
    lowerMessage.includes('too large')
  ) {
    return {
      code: OrderErrorCode.FILE_TOO_LARGE,
      message: 'Dosya boyutu çok büyük (max 50MB)',
      isRecoverable: false,
    };
  }

  // Default validation error
  return {
    code: OrderErrorCode.MISSING_REQUIRED_FIELD,
    message,
    isRecoverable: false,
  };
}

// ================================================
// ERROR HANDLERS
// ================================================

/**
 * Handle order error with toast notification
 */
export function handleOrderError(error: unknown, context?: string): OrderError {
  const orderError = parseOrderError(error);

  // Show toast notification
  const contextPrefix = context ? `${context}: ` : '';
  toast.error('Hata', {
    description: `${contextPrefix}${orderError.message}`,
  });

  // Log error for debugging
  console.error('Order error:', {
    code: orderError.code,
    message: orderError.message,
    context,
    details: orderError.details,
  });

  return orderError;
}

/**
 * Handle order error with retry capability
 */
export async function handleOrderErrorWithRetry(
  error: unknown,
  retryFn: () => Promise<void>,
  maxRetries = 3,
  context?: string
): Promise<boolean> {
  const orderError = parseOrderError(error);

  // If not recoverable, show error and return false
  if (!orderError.isRecoverable) {
    handleOrderError(error, context);
    return false;
  }

  // Show retry notification
  const contextPrefix = context ? `${context}: ` : '';
  const retryAfter = orderError.retryAfter || 5000;

  const result = await new Promise<boolean>((resolve) => {
    toast.error('Hata', {
      description: `${contextPrefix}${orderError.message}`,
      action: {
        label: 'Tekrar Dene',
        onClick: async () => {
          try {
            await retryFn();
            toast.success('Başarılı', {
              description: 'İşlem tamamlandı',
            });
            resolve(true);
          } catch (retryError) {
            // Recursive retry with max limit
            if (maxRetries > 1) {
              const success = await handleOrderErrorWithRetry(
                retryError,
                retryFn,
                maxRetries - 1,
                context
              );
              resolve(success);
            } else {
              handleOrderError(retryError, context);
              resolve(false);
            }
          }
        },
      },
      duration: retryAfter,
    });

    // Auto-retry after timeout
    setTimeout(() => {
      resolve(false);
    }, retryAfter);
  });

  return result;
}

// ================================================
// VALIDATION HELPERS
// ================================================

/**
 * Validate status transition
 */
export function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  userRole: 'buyer' | 'seller'
): { valid: boolean; message?: string } {
  // Define valid transitions
  const validTransitions: Record<
    OrderStatus,
    Partial<Record<'buyer' | 'seller', OrderStatus[]>>
  > = {
    PENDING_PAYMENT: {
      buyer: ['PAID', 'CANCELED'],
    },
    PAID: {
      seller: ['IN_PROGRESS', 'CANCELED'],
    },
    IN_PROGRESS: {
      seller: ['DELIVERED', 'CANCELED'],
      buyer: ['CANCELED'],
    },
    DELIVERED: {
      buyer: ['IN_PROGRESS', 'COMPLETED', 'CANCELED'], // IN_PROGRESS = revision request
    },
    IN_REVIEW: {
      seller: ['DELIVERED'],
      buyer: ['IN_PROGRESS', 'COMPLETED', 'CANCELED'],
    },
    COMPLETED: {},
    CANCELED: {},
    REFUNDED: {},
    DISPUTED: {},
  };

  const allowedTransitions = validTransitions[currentStatus]?.[userRole] || [];

  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      message: `Bu durumdan ${newStatus} durumuna geçiş yapılamaz`,
    };
  }

  return { valid: true };
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): {
  valid: boolean;
  message?: string;
} {
  // Max file size: 50MB
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  // Allowed file types
  const ALLOWED_TYPES = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Code
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'application/xml',
  ];

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `Dosya boyutu çok büyük (max 50MB)`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: `Geçersiz dosya türü: ${file.type}`,
    };
  }

  return { valid: true };
}
