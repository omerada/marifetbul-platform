/**
 * Dispute Components
 * Export all dispute-related components
 *
 * @module components/domains/disputes
 * @version 1.0.0
 * @production-ready ✅
 */

// ============================================================================
// DISPUTE CREATION
// ============================================================================

export { CreateDisputeForm } from './CreateDisputeForm';
export type { CreateDisputeFormProps } from './CreateDisputeForm';

export { DisputeCreationModal } from './DisputeCreationModal';

// ============================================================================
// DISPUTE DETAIL & MANAGEMENT
// ============================================================================

export { DisputeDetailView } from './DisputeDetailView';
export type { DisputeDetailViewProps } from './DisputeDetailView';

export { DisputeCard } from './DisputeCard';
export { DisputeTimeline, createTimelineEvents } from './DisputeTimeline';
export type { DisputeEvent, DisputeEventType } from './DisputeTimeline';
export { default as DisputeMessaging } from './DisputeMessaging';

// ============================================================================
// DISPUTE LISTS & FILTERING
// ============================================================================

export { UnifiedDisputeList, UnifiedDisputeListDefault } from './core';
export type {
  UnifiedDisputeListProps,
  DisputeListVariant,
  DisputeFilters as DisputeListFilters,
} from './core';

// ============================================================================
// EVIDENCE MANAGEMENT
// ============================================================================

export { EvidenceUploadV2 } from './EvidenceUploadV2';
export { EvidenceGallery } from './EvidenceGallery';
export type { EvidenceItem } from './EvidenceGallery';

// ============================================================================
// ANALYTICS & STATISTICS
// ============================================================================

export { DisputeStatistics } from './DisputeStatistics';
export { DisputeFilters } from './DisputeFilters';
export { DisputeAnalytics } from './DisputeAnalytics';
