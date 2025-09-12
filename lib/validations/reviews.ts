import { z } from 'zod';

// Review validation schema
export const reviewSchema = z.object({
  orderId: z.string().min(1, 'Sipariş ID gereklidir'),
  reviewerId: z.string().min(1, 'İnceleyici ID gereklidir'),
  revieweeId: z.string().min(1, 'İncelenen ID gereklidir'),
  rating: z
    .number()
    .min(1, 'En az 1 yıldız vermelisiniz')
    .max(5, 'En fazla 5 yıldız verebilirsiniz'),
  categories: z.object({
    communication: z.number().min(1).max(5),
    quality: z.number().min(1).max(5),
    timing: z.number().min(1).max(5),
    professionalism: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
  }),
  comment: z
    .string()
    .min(10, 'Yorum en az 10 karakter olmalıdır')
    .max(2000, 'Yorum en fazla 2000 karakter olabilir'),
  isPublic: z.boolean(),
});

// Review reply validation schema
export const reviewReplySchema = z.object({
  reviewId: z.string().min(1, 'İnceleme ID gereklidir'),
  content: z
    .string()
    .min(10, 'Yanıt en az 10 karakter olmalıdır')
    .max(1000, 'Yanıt en fazla 1000 karakter olabilir'),
});

// Review moderation schema
export const reviewModerationSchema = z.object({
  reviewId: z.string().min(1, 'İnceleme ID gereklidir'),
  action: z.enum(['approve', 'hide', 'mark_spam', 'dispute'], {
    message: 'Geçerli bir işlem seçiniz',
  }),
  reason: z.string().optional(),
  moderatorNote: z
    .string()
    .max(500, 'Moderatör notu en fazla 500 karakter olabilir')
    .optional(),
});

// Review report schema
export const reviewReportSchema = z.object({
  reviewId: z.string().min(1, 'İnceleme ID gereklidir'),
  reason: z.enum(['spam', 'offensive', 'fake', 'inappropriate', 'other'], {
    message: 'Şikayet sebebini seçiniz',
  }),
  description: z
    .string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional(),
  reporterId: z.string().min(1, 'Raporlayan kullanıcı ID gereklidir'),
});

// Review filters schema
export const reviewFiltersSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  category: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  verified: z.boolean().optional(),
  hasReply: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful'])
    .optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ReviewReplyFormData = z.infer<typeof reviewReplySchema>;
export type ReviewModerationFormData = z.infer<typeof reviewModerationSchema>;
export type ReviewReportFormData = z.infer<typeof reviewReportSchema>;
export type ReviewFiltersFormData = z.infer<typeof reviewFiltersSchema>;
