/**
 * Lib Main Export - Clean Architecture
 * Centralized exports following clean architecture principles
 */

// === PRIMARY EXPORTS ===
// Main domain exports take precedence
export * from './domains/auth';
export * from './domains/notification';
export * from './domains/payment';
export * from './domains/media';

// === INFRASTRUCTURE ===
export * from './infrastructure/websocket';
export * from './infrastructure/geocoding';

// === CORE SYSTEM ===
// Store exports (avoiding conflicts with domain stores)
export {} from // Add specific non-conflicting store exports here if needed
'./core/store';

export * from './core/validations';

// === UTILITIES ===
// Use shared utils but avoid conflicts
export {
  // Core utilities that don't conflict
  debounce,
  throttle,
  sleep,
  isString,
  isNumber,
  isArray,
  isObject,
} from './shared/utils';

// Core utility from utils.ts
export { cn } from './utils';

// Animation utilities
export * from './shared/ui/animations';
