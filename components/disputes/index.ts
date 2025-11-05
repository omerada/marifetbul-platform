/**
 * Disputes Components (Legacy Location)
 *
 * ⚠️ DEPRECATED: This location is deprecated
 * Use @/components/domains/disputes instead
 *
 * Sprint 1.1: DisputeList removed, use UnifiedDisputeList
 */

export { CreateDisputeModal } from './CreateDisputeModal';
export { DisputeCard } from './DisputeCard';
export { DisputeMessaging } from './DisputeMessaging';
export { DisputeEvidence } from './DisputeEvidence';
export { DisputeTimeline } from './DisputeTimeline';

// ⚠️ MIGRATION NOTE:
// DisputeList has been removed and replaced with UnifiedDisputeList
// New location: @/components/domains/disputes/core
//
// import { UnifiedDisputeList } from '@/components/domains/disputes/core';
// <UnifiedDisputeList variant="card" disputes={data} />
