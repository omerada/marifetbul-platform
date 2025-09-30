// Production-ready security and validation utilities
import { z } from 'zod';

// ====================================
// INPUT VALIDATION SCHEMAS
// ====================================

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  turkishText: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-.,!?]+$/,
} as const;

// Base schemas
export const CommonSchemas = {
  id: z.string().uuid('Geçersiz ID formatı'),
  email: z.string().email('Geçersiz e-posta adresi').toLowerCase(),
  phone: z
    .string()
    .regex(ValidationPatterns.phone, 'Geçersiz telefon numarası'),
  url: z.string().url('Geçersiz URL'),
  slug: z.string().regex(ValidationPatterns.slug, 'Geçersiz slug formatı'),
  username: z
    .string()
    .regex(
      ValidationPatterns.username,
      'Kullanıcı adı 3-20 karakter olmalı ve sadece harf, rakam, _ içerebilir'
    ),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  strongPassword: z
    .string()
    .regex(
      ValidationPatterns.strongPassword,
      'Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir'
    ),
  turkishText: z
    .string()
    .regex(ValidationPatterns.turkishText, 'Geçersiz karakter'),
  positiveNumber: z.number().positive('Pozitif sayı olmalı'),
  nonNegativeNumber: z.number().min(0, 'Negatif olamaz'),
  dateString: z.string().datetime('Geçersiz tarih formatı'),
} as const;

// User validation schemas
export const UserSchemas = {
  register: z.object({
    email: CommonSchemas.email,
    password: CommonSchemas.strongPassword,
    firstName: z
      .string()
      .min(2, 'Ad en az 2 karakter olmalı')
      .max(50, 'Ad en fazla 50 karakter olabilir'),
    lastName: z
      .string()
      .min(2, 'Soyad en az 2 karakter olmalı')
      .max(50, 'Soyad en fazla 50 karakter olabilir'),
    username: CommonSchemas.username,
    terms: z
      .boolean()
      .refine((val) => val === true, 'Kullanım şartlarını kabul etmelisiniz'),
  }),

  login: z.object({
    email: CommonSchemas.email,
    password: z.string().min(1, 'Şifre gerekli'),
    rememberMe: z.boolean().optional(),
  }),

  profile: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    bio: z
      .string()
      .max(500, 'Biyografi en fazla 500 karakter olabilir')
      .optional(),
    website: CommonSchemas.url.optional().or(z.literal('')),
    location: z.string().max(100).optional(),
    skills: z
      .array(z.string().max(50))
      .max(20, 'En fazla 20 yetenek ekleyebilirsiniz'),
  }),
} as const;

// Job/Project validation schemas
export const JobSchemas = {
  create: z.object({
    title: z
      .string()
      .min(10, 'Başlık en az 10 karakter olmalı')
      .max(100, 'Başlık en fazla 100 karakter olabilir'),
    description: z
      .string()
      .min(50, 'Açıklama en az 50 karakter olmalı')
      .max(5000, 'Açıklama en fazla 5000 karakter olabilir'),
    budget: z
      .object({
        min: CommonSchemas.positiveNumber,
        max: CommonSchemas.positiveNumber,
        currency: z.enum(['TRY', 'USD', 'EUR']),
      })
      .refine(
        (data) => data.max >= data.min,
        'Maksimum bütçe minimumdan küçük olamaz'
      ),
    category: z.string().min(1, 'Kategori seçimi gerekli'),
    skills: z
      .array(z.string())
      .min(1, 'En az bir yetenek seçmelisiniz')
      .max(10, 'En fazla 10 yetenek seçebilirsiniz'),
    deadline: CommonSchemas.dateString,
    type: z.enum(['fixed', 'hourly']),
  }),

  update: z.object({
    title: z.string().min(10).max(100).optional(),
    description: z.string().min(50).max(5000).optional(),
    budget: z
      .object({
        min: CommonSchemas.positiveNumber,
        max: CommonSchemas.positiveNumber,
        currency: z.enum(['TRY', 'USD', 'EUR']),
      })
      .optional(),
    skills: z.array(z.string()).max(10).optional(),
    deadline: CommonSchemas.dateString.optional(),
  }),
} as const;

// Message validation schemas
export const MessageSchemas = {
  send: z.object({
    recipientId: CommonSchemas.id,
    subject: z
      .string()
      .min(1, 'Konu gerekli')
      .max(200, 'Konu en fazla 200 karakter olabilir'),
    content: z
      .string()
      .min(1, 'Mesaj içeriği gerekli')
      .max(5000, 'Mesaj en fazla 5000 karakter olabilir'),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          size: z
            .number()
            .max(10 * 1024 * 1024, "Dosya boyutu 10MB'dan küçük olmalı"),
          type: z.string(),
        })
      )
      .max(5, 'En fazla 5 dosya ekleyebilirsiniz')
      .optional(),
  }),
} as const;

// File upload validation
export const FileSchemas = {
  image: z.object({
    name: z.string(),
    size: z.number().max(5 * 1024 * 1024, "Resim boyutu 5MB'dan küçük olmalı"),
    type: z
      .string()
      .refine(
        (type) =>
          ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type),
        'Desteklenen format: JPEG, PNG, WebP, GIF'
      ),
  }),

  document: z.object({
    name: z.string(),
    size: z
      .number()
      .max(10 * 1024 * 1024, "Dosya boyutu 10MB'dan küçük olmalı"),
    type: z
      .string()
      .refine(
        (type) =>
          [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ].includes(type),
        'Desteklenen format: PDF, DOC, DOCX'
      ),
  }),
} as const;

// ====================================
// SECURITY UTILITIES
// ====================================

// Input sanitization
export class InputSanitizer {
  // Remove potentially dangerous HTML tags and attributes
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Escape special characters for SQL injection prevention
  static escapeSql(input: string): string {
    return input.replace(/'/g, "''").replace(/;/g, '');
  }

  // Remove XSS attempts
  static removeXss(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Sanitize filename for file uploads
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // Remove potentially dangerous characters from slug
  static sanitizeSlug(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

// Rate limiting
export class RateLimiter {
  private static instances = new Map<string, RateLimiter>();
  private requests = new Map<string, number[]>();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  static getInstance(
    key: string,
    maxRequests: number,
    windowMs: number
  ): RateLimiter {
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter(maxRequests, windowMs));
    }
    return this.instances.get(key)!;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getTimeUntilReset(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;

    const oldestRequest = Math.min(...userRequests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

// CSRF Protection
export class CSRFProtection {
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  static verifyToken(receivedToken: string, expectedToken: string): boolean {
    if (!receivedToken || !expectedToken) return false;
    return receivedToken === expectedToken;
  }

  static getTokenFromRequest(request: Request): string | null {
    return request.headers.get(this.TOKEN_HEADER);
  }
}

// Content Security Policy generator
export class CSPGenerator {
  static generate(
    options: {
      allowInlineStyles?: boolean;
      allowInlineScripts?: boolean;
      allowedDomains?: string[];
      allowedImageDomains?: string[];
    } = {}
  ): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self'" +
        (options.allowInlineScripts ? " 'unsafe-inline'" : ''),
      "style-src 'self'" +
        (options.allowInlineStyles ? " 'unsafe-inline'" : ''),
      "img-src 'self' data: blob:" +
        (options.allowedImageDomains?.map((d) => ` ${d}`).join('') || ''),
      "font-src 'self'",
      "connect-src 'self'" +
        (options.allowedDomains?.map((d) => ` ${d}`).join('') || ''),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    return directives.join('; ');
  }
}

// ====================================
// VALIDATION HOOKS AND UTILITIES
// ====================================

import { useState, useCallback } from 'react';

export type ValidationResult<T> = {
  data: T | null;
  errors: Record<string, string>;
  isValid: boolean;
};

export function useValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: unknown): ValidationResult<T> => {
      try {
        const validatedData = schema.parse(data);
        setErrors({});
        return {
          data: validatedData,
          errors: {},
          isValid: true,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formattedErrors: Record<string, string> = {};
          error.issues.forEach((err) => {
            const path = err.path.join('.');
            formattedErrors[path] = err.message;
          });
          setErrors(formattedErrors);
          return {
            data: null,
            errors: formattedErrors,
            isValid: false,
          };
        }
        throw error;
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  return {
    validate,
    errors,
    clearErrors,
    getFieldError,
    hasErrors: Object.keys(errors).length > 0,
  };
}

// Server-side validation utility
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        formattedErrors[path] = err.message;
      });
      return { success: false, errors: formattedErrors };
    }
    throw error;
  }
}

// Security middleware for API routes
export function createSecurityMiddleware(
  options: {
    rateLimiter?: { maxRequests: number; windowMs: number };
    requireCSRF?: boolean;
    sanitizeInput?: boolean;
  } = {}
) {
  return async (
    request: Request,
    context: { ip?: string; csrfToken?: string }
  ) => {
    // Rate limiting
    if (options.rateLimiter && context.ip) {
      const limiter = RateLimiter.getInstance(
        'api',
        options.rateLimiter.maxRequests,
        options.rateLimiter.windowMs
      );

      if (!limiter.isAllowed(context.ip)) {
        throw new Error('Rate limit exceeded');
      }
    }

    // CSRF protection
    if (options.requireCSRF && request.method !== 'GET') {
      const receivedToken = CSRFProtection.getTokenFromRequest(request);
      if (
        !receivedToken ||
        !context.csrfToken ||
        !CSRFProtection.verifyToken(receivedToken, context.csrfToken)
      ) {
        throw new Error('CSRF token mismatch');
      }
    }

    // Input sanitization
    if (options.sanitizeInput && request.body) {
      const body = await request.json();
      const sanitized = sanitizeObject(body);
      return new Request(request.url, {
        ...request,
        body: JSON.stringify(sanitized),
      });
    }

    return request;
  };
}

function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return InputSanitizer.removeXss(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

const SecurityValidation = {
  ValidationPatterns,
  CommonSchemas,
  UserSchemas,
  JobSchemas,
  MessageSchemas,
  FileSchemas,
  InputSanitizer,
  RateLimiter,
  CSRFProtection,
  CSPGenerator,
  useValidation,
  validateRequest,
  createSecurityMiddleware,
};

export default SecurityValidation;
