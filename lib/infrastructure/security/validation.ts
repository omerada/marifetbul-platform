/**
 * Input Validation Utilities
 *
 * Provides Zod schemas and validation helpers for consistent input validation.
 * Used across forms, API routes, and data processing.
 *
 * Features:
 * - Common validation schemas
 * - Type-safe validation
 * - User-friendly error messages
 * - Sanitization helpers
 * - Custom validators
 *
 * @example
 * ```ts
 * import { emailSchema, validateInput } from '@/lib/infrastructure/security/validation';
 *
 * const result = validateInput(emailSchema, userInput);
 * if (!result.success) {
 *   console.error(result.errors);
 * }
 * ```
 */

import { z } from 'zod';
import { Logger } from '../monitoring/logger';

const logger = new Logger({ level: 'info' });

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Geçersiz e-posta adresi')
  .min(5, 'E-posta en az 5 karakter olmalıdır')
  .max(255, 'E-posta en fazla 255 karakter olmalıdır')
  .toLowerCase()
  .trim();

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .max(128, 'Şifre en fazla 128 karakter olmalıdır')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir')
  .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir');

/**
 * Strong password validation (for sensitive operations)
 */
export const strongPasswordSchema = passwordSchema
  .min(12, 'Şifre en az 12 karakter olmalıdır')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Şifre güçlü bir şifre olmalıdır'
  );

/**
 * Phone number validation (Turkish format)
 */
export const phoneSchema = z
  .string()
  .regex(
    /^(\+90|0)?5\d{9}$/,
    'Geçersiz telefon numarası (örn: 5551234567 veya +905551234567)'
  )
  .transform((val) => {
    // Normalize to +90 format
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('90')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('0')) {
      return `+9${cleaned}`;
    }
    return `+90${cleaned}`;
  });

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url('Geçersiz URL')
  .max(2048, 'URL en fazla 2048 karakter olmalıdır');

/**
 * Slug validation (for URLs)
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug boş olamaz')
  .max(200, 'Slug en fazla 200 karakter olmalıdır')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug sadece küçük harf, rakam ve tire içerebilir'
  )
  .trim();

/**
 * Username validation
 */
export const usernameSchema = z
  .string()
  .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
  .max(30, 'Kullanıcı adı en fazla 30 karakter olmalıdır')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Kullanıcı adı sadece harf, rakam, tire ve alt çizgi içerebilir'
  )
  .trim()
  .toLowerCase();

/**
 * Name validation
 */
export const nameSchema = z
  .string()
  .min(2, 'İsim en az 2 karakter olmalıdır')
  .max(100, 'İsim en fazla 100 karakter olmalıdır')
  .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf içerebilir')
  .trim();

/**
 * Text validation (short)
 */
export const shortTextSchema = z
  .string()
  .min(1, 'Metin boş olamaz')
  .max(255, 'Metin en fazla 255 karakter olmalıdır')
  .trim();

/**
 * Text validation (long)
 */
export const longTextSchema = z
  .string()
  .min(1, 'Metin boş olamaz')
  .max(10000, 'Metin en fazla 10000 karakter olmalıdır')
  .trim();

/**
 * Rich text validation (HTML content)
 */
export const richTextSchema = z
  .string()
  .min(1, 'İçerik boş olamaz')
  .max(50000, 'İçerik en fazla 50000 karakter olmalıdır');

/**
 * Positive integer validation
 */
export const positiveIntSchema = z
  .number()
  .int('Tam sayı olmalıdır')
  .positive('Pozitif sayı olmalıdır');

/**
 * Non-negative integer validation
 */
export const nonNegativeIntSchema = z
  .number()
  .int('Tam sayı olmalıdır')
  .nonnegative('Negatif olamaz');

/**
 * Price validation (in cents/kuruş)
 */
export const priceSchema = z
  .number()
  .int('Fiyat tam sayı olmalıdır (kuruş cinsinden)')
  .nonnegative('Fiyat negatif olamaz')
  .max(999999999, 'Fiyat çok yüksek');

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'Yüzde 0 ile 100 arasında olmalıdır')
  .max(100, 'Yüzde 0 ile 100 arasında olmalıdır');

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Geçersiz UUID').trim();

/**
 * Date string validation (ISO 8601)
 */
export const dateStringSchema = z
  .string()
  .datetime('Geçersiz tarih formatı (ISO 8601 bekleniyor)')
  .or(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih formatı (YYYY-MM-DD)')
  );

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: positiveIntSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(255).trim(),
  filters: z.record(z.string(), z.unknown()).optional(),
  ...paginationSchema.shape,
});

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

/**
 * Validation success result
 */
export interface ValidationSuccess<T> {
  success: true;
  data: T;
  errors: null;
}

/**
 * Validation error result
 */
export interface ValidationError {
  success: false;
  data: null;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Validation result (success or error)
 */
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate input against a Zod schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(input);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: null,
      };
    }

    // Format Zod errors
    const errors = result.error.issues.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    logger.debug('Validation failed', { errors });

    return {
      success: false,
      data: null,
      errors,
    };
  } catch (error) {
    const err = error;
    logger.error('Validation error', err, {});

    return {
      success: false,
      data: null,
      errors: [
        {
          field: '_general',
          message: 'Doğrulama hatası oluştu',
        },
      ],
    };
  }
}

/**
 * Validate input and throw error if invalid
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = validateInput(schema, input);

  if (!result.success) {
    const error = new ValidationException('Doğrulama hatası', result.errors);
    throw error;
  }

  return result.data;
}

/**
 * Validate partial input (allow undefined fields)
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  input: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ValidationResult<any> {
  return validateInput(schema.partial(), input);
}

/**
 * Custom validation exception
 */
export class ValidationException extends Error {
  constructor(
    message: string,
    public readonly errors: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

/**
 * Check if value is a validation error
 */
export function isValidationError(value: unknown): value is ValidationError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === false
  );
}

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Sanitize HTML (strip all HTML tags)
 */
export function sanitizeHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize for SQL LIKE query (escape special characters)
 */
export function sanitizeLikeQuery(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { z };
