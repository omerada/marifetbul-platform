/**
 * ================================================
 * DEPRECATION NOTICE
 * ================================================
 * This file is DEPRECATED and will be removed in the next version.
 * 
 * USE INSTEAD:
 * - import { ProposalResponse } from '@/types/backend-aligned';
 * 
 * MIGRATION GUIDE:
 * - Old: import { Proposal } from '@/types/core/jobs';
 * - New: import type { ProposalResponse } from '@/types/backend-aligned';
 * 
 * REASON:
 * - Consolidating all types to backend-aligned.ts for consistency
 * - ProposalResponse matches backend Java types exactly
 * - Prevents type mismatches and duplicate definitions
 * 
 * @deprecated Use @/types/backend-aligned instead
 * @since 2025-11-11
 */

// Re-export from backend-aligned for backward compatibility (temporary)
export type {
  ProposalResponse as Proposal,
  ProposalStatus,
  ProposalMilestone,
  ProposalQuestion,
} from '@/types/backend-aligned';

// Mark as deprecated
/** @deprecated Use ProposalResponse from @/types/backend-aligned */
export type LegacyProposal = import('@/types/backend-aligned').ProposalResponse;
