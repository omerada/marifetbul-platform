/**
 * ================================================
 * PROPOSAL VALIDATION SCHEMAS
 * ================================================
 * Validation schemas for proposal forms
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 6, 2025
 * Sprint: Job Posting & Proposal System - Story 2
 */

import { z } from 'zod';
import { baseSchemas } from './base';

// ================================================
// PROPOSAL SCHEMA
// ================================================

/**
 * Proposal Status
 */
export const proposalStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]);

/**
 * Milestone Schema
 */
export const proposalMilestoneSchema = z.object({
  title: baseSchemas.title
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),

  description: baseSchemas.description
    .min(20, 'Açıklama en az 20 karakter olmalıdır')
    .max(500, 'Açıklama en fazla 500 karakter olabilir'),

  amount: baseSchemas.price
    .min(10, 'Tutar en az 10 TL olmalıdır')
    .max(1000000, 'Tutar çok yüksek'),

  durationDays: z
    .number()
    .int('Süre tam sayı olmalıdır')
    .min(1, 'Süre en az 1 gün olmalıdır')
    .max(365, 'Süre en fazla 365 gün olabilir'),
});

/**
 * Question Schema (for clarification questions)
 */
export const proposalQuestionSchema = z.object({
  question: z
    .string()
    .min(10, 'Soru en az 10 karakter olmalıdır')
    .max(500, 'Soru en fazla 500 karakter olabilir'),

  answer: z
    .string()
    .min(10, 'Cevap en az 10 karakter olmalıdır')
    .max(1000, 'Cevap en fazla 1000 karakter olabilir'),
});

/**
 * Main Proposal Schema
 */
export const proposalSchema = z
  .object({
    // Basic Info
    jobId: baseSchemas.id,

    coverLetter: baseSchemas.description
      .min(100, 'Kapak mektubu en az 100 karakter olmalıdır')
      .max(2000, 'Kapak mektubu en fazla 2000 karakter olabilir'),

    // Budget
    bidAmount: baseSchemas.price
      .min(50, 'Teklif tutarı en az 50 TL olmalıdır')
      .max(1000000, 'Teklif tutarı çok yüksek'),

    // Timeline
    deliveryTime: z
      .number()
      .int('Teslimat süresi tam sayı olmalıdır')
      .min(1, 'Teslimat süresi en az 1 gün olmalıdır')
      .max(365, 'Teslimat süresi en fazla 365 gün olabilir'),

    // Optional Fields
    milestones: z
      .array(proposalMilestoneSchema)
      .max(10, 'En fazla 10 aşama ekleyebilirsiniz')
      .optional(),

    questions: z
      .array(proposalQuestionSchema)
      .max(5, 'En fazla 5 soru cevaplayabilirsiniz')
      .optional(),

    attachments: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url("Geçersiz dosya URL'si"),
          type: z.string(),
          size: z.number(),
        })
      )
      .max(5, 'En fazla 5 dosya ekleyebilirsiniz')
      .optional(),
  })
  .refine(
    (data) => {
      // If milestones provided, sum should match bidAmount
      if (data.milestones && data.milestones.length > 0) {
        const totalMilestoneAmount = data.milestones.reduce(
          (sum, m) => sum + m.amount,
          0
        );
        return Math.abs(totalMilestoneAmount - data.bidAmount) < 1; // Allow 1 TL difference for rounding
      }
      return true;
    },
    {
      message: 'Aşamaların toplam tutarı teklif tutarına eşit olmalıdır',
      path: ['milestones'],
    }
  )
  .refine(
    (data) => {
      // If milestones provided, total duration should be reasonable
      if (data.milestones && data.milestones.length > 0) {
        const totalMilestoneDuration = data.milestones.reduce(
          (sum, m) => sum + m.durationDays,
          0
        );
        return totalMilestoneDuration <= data.deliveryTime;
      }
      return true;
    },
    {
      message: 'Aşamaların toplam süresi teslimat süresini aşmamalıdır',
      path: ['milestones'],
    }
  );

/**
 * Proposal Update Schema
 */
export const proposalUpdateSchema = proposalSchema.partial().extend({
  id: baseSchemas.id,
});

/**
 * Proposal Search Schema
 */
export const proposalSearchSchema = z.object({
  jobId: baseSchemas.id.optional(),
  freelancerId: baseSchemas.id.optional(),
  status: z.array(proposalStatusEnum).optional(),
  minAmount: baseSchemas.price.optional(),
  maxAmount: baseSchemas.price.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(20),
  sortBy: z
    .enum(['newest', 'amount_low', 'amount_high', 'delivery'])
    .default('newest'),
});

/**
 * Proposal Accept Schema
 */
export const proposalAcceptSchema = z.object({
  proposalId: baseSchemas.id,
  message: z
    .string()
    .min(10, 'Mesaj en az 10 karakter olmalıdır')
    .max(500, 'Mesaj en fazla 500 karakter olabilir')
    .optional(),
});

/**
 * Proposal Reject Schema
 */
export const proposalRejectSchema = z.object({
  proposalId: baseSchemas.id,
  reason: z
    .enum([
      'budget',
      'timeline',
      'experience',
      'portfolio',
      'communication',
      'other',
    ])
    .optional(),
  message: z
    .string()
    .min(10, 'Mesaj en az 10 karakter olmalıdır')
    .max(500, 'Mesaj en fazla 500 karakter olabilir')
    .optional(),
});

/**
 * Proposal Withdraw Schema
 */
export const proposalWithdrawSchema = z.object({
  proposalId: baseSchemas.id,
  reason: z
    .string()
    .min(10, 'Sebep en az 10 karakter olmalıdır')
    .max(200, 'Sebep en fazla 200 karakter olabilir')
    .optional(),
});

// ================================================
// TYPE EXPORTS
// ================================================

export type ProposalFormData = z.infer<typeof proposalSchema>;
export type ProposalUpdateFormData = z.infer<typeof proposalUpdateSchema>;
export type ProposalSearchFormData = z.infer<typeof proposalSearchSchema>;
export type ProposalAcceptFormData = z.infer<typeof proposalAcceptSchema>;
export type ProposalRejectFormData = z.infer<typeof proposalRejectSchema>;
export type ProposalWithdrawFormData = z.infer<typeof proposalWithdrawSchema>;
export type ProposalStatus = z.infer<typeof proposalStatusEnum>;
export type ProposalMilestone = z.infer<typeof proposalMilestoneSchema>;
export type ProposalQuestion = z.infer<typeof proposalQuestionSchema>;

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: number): number {
  const FEE_PERCENTAGE = 0.05; // 5%
  return Math.round(amount * FEE_PERCENTAGE * 100) / 100;
}

/**
 * Calculate freelancer net amount
 */
export function calculateFreelancerAmount(bidAmount: number): number {
  return bidAmount - calculatePlatformFee(bidAmount);
}

/**
 * Get proposal status display text
 */
export function getProposalStatusLabel(status: ProposalStatus): string {
  const labels: Record<ProposalStatus, string> = {
    PENDING: 'Beklemede',
    ACCEPTED: 'Kabul Edildi',
    REJECTED: 'Reddedildi',
    WITHDRAWN: 'Geri Çekildi',
  };
  return labels[status];
}

/**
 * Get proposal status color
 */
export function getProposalStatusColor(status: ProposalStatus): string {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'ACCEPTED':
      return 'green';
    case 'REJECTED':
      return 'red';
    case 'WITHDRAWN':
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Format delivery time display
 */
export function formatDeliveryTime(days: number): string {
  if (days === 1) return '1 gün';
  if (days < 7) return `${days} gün`;
  if (days === 7) return '1 hafta';
  if (days < 30) return `${Math.floor(days / 7)} hafta`;
  if (days === 30) return '1 ay';
  return `${Math.floor(days / 30)} ay`;
}

/**
 * Validate proposal data
 */
export function validateProposal(data: unknown) {
  return proposalSchema.safeParse(data);
}

/**
 * Check if proposal can be edited
 */
export function canEditProposal(status: ProposalStatus): boolean {
  return status === 'PENDING';
}

/**
 * Check if proposal can be withdrawn
 */
export function canWithdrawProposal(status: ProposalStatus): boolean {
  return status === 'PENDING';
}

/**
 * Check if proposal can be accepted
 */
export function canAcceptProposal(status: ProposalStatus): boolean {
  return status === 'PENDING';
}

/**
 * Check if proposal can be rejected
 */
export function canRejectProposal(status: ProposalStatus): boolean {
  return status === 'PENDING';
}
