import { z } from 'zod';

// ================================================
// BASE VALIDATION SCHEMAS - COMPOSITION SYSTEM
// ================================================
// Reusable validation building blocks for consistent validation across the app

// ================================================
// PRIMITIVE VALIDATORS
// ================================================

export const baseSchemas = {
  // Identifiers
  id: z.string().min(1, 'ID gereklidir'),
  uuid: z.string().uuid('Geçerli UUID formatı gereklidir'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Geçerli slug formatı gereklidir'),

  // Text fields
  name: z.string().min(2, 'En az 2 karakter').max(50, 'En fazla 50 karakter'),
  title: z
    .string()
    .min(3, 'En az 3 karakter')
    .max(100, 'En fazla 100 karakter'),
  description: z
    .string()
    .min(10, 'En az 10 karakter')
    .max(1000, 'En fazla 1000 karakter'),
  shortDescription: z
    .string()
    .min(10, 'En az 10 karakter')
    .max(200, 'En fazla 200 karakter'),

  // Contact information
  email: z.string().email('Geçerli e-posta adresi giriniz'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Geçerli telefon numarası'),
  phoneOptional: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, 'Geçerli telefon numarası')
    .optional(),

  // URLs and links
  url: z.string().url('Geçerli URL giriniz'),
  urlOptional: z
    .string()
    .url('Geçerli URL giriniz')
    .optional()
    .or(z.literal('')),

  // Geographic
  city: z.string().min(2, 'En az 2 karakter').max(50, 'En fazla 50 karakter'),
  country: z
    .string()
    .min(2, 'En az 2 karakter')
    .max(50, 'En fazla 50 karakter'),
  address: z
    .string()
    .min(5, 'En az 5 karakter')
    .max(200, 'En fazla 200 karakter'),

  // Financial - Only TRY supported
  currency: z.enum(['TRY'], { message: 'Para birimi TRY olmalıdır' }),
  price: z.number().min(0, 'Fiyat 0 veya daha büyük olmalıdır'),
  priceString: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Geçerli fiyat formatı'),

  // Date and time
  date: z.string().datetime('Geçerli tarih formatı'),
  dateOptional: z.string().datetime('Geçerli tarih formatı').optional(),
  dateOnly: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD formatında tarih'),

  // Security
  password: z
    .string()
    .min(8, 'En az 8 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'En az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir'
    ),
  confirmPassword: z.string(),

  // Media
  imageUrl: z.string().url("Geçerli resim URL'si"),
  imageUrlOptional: z
    .string()
    .url("Geçerli resim URL'si")
    .optional()
    .or(z.literal('')),

  // Categories and tags
  category: z.string().min(1, 'Kategori seçiniz'),
  tags: z
    .array(z.string().min(1, 'Etiket boş olamaz'))
    .max(10, 'En fazla 10 etiket'),

  // Status and enums
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),

  // Boolean
  required: z.boolean(),
  optional: z.boolean().optional(),

  // Arrays
  stringArray: z.array(z.string()),
  numberArray: z.array(z.number()),

  // Numbers
  positiveInt: z.number().int().positive('Pozitif sayı olmalıdır'),
  nonNegativeInt: z.number().int().min(0, '0 veya daha büyük olmalıdır'),
  rating: z.number().min(1, 'En az 1').max(5, 'En fazla 5'),
  percentage: z.number().min(0, 'En az 0').max(100, 'En fazla 100'),
} as const;

// ================================================
// COMPOSITE SCHEMAS
// ================================================

// First, define schemas without self-references
const basicCompositeSchemas = {
  // User information
  user: z.object({
    id: baseSchemas.id,
    email: baseSchemas.email,
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
  }),

  // Address information
  address: z.object({
    street: baseSchemas.address,
    city: baseSchemas.city,
    country: baseSchemas.country,
    postalCode: z.string().optional(),
  }),

  // Contact information
  contact: z.object({
    email: baseSchemas.email,
    phone: baseSchemas.phoneOptional,
    website: baseSchemas.urlOptional,
  }),

  // Geographic coordinates
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),

  // Price range
  priceRange: z
    .object({
      min: baseSchemas.price,
      max: baseSchemas.price,
      currency: baseSchemas.currency,
    })
    .refine((data) => data.min <= data.max, {
      message: 'Minimum fiyat maksimum fiyattan küçük olmalıdır',
      path: ['min'],
    }),

  // Date range
  dateRange: z
    .object({
      from: baseSchemas.date,
      to: baseSchemas.date,
    })
    .refine((data) => new Date(data.from) <= new Date(data.to), {
      message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
      path: ['from'],
    }),

  // File upload
  fileUpload: z.object({
    name: z.string().min(1, 'Dosya adı gereklidir'),
    size: z
      .number()
      .max(10 * 1024 * 1024, "Dosya boyutu 10MB'dan küçük olmalıdır"),
    type: z
      .string()
      .regex(/^(image|video|audio|application)\//, 'Geçerli dosya türü'),
  }),

  // Pagination
  pagination: z.object({
    page: z
      .number()
      .int()
      .min(1, 'Sayfa 1 veya daha büyük olmalıdır')
      .default(1),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100, 'Limit 1-100 arasında olmalıdır')
      .default(20),
  }),
} as const;

// Then add schemas that reference the basic ones
export const compositeSchemas = {
  ...basicCompositeSchemas,

  // Search filters
  searchFilters: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    priceRange: basicCompositeSchemas.priceRange.optional(),
    dateRange: basicCompositeSchemas.dateRange.optional(),
  }),
} as const;

// ================================================
// UTILITY FUNCTIONS
// ================================================

// Password confirmation validator
export const createPasswordConfirmationSchema = (
  passwordField = 'password'
) => {
  return z
    .object({
      [passwordField]: baseSchemas.password,
      confirmPassword: baseSchemas.confirmPassword,
    })
    .refine(
      (data) =>
        data[passwordField as keyof typeof data] === data.confirmPassword,
      {
        message: 'Şifreler eşleşmiyor',
        path: ['confirmPassword'],
      }
    );
};

// Conditional required field
export const conditionalRequired = <T>(
  schema: z.ZodType<T>,
  condition: (data: unknown) => boolean,
  message = 'Bu alan gereklidir'
) => {
  return z.unknown().superRefine((data, ctx) => {
    if (condition(data)) {
      const result = schema.safeParse(data);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
        });
      }
    }
  });
};

// Array with minimum length
export const minLengthArray = <T>(
  itemSchema: z.ZodType<T>,
  minLength: number,
  message?: string
) => {
  return z
    .array(itemSchema)
    .min(minLength, message || `En az ${minLength} öğe gereklidir`);
};

// Unique array validator
export const uniqueArray = <T>(
  itemSchema: z.ZodType<T>,
  keyExtractor?: (item: T) => string | number
) => {
  return z.array(itemSchema).refine(
    (items) => {
      if (keyExtractor) {
        const keys = items.map(keyExtractor);
        return keys.length === new Set(keys).size;
      }
      return items.length === new Set(items).size;
    },
    {
      message: 'Öğeler tekrarlanamaz',
    }
  );
};

// ================================================
// FORM VALIDATION HELPERS
// ================================================

// Create form schema with common fields
export const createFormSchema = <T extends Record<string, z.ZodTypeAny>>(
  fields: T,
  options?: {
    requireAll?: boolean;
    stripUnknown?: boolean;
  }
) => {
  const schema = z.object(fields);

  if (options?.stripUnknown) {
    return schema.strip();
  }

  return schema;
};

// Create email schema
export const createEmailSchema = (required = true) => {
  return required ? baseSchemas.email : baseSchemas.email.optional();
};

// Create text schema
export const createTextSchema = (
  minLength = 1,
  maxLength = 255,
  required = true
) => {
  const schema = z.string().min(minLength).max(maxLength);
  return required ? schema : schema.optional();
};

// Create phone schema
export const createPhoneSchema = (required = true) => {
  return required ? baseSchemas.phone : baseSchemas.phoneOptional;
};

// Create enum schema
export const createEnumSchema = <T extends readonly [string, ...string[]]>(
  values: T,
  required = true
) => {
  const schema = z.enum(values);
  return required ? schema : schema.optional();
};

// Create boolean schema
export const createBooleanSchema = (required = true) => {
  const schema = z.boolean();
  return required ? schema : schema.optional();
};

// Common schemas for forms
export const CommonSchemas = {
  email: baseSchemas.email,
  password: baseSchemas.password,
  strongPassword: baseSchemas.password,
  name: baseSchemas.name,
  title: baseSchemas.title,
  description: baseSchemas.description,
  phone: baseSchemas.phone,
  url: baseSchemas.url,
  price: baseSchemas.price,
  rating: baseSchemas.rating,
  required: baseSchemas.required,
  optional: baseSchemas.optional,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'Bu alan zorunludur',
  INVALID_EMAIL: 'Geçerli bir e-posta adresi giriniz',
  INVALID_PHONE: 'Geçerli bir telefon numarası giriniz',
  INVALID_URL: 'Geçerli bir URL giriniz',
  MIN_LENGTH: 'En az {min} karakter olmalıdır',
  MAX_LENGTH: 'En fazla {max} karakter olmalıdır',
  INVALID_FORMAT: 'Geçersiz format',
  PASSWORDS_NOT_MATCH: 'Şifreler eşleşmiyor',
  INVALID_PRICE: 'Geçerli bir fiyat giriniz',
  INVALID_RATING: 'Geçerli bir değerlendirme giriniz (1-5)',
} as const;

// Validate and transform form data
export const validateFormData = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<
  { success: true; data: T } | { success: false; errors: z.ZodError }
> => {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

// Format validation errors for UI
export const formatValidationErrors = (errors: z.ZodError) => {
  return errors.issues.reduce(
    (acc: Record<string, string>, error) => {
      const path = error.path.join('.');
      acc[path] = error.message;
      return acc;
    },
    {} as Record<string, string>
  );
};

// ================================================
// EXPORTS
// ================================================

const validationSchemas = {
  base: baseSchemas,
  composite: compositeSchemas,
  utils: {
    createPasswordConfirmationSchema,
    conditionalRequired,
    minLengthArray,
    uniqueArray,
    createFormSchema,
    validateFormData,
    formatValidationErrors,
  },
};

export default validationSchemas;

export type BaseSchemas = typeof baseSchemas;
export type CompositeSchemas = typeof compositeSchemas;
