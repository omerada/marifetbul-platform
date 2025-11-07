/**
 * @deprecated This file is deprecated. Use '@/lib/api/error-handler' instead.
 *
 * Migration Guide:
 * - Replace: import { apiErrorHandler } from '@/lib/infrastructure/api/errorHandler'
 * - With:    import { errorHandler } from '@/lib/api/error-handler'
 *
 * This file provides backward compatibility by re-exporting from the new location.
 */

// Re-export everything
export * from '@/lib/api/error-handler';

// Legacy named exports for backward compatibility
import {
  errorHandler,
  getUserErrorMessage,
  requiresReauth,
} from '@/lib/api/error-handler';

/**
 * @deprecated Use errorHandler from '@/lib/api/error-handler'
 */
export const apiErrorHandler = errorHandler;

/**
 * @deprecated Use getUserErrorMessage from '@/lib/api/error-handler'
 */
export function handleApiError(error: unknown): string {
  return getUserErrorMessage(error);
}

/**
 * @deprecated Use requiresReauth from '@/lib/api/error-handler'
 */
export function isAuthError(error: unknown): boolean {
  return requiresReauth(error);
}

/**
 * @deprecated Use errorHandler from '@/lib/api/error-handler'
 */
export default errorHandler;
