// ================================================
// UNIFIED VALIDATION SYSTEM
// ================================================
// Centralized validation with consistent error handling,
// Turkish messages, and reusable validation patterns

import { z } from 'zod';

// ================================================
// CORE VALIDATION TYPES
// ================================================

export interface ValidationResult<T = unknown> {
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
  value?: unknown;
}

export type ValidationErrorCode =
  | 'required'
  | 'invalid_format'
  | 'min_length'
  | 'max_length'
  | 'min_value'
  | 'max_value'
  | 'invalid_email'
  | 'invalid_phone'
  | 'invalid_url'
  | 'invalid_date'
  | 'invalid_file'
  | 'custom_error';

export interface AsyncValidationOptions {
  timeout?: number;
  retries?: number;
  debounce?: number;
}

// ================================================
// COMMON VALIDATION PATTERNS
// ================================================

const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+90|0)?[0-9]{10}$/,
  URL: /^https?:\/\/.+\.\w{2,}/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  POSTAL_CODE: /^[0-9]{5}$/,
  CREDIT_CARD: /^[0-9]{13,19}$/,
  CVV: /^[0-9]{3,4}$/,
  IBAN: /^TR[0-9]{24}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PASSWORD_STRONG:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// ================================================
// TURKISH ERROR MESSAGES
// ================================================

const ERROR_MESSAGES = {
  // Required fields
  REQUIRED: 'Bu alan zorunludur',
  REQUIRED_FIELD: (field: string) => `${field} gereklidir`,

  // Length validations
  MIN_LENGTH: (min: number) => `En az ${min} karakter olmalıdır`,
  MAX_LENGTH: (max: number) => `En fazla ${max} karakter olabilir`,
  EXACT_LENGTH: (length: number) => `Tam olarak ${length} karakter olmalıdır`,

  // Number validations
  MIN_VALUE: (min: number) => `En az ${min} olmalıdır`,
  MAX_VALUE: (max: number) => `En fazla ${max} olabilir`,
  POSITIVE_NUMBER: 'Pozitif bir sayı olmalıdır',
  NEGATIVE_NUMBER: 'Negatif bir sayı olmalıdır',
  INTEGER: 'Tam sayı olmalıdır',

  // Format validations
  INVALID_EMAIL: 'Geçerli bir e-posta adresi giriniz',
  INVALID_PHONE: 'Geçerli bir telefon numarası giriniz',
  INVALID_URL: 'Geçerli bir URL giriniz',
  INVALID_DATE: 'Geçerli bir tarih giriniz',
  INVALID_UUID: 'Geçersiz UUID formatı',
  INVALID_POSTAL_CODE: 'Geçerli bir posta kodu giriniz',
  INVALID_CREDIT_CARD: 'Geçerli bir kredi kartı numarası giriniz',
  INVALID_CVV: 'Geçerli bir CVV kodu giriniz',
  INVALID_IBAN: 'Geçerli bir IBAN numarası giriniz',

  // Password validations
  PASSWORD_TOO_SHORT: 'Şifre en az 8 karakter olmalıdır',
  PASSWORD_TOO_WEAK:
    'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir',
  PASSWORDS_DONT_MATCH: 'Şifreler eşleşmiyor',

  // File validations
  FILE_TOO_LARGE: (max: string) => `Dosya boyutu en fazla ${max} olabilir`,
  FILE_TOO_SMALL: (min: string) => `Dosya boyutu en az ${min} olmalıdır`,
  INVALID_FILE_TYPE: (types: string[]) =>
    `Sadece ${types.join(', ')} formatları desteklenir`,

  // Array validations
  ARRAY_MIN_ITEMS: (min: number) => `En az ${min} öğe seçmelisiniz`,
  ARRAY_MAX_ITEMS: (max: number) => `En fazla ${max} öğe seçebilirsiniz`,

  // Selection validations
  INVALID_OPTION: 'Geçersiz seçenek',
  MUST_ACCEPT_TERMS: 'Kullanım şartlarını kabul etmelisiniz',

  // Custom business rules
  FUTURE_DATE_REQUIRED: 'Gelecek bir tarih seçmelisiniz',
  PAST_DATE_REQUIRED: 'Geçmiş bir tarih seçmelisiniz',
  AGE_RESTRICTION: (min: number) => `En az ${min} yaşında olmalısınız`,
  BUDGET_RANGE_INVALID: 'Minimum bütçe maksimum bütçeden büyük olamaz',
  DELIVERY_TIME_INVALID: 'Teslimat süresi geçerli değil',
} as const;

// ================================================
// REUSABLE SCHEMA BUILDERS
// ================================================

const createEmailSchema = () =>
  z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .email(ERROR_MESSAGES.INVALID_EMAIL);

const createPhoneSchema = () =>
  z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .regex(VALIDATION_PATTERNS.PHONE, ERROR_MESSAGES.INVALID_PHONE);

const createPasswordSchema = (minLength: number = 8) =>
  z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .min(minLength, ERROR_MESSAGES.MIN_LENGTH(minLength));

const createStrongPasswordSchema = () =>
  z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .min(8, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    .regex(
      VALIDATION_PATTERNS.PASSWORD_STRONG,
      ERROR_MESSAGES.PASSWORD_TOO_WEAK
    );

const createUrlSchema = () => z.string().url(ERROR_MESSAGES.INVALID_URL);

const createUuidSchema = () => z.string().uuid(ERROR_MESSAGES.INVALID_UUID);

const createSlugSchema = () =>
  z
    .string()
    .regex(
      VALIDATION_PATTERNS.SLUG,
      'Sadece küçük harf, rakam ve tire kullanabilirsiniz'
    );

const createTextSchema = (min: number = 1, max: number = 255) =>
  z
    .string()
    .min(
      min,
      min === 1 ? ERROR_MESSAGES.REQUIRED : ERROR_MESSAGES.MIN_LENGTH(min)
    )
    .max(max, ERROR_MESSAGES.MAX_LENGTH(max));

const createNumberSchema = (min?: number, max?: number) => {
  let schema = z.number();

  if (min !== undefined) {
    schema = schema.min(min, ERROR_MESSAGES.MIN_VALUE(min));
  }

  if (max !== undefined) {
    schema = schema.max(max, ERROR_MESSAGES.MAX_VALUE(max));
  }

  return schema;
};

const createDateSchema = (future?: boolean, past?: boolean) => {
  let schema = z.string().datetime(ERROR_MESSAGES.INVALID_DATE);

  if (future) {
    schema = schema.refine(
      (date) => new Date(date) > new Date(),
      ERROR_MESSAGES.FUTURE_DATE_REQUIRED
    );
  }

  if (past) {
    schema = schema.refine(
      (date) => new Date(date) < new Date(),
      ERROR_MESSAGES.PAST_DATE_REQUIRED
    );
  }

  return schema;
};

const createFileSchema = (options: {
  maxSize?: number;
  minSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  const { maxSize, minSize, allowedTypes, required = true } = options;

  let schema = z.instanceof(File, {
    message: required ? ERROR_MESSAGES.REQUIRED : undefined,
  });

  if (!required) {
    return schema.optional();
  }

  if (maxSize) {
    schema = schema.refine(
      (file) => file.size <= maxSize,
      ERROR_MESSAGES.FILE_TOO_LARGE(formatFileSize(maxSize))
    );
  }

  if (minSize) {
    schema = schema.refine(
      (file) => file.size >= minSize,
      ERROR_MESSAGES.FILE_TOO_SMALL(formatFileSize(minSize))
    );
  }

  if (allowedTypes) {
    schema = schema.refine(
      (file) => allowedTypes.includes(file.type),
      ERROR_MESSAGES.INVALID_FILE_TYPE(allowedTypes)
    );
  }

  return schema;
};

const createArraySchema = <T>(
  itemSchema: z.ZodType<T>,
  min?: number,
  max?: number
) => {
  let schema = z.array(itemSchema);

  if (min !== undefined) {
    schema = schema.min(min, ERROR_MESSAGES.ARRAY_MIN_ITEMS(min));
  }

  if (max !== undefined) {
    schema = schema.max(max, ERROR_MESSAGES.ARRAY_MAX_ITEMS(max));
  }

  return schema;
};

const createEnumSchema = <T extends readonly [string, ...string[]]>(
  values: T
) => z.enum(values, { message: ERROR_MESSAGES.INVALID_OPTION });

const createBooleanSchema = (requiredTrue?: boolean) =>
  requiredTrue
    ? z
        .boolean()
        .refine((val) => val === true, ERROR_MESSAGES.MUST_ACCEPT_TERMS)
    : z.boolean();

// ================================================
// COMMON FIELD SCHEMAS
// ================================================

const CommonSchemas = {
  // Personal Information
  firstName: createTextSchema(2, 50),
  lastName: createTextSchema(2, 50),
  email: createEmailSchema(),
  phone: createPhoneSchema(),

  // User Credentials
  password: createPasswordSchema(),
  strongPassword: createStrongPasswordSchema(),

  // Identifiers
  uuid: createUuidSchema(),
  slug: createSlugSchema(),

  // Content
  title: createTextSchema(5, 100),
  shortDescription: createTextSchema(10, 200),
  description: createTextSchema(50, 1000),
  longDescription: createTextSchema(100, 5000),

  // Numbers
  rating: createNumberSchema(1, 5),
  price: createNumberSchema(0),
  percentage: createNumberSchema(0, 100),

  // Location
  coordinates: z.object({
    lat: createNumberSchema(-90, 90),
    lng: createNumberSchema(-180, 180),
  }),

  // File uploads
  image: createFileSchema({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  }),
  document: createFileSchema({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  }),

  // Common selections
  userType: createEnumSchema(['freelancer', 'employer']),
  priority: createEnumSchema(['low', 'medium', 'high', 'urgent']),
  status: createEnumSchema(['active', 'inactive', 'pending', 'completed']),

  // Agreements
  termsAccepted: createBooleanSchema(true),
  privacyAccepted: createBooleanSchema(true),
  marketingAccepted: createBooleanSchema(false),
} as const;

// ================================================
// VALIDATION UTILITIES
// ================================================

function validateWithDetails<T>(
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

function formatValidationErrors(
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

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// ================================================
// ASYNC VALIDATION HELPERS
// ================================================

export interface AsyncValidationOptions {
  timeout?: number;
  retries?: number;
  debounce?: number;
}

async function asyncValidate<T>(
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
// FORM VALIDATION HELPERS
// ================================================

function createFormValidator<T>(schema: z.ZodSchema<T>) {
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

// ================================================
// EXPORTS
// ================================================

// Export core validation utilities
export {
  validateWithDetails,
  formatValidationErrors,
  createFormValidator,
  asyncValidate,
  mapZodErrorCode,
  formatFileSize,
};

// Export schema builders
export {
  createEmailSchema,
  createPhoneSchema,
  createPasswordSchema,
  createStrongPasswordSchema,
  createUrlSchema,
  createUuidSchema,
  createSlugSchema,
  createTextSchema,
  createNumberSchema,
  createDateSchema,
  createFileSchema,
  createArraySchema,
  createEnumSchema,
  createBooleanSchema,
};

// Export constants
export { ERROR_MESSAGES, VALIDATION_PATTERNS, CommonSchemas };

const UnifiedValidation = {
  validateWithDetails,
  formatValidationErrors,
  createFormValidator,
  asyncValidate,
  CommonSchemas,
  ERROR_MESSAGES,
  VALIDATION_PATTERNS,
};

export default UnifiedValidation;
