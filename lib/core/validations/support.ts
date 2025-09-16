import { z } from 'zod';

// Support Ticket Validation Schemas
export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(10, 'Konu en az 10 karakter olmalıdır')
    .max(200, 'Konu en fazla 200 karakter olabilir'),
  description: z
    .string()
    .min(20, 'Açıklama en az 20 karakter olmalıdır')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  category: z
    .enum([
      'account',
      'billing',
      'payment',
      'technical',
      'dispute',
      'feature_request',
      'bug_report',
      'general',
      'abuse',
      'refund',
      'report_user',
    ])
    .refine((val) => val, { message: 'Geçerli bir kategori seçiniz' }),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .refine((val) => val, { message: 'Geçerli bir öncelik seçiniz' }),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1, 'Dosya adı gereklidir'),
        url: z.string().url('Geçerli bir URL olmalıdır'),
        size: z
          .number()
          .max(10 * 1024 * 1024, 'Dosya boyutu en fazla 10MB olabilir'),
        type: z.string().optional(),
      })
    )
    .max(5, 'En fazla 5 dosya eklenebilir')
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ticketResponseSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID gereklidir'),
  content: z
    .string()
    .min(10, 'Yanıt en az 10 karakter olmalıdır')
    .max(2000, 'Yanıt en fazla 2000 karakter olabilir'),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        size: z.number().max(10 * 1024 * 1024),
        type: z.string().optional(),
      })
    )
    .max(3, 'En fazla 3 dosya eklenebilir')
    .optional(),
  isPublic: z.boolean().default(true),
});

export const ticketSearchSchema = z.object({
  status: z
    .array(
      z.enum([
        'open',
        'pending',
        'in_progress',
        'waiting_user',
        'resolved',
        'closed',
      ])
    )
    .optional(),
  category: z
    .array(
      z.enum([
        'account',
        'billing',
        'payment',
        'technical',
        'dispute',
        'feature_request',
        'bug_report',
        'general',
        'abuse',
        'refund',
        'report_user',
      ])
    )
    .optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().max(100).optional(),
  assignedAgent: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z
    .enum(['created', 'updated', 'priority', 'status'])
    .default('created'),
});

// Help Center Article Validation Schemas
export const articleRatingSchema = z.object({
  articleId: z.string().min(1, 'Makale ID gereklidir'),
  rating: z
    .number()
    .min(1, 'Puan en az 1 olmalıdır')
    .max(5, 'Puan en fazla 5 olabilir')
    .int('Puan tam sayı olmalıdır'),
  feedback: z
    .string()
    .max(500, 'Geri bildirim en fazla 500 karakter olabilir')
    .optional(),
  isHelpful: z.boolean(),
});

export const articleSearchSchema = z.object({
  query: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  language: z.enum(['tr', 'en']).default('tr'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['relevance', 'views', 'rating', 'date']).default('relevance'),
});

// Chat System Validation Schemas
export const startChatSchema = z.object({
  topic: z.string().max(200).optional(),
  department: z
    .enum(['technical', 'billing', 'sales', 'general'])
    .default('general')
    .refine((val) => val, { message: 'Geçerli bir departman seçiniz' }),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const sendChatMessageSchema = z.object({
  chatId: z.string().min(1, 'Chat ID gereklidir'),
  message: z
    .string()
    .min(1, 'Mesaj boş olamaz')
    .max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
  messageType: z.enum(['text', 'file', 'image']).default('text'),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        type: z.string(),
        size: z.number().max(5 * 1024 * 1024), // 5MB for chat
      })
    )
    .max(3)
    .optional(),
  replyTo: z.string().optional(),
});

export const chatFeedbackSchema = z.object({
  chatId: z.string().min(1, 'Chat ID gereklidir'),
  rating: z
    .number()
    .min(1, 'Puan en az 1 olmalıdır')
    .max(5, 'Puan en fazla 5 olabilir')
    .int('Puan tam sayı olmalıdır'),
  feedback: z
    .string()
    .max(500, 'Geri bildirim en fazla 500 karakter olabilir')
    .optional(),
  categories: z
    .object({
      responsiveness: z.number().min(1).max(5).int(),
      helpfulness: z.number().min(1).max(5).int(),
      professionalism: z.number().min(1).max(5).int(),
    })
    .optional(),
  wouldRecommend: z.boolean(),
});

// Common utility schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Import shared file validation
import { uploadedFileSchema } from './file';

// Type exports for forms
export type CreateTicketFormData = z.infer<typeof createTicketSchema>;
export type TicketResponseFormData = z.infer<typeof ticketResponseSchema>;
export type TicketSearchFormData = z.infer<typeof ticketSearchSchema>;
export type ArticleRatingFormData = z.infer<typeof articleRatingSchema>;
export type ArticleSearchFormData = z.infer<typeof articleSearchSchema>;
export type StartChatFormData = z.infer<typeof startChatSchema>;
export type SendChatMessageFormData = z.infer<typeof sendChatMessageSchema>;
export type ChatFeedbackFormData = z.infer<typeof chatFeedbackSchema>;

// Validation helper functions
export const validateTicketData = (data: unknown) => {
  return createTicketSchema.safeParse(data);
};

export const validateArticleRating = (data: unknown) => {
  return articleRatingSchema.safeParse(data);
};

export const validateChatMessage = (data: unknown) => {
  return sendChatMessageSchema.safeParse(data);
};

export const validateFileUpload = (data: unknown) => {
  return uploadedFileSchema.safeParse(data);
};

// Custom validation messages in Turkish
export const errorMessages = {
  required: 'Bu alan zorunludur',
  email: 'Geçerli bir e-posta adresi giriniz',
  minLength: (min: number) => `En az ${min} karakter olmalıdır`,
  maxLength: (max: number) => `En fazla ${max} karakter olabilir`,
  minValue: (min: number) => `En az ${min} olmalıdır`,
  maxValue: (max: number) => `En fazla ${max} olabilir`,
  invalidOption: 'Geçerli bir seçenek seçiniz',
  fileSize: 'Dosya boyutu çok büyük',
  fileType: 'Desteklenmeyen dosya tipi',
  maxFiles: (max: number) => `En fazla ${max} dosya yüklenebilir`,
} as const;
