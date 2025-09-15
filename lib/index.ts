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
export * from './store';
// export * from './types'; // Removed - use types/index.ts instead
export * from './validations';

// === UTILITIES ===
// Use shared utils as primary, legacy as fallback
// export * from './shared/utils'; // Commented out to avoid conflicts

// Animation utilities
export * from './animations';

// === LEGACY COMPATIBILITY ===
// These are available but may have naming conflicts
// Use explicit imports if conflicts occur

// Legacy utils (may conflict with shared utils)
// export * from './utils';

// Legacy services (may conflict with domain services)
// export * from './services';
// export * from './repositories';
