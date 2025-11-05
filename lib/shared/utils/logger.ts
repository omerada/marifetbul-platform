/**
 * @deprecated This logger is deprecated. Use @/lib/infrastructure/monitoring/logger instead.
 *
 * MIGRATION GUIDE:
 * Before: import { logger } from '@/lib/shared/utils/logger';
 * After:  import logger from '@/lib/infrastructure/monitoring/logger';
 *
 * The new logger provides:
 * - Sentry integration
 * - Structured logging
 * - Context tracking
 * - Performance monitoring
 * - Child loggers
 *
 * This file now acts as a compatibility layer and will be removed in the future.
 */

// Re-export from infrastructure logger (single source of truth)
export { default as logger } from '@/lib/infrastructure/monitoring/logger';
export {
  apiLogger,
  authLogger,
  cacheLogger,
  wsLogger,
  paymentLogger,
  analyticsLogger,
} from '@/lib/infrastructure/monitoring/logger';

// For backward compatibility, re-export the default logger methods
import infrastructureLogger from '@/lib/infrastructure/monitoring/logger';

export const debug = infrastructureLogger.debug.bind(infrastructureLogger);
export const info = infrastructureLogger.info.bind(infrastructureLogger);
export const warn = infrastructureLogger.warn.bind(infrastructureLogger);
export const error = infrastructureLogger.error.bind(infrastructureLogger);

// Note: group() and table() are not available in the new logger
// Use structured logging with context instead:
// Before: logger.group('Label', () => { console.log(data); });
// After:  logger.debug('Label', { data });

export default infrastructureLogger;
