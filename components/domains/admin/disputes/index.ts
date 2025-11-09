/**
 * ================================================
 * ADMIN DISPUTES COMPONENTS - INDEX
 * ================================================
 * Central export point for all admin dispute components
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 3: Admin Enhancement
 * @version 2.0.0 - Sprint 16 Story 3.1: Added AdminDisputeQueue
 * @version 3.0.0 - Sprint 1.1: Removed duplicate DisputeList components
 *                  Use UnifiedDisputeList from @/components/domains/disputes instead
 */

export { AdminDisputeDetailModal } from './AdminDisputeDetailModal';
export { default as DisputeResolutionModal } from './DisputeResolutionModal';
export { AdminDisputeTable } from './AdminDisputeTable';
export { AdminDisputeQueue } from './AdminDisputeQueue';

// ⚠️ MIGRATION NOTE: DisputeList and AdminDisputeList removed
// Use UnifiedDisputeList from '@/components/domains/disputes/core' instead:
//
// import { UnifiedDisputeList } from '@/components/domains/disputes/core';
//
// Old: <DisputeList disputes={data} />
// New: <UnifiedDisputeList variant="card" disputes={data} />
//
// Old: <AdminDisputeList />
// New: <UnifiedDisputeList variant="table-advanced" disputes={data} />
