// ================================================
// SHARED UTILS TYPES INDEX
// ================================================
// Utility types used across the application

export * from './api';
export * from './forms';
// Validation types (avoiding conflicts)
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  Validator,
  ValidationContext,
} from './validation';
