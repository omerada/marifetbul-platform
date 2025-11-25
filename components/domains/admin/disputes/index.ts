/**
 * Admin Disputes Components - Index
 *
 * Central export point for all admin dispute components.
 *
 * @module components/domains/admin/disputes
 * @version 1.0.0
 * @production-ready ✅
 */

// ============================================================================
// DISPUTE RESOLUTION
// ============================================================================

export { AdminDisputeResolution } from './AdminDisputeResolution';
export type { AdminDisputeResolutionProps } from './AdminDisputeResolution';

export { default as DisputeResolutionModal } from './DisputeResolutionModal';

// ============================================================================
// DISPUTE MANAGEMENT
// ============================================================================

export { AdminDisputeDetailModal } from './AdminDisputeDetailModal';
export { AdminDisputeTable } from './AdminDisputeTable';
export { AdminDisputeQueue } from './AdminDisputeQueue';

// ============================================================================
// MIGRATION NOTE
// ============================================================================
//
// DisputeList and AdminDisputeList components have been removed to avoid duplicates.
// Use UnifiedDisputeList from '@/components/domains/disputes/core' instead:
//
// ```tsx
// import { UnifiedDisputeList } from '@/components/domains/disputes/core';
//
// // Card view (old DisputeList)
// <UnifiedDisputeList variant="card" disputes={data} />
//
// // Table view (old AdminDisputeList)
// <UnifiedDisputeList variant="table-advanced" disputes={data} />
// ```
