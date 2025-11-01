/**
 * Dispute Validation Schemas
 * Sprint 1: Dispute System Implementation
 */

import { z } from 'zod';
import { DisputeReason } from '@/types/dispute';

/**
 * File validation helper
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Create Dispute Schema
 */
export const createDisputeSchema = z.object({
  orderId: z.string().uuid('Geçerli bir sipariş ID giriniz'),

  reason: z.nativeEnum(DisputeReason, {
    message: 'Lütfen bir itiraz nedeni seçin',
  }),

  description: z
    .string()
    .min(50, 'Açıklama en az 50 karakter olmalı')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir')
    .trim(),

  evidenceFiles: z
    .array(z.instanceof(File))
    .max(5, 'En fazla 5 dosya yükleyebilirsiniz')
    .optional()
    .refine(
      (files) => {
        if (!files) return true;
        return files.every((file) => file.size <= MAX_FILE_SIZE);
      },
      { message: 'Her dosya en fazla 10MB olabilir' }
    )
    .refine(
      (files) => {
        if (!files) return true;
        return files.every((file) => ALLOWED_FILE_TYPES.includes(file.type));
      },
      {
        message: 'Sadece JPG, PNG, PDF veya DOC dosyaları yükleyebilirsiniz',
      }
    ),
});

/**
 * Add Message Schema
 */
export const addMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Mesaj boş olamaz')
    .max(1000, 'Mesaj en fazla 1000 karakter olabilir')
    .trim(),

  attachments: z.array(z.string().url()).max(3).optional(),
});

/**
 * Dispute Resolution Schema (Admin)
 */
export const disputeResolutionSchema = z
  .object({
    resolutionType: z.enum(
      [
        'FAVOR_BUYER_FULL_REFUND',
        'FAVOR_BUYER_PARTIAL_REFUND',
        'FAVOR_SELLER_NO_REFUND',
        'MUTUAL_AGREEMENT',
        'PARTIAL_REFUND',
      ],
      {
        message: 'Lütfen bir çözüm tipi seçin',
      }
    ),

    resolution: z
      .string()
      .min(50, 'Çözüm açıklaması en az 50 karakter olmalı')
      .max(1000, 'Çözüm açıklaması en fazla 1000 karakter olabilir')
      .trim(),

    refundAmount: z.number().min(0, 'İade tutarı negatif olamaz').optional(),
  })
  .refine(
    (data) => {
      // If resolution type includes refund, amount must be provided
      const includesRefund = data.resolutionType !== 'FAVOR_SELLER_NO_REFUND';
      if (includesRefund) {
        return data.refundAmount !== undefined && data.refundAmount > 0;
      }
      return true;
    },
    {
      message: 'İade içeren çözümlerde iade tutarı belirtilmelidir',
      path: ['refundAmount'],
    }
  );

/**
 * Dispute Filters Schema (Admin)
 */
export const disputeFiltersSchema = z.object({
  status: z
    .enum([
      'OPEN',
      'UNDER_REVIEW',
      'AWAITING_BUYER_RESPONSE',
      'AWAITING_SELLER_RESPONSE',
      'RESOLVED',
      'CLOSED',
    ])
    .optional(),

  reason: z.nativeEnum(DisputeReason).optional(),

  raisedByUserId: z.string().uuid().optional(),

  orderId: z.string().uuid().optional(),

  dateFrom: z.string().datetime().optional(),

  dateTo: z.string().datetime().optional(),

  page: z.number().int().min(0).optional(),

  size: z.number().int().min(1).max(100).optional(),

  sort: z.enum(['createdAt', 'updatedAt', 'resolvedAt']).optional(),

  order: z.enum(['asc', 'desc']).optional(),
});

/**
 * Type exports
 */
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type AddMessageInput = z.infer<typeof addMessageSchema>;
export type DisputeResolutionInput = z.infer<typeof disputeResolutionSchema>;
export type DisputeFiltersInput = z.infer<typeof disputeFiltersSchema>;
