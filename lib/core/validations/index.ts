/**
 * Unified Validation System - Main Export Module
 * Provides centralized validation schemas and utilities for the platform
 */

import { z } from 'zod';

// ================================================
// CORE VALIDATION EXPORTS
// ================================================

// Re-export base validation schemas and utilities
export * from './base';

// Re-export file validation schemas
export * from './file';

// Re-export specific domain validations
export * from './auth';
export {
  // Marketplace filters
  jobFiltersSchema as marketplaceJobFiltersSchema,
  packageFiltersSchema as marketplacePackageFiltersSchema,
  validateJobFilters as validateMarketplaceJobFilters,
  validatePackageFilters as validateMarketplacePackageFilters,
  marketplaceFilterSchema,
  searchQuerySchema,
} from './marketplace';
export * from './payment';
export {
  // Details schemas
  proposalSchema,
  // Details filters
  jobFiltersSchema as detailsJobFiltersSchema,
  packageFiltersSchema as detailsPackageFiltersSchema,
  validateJobFilters as validateDetailsJobFilters,
  validatePackageFilters as validateDetailsPackageFilters,
} from './details';
export * from './messages';

// Re-export validation messages and localization
export { default as validationMessages } from './messages';

// Re-export Zod types for convenience
export type { ZodSchema, ZodError, ZodIssue } from 'zod';

// ================================================
// VALIDATION RESULT TYPES
// ================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationErrorDetail[];
  warnings?: ValidationWarning[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: ValidationErrorCode;
  value?: unknown;
  path?: (string | number)[];
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export type ValidationErrorCode =
  | 'required'
  | 'invalid_format'
  | 'min_length'
  | 'max_length'
  | 'invalid_date'
  | 'custom_error';

export interface AsyncValidationOptions {
  timeout?: number;
  retries?: number;
  debounce?: number;
}

// ================================================
// UNIFIED VALIDATION HELPERS
// ================================================

/**
 * Validates data with detailed error reporting
 */
export function validateWithDetails<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const errors: ValidationErrorDetail[] = result.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: mapZodErrorCode(issue.code),
    value: 'received' in issue ? issue.received : undefined,
    path: issue.path as (string | number)[],
  }));

  return {
    success: false,
    errors,
  };
}

/**
 * Formats validation errors for UI display
 */
export function formatValidationErrors(
  errors: ValidationErrorDetail[]
): Record<string, string> {
  return errors.reduce(
    (acc, error) => {
      acc[error.field] = error.message;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Maps Zod error codes to our validation error codes
 */
function mapZodErrorCode(code: string): ValidationErrorCode {
  switch (code) {
    case 'invalid_type':
    case 'invalid_string':
    case 'invalid_enum_value':
      return 'invalid_format';
    case 'too_small':
      return 'min_length';
    case 'too_big':
      return 'max_length';
    case 'invalid_date':
      return 'invalid_date';
    case 'custom':
      return 'custom_error';
    default:
      return 'invalid_format';
  }
}

/**
 * Creates a form validator with common validation patterns
 */
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => validateWithDetails(schema, data),

    validateField: (fieldName: string, value: unknown) => {
      try {
        const zodSchema = schema as z.ZodObject<Record<string, z.ZodTypeAny>>;
        const fieldSchema = zodSchema.shape[fieldName];
        if (!fieldSchema) {
          return { success: true, data: value };
        }
        return validateWithDetails(fieldSchema, value);
      } catch {
        return { success: true, data: value };
      }
    },

    getFieldErrors: (errors: ValidationErrorDetail[], fieldName: string) => {
      return errors
        .filter(
          (error) =>
            error.field === fieldName || error.field.startsWith(`${fieldName}.`)
        )
        .map((error) => error.message);
    },

    hasFieldError: (errors: ValidationErrorDetail[], fieldName: string) => {
      return errors.some(
        (error) =>
          error.field === fieldName || error.field.startsWith(`${fieldName}.`)
      );
    },
  };
}

/**
 * Async validation with timeout and error handling
 */
export async function asyncValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  asyncValidators: Array<(data: T) => Promise<ValidationResult<T>>>,
  options: AsyncValidationOptions = {}
): Promise<ValidationResult<T>> {
  const { timeout = 5000 } = options;

  // First, run synchronous validation
  const syncResult = validateWithDetails(schema, data);
  if (!syncResult.success) {
    return syncResult;
  }

  // Then run async validators
  const validatedData = syncResult.data!;
  const allErrors: ValidationErrorDetail[] = [];
  const allWarnings: ValidationWarning[] = [];

  for (const validator of asyncValidators) {
    try {
      const promise = validator(validatedData);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Validation timeout')), timeout)
      );

      const result = await Promise.race([promise, timeoutPromise]);

      if (!result.success && result.errors) {
        allErrors.push(...result.errors);
      }

      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    } catch (error) {
      allErrors.push({
        field: 'async',
        message: 'Doğrulama işlemi başarısız oldu',
        code: 'custom_error',
        value: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (allErrors.length > 0) {
    return {
      success: false,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    };
  }

  return {
    success: true,
    data: validatedData,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
  };
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

// Sprint 1 Cleanup: formatFileSize removed - use @/lib/shared/formatters

/**
 * Debounces validation function calls
 */
export function debounceValidation<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) {
  let timeoutId: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Creates a validation chain for complex validation scenarios
 */
export function createValidationChain<T>() {
  const validators: Array<(data: T) => ValidationResult<T>> = [];

  const chain = {
    add: (validator: (data: T) => ValidationResult<T>) => {
      validators.push(validator);
      return chain;
    },

    validate: (data: T): ValidationResult<T> => {
      for (const validator of validators) {
        const result = validator(data);
        if (!result.success) {
          return result;
        }
      }
      return { success: true, data };
    },
  };

  return chain;
}

// ================================================
// EXPORTS
// ================================================

const UnifiedValidation = {
  validateWithDetails,
  formatValidationErrors,
  createFormValidator,
  asyncValidate,
  debounceValidation, // Sprint 1: formatFileSize removed
  createValidationChain,
};

export default UnifiedValidation;

// ✅ Sprint 1: Job Posting & Proposal System
export * from './jobs';
export * from './proposals';
