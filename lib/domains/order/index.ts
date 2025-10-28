/**
 * ================================================
 * ORDER DOMAIN BARREL EXPORTS
 * ================================================
 * Centralized exports for order domain
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 10: Validation & Error Handling
 */

// Optimistic updates
export {
  OptimisticUpdateManager,
  orderUpdateManager,
  createOptimisticStatusUpdate,
} from './optimistic-updates';

export type {
  OptimisticUpdate,
  OptimisticUpdateOptions,
} from './optimistic-updates';

// Error handling
export {
  OrderErrorCode,
  parseOrderError,
  handleOrderError,
  handleOrderErrorWithRetry,
  validateStatusTransition,
  validateFileUpload,
} from './error-handling';

export type { OrderError } from './error-handling';
