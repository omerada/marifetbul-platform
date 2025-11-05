/**
 * Dispute Components
 * Export all dispute-related components
 *
 * Sprint 1.1: Unified component structure
 */

// Core components
export { UnifiedDisputeList, UnifiedDisputeListDefault } from './core';
export type {
  UnifiedDisputeListProps,
  DisputeListVariant,
  DisputeFilters as DisputeListFilters,
} from './core';

// Other components
export { DisputeCreationModal } from './DisputeCreationModal';
export { EvidenceUpload } from './EvidenceUpload';
export { DisputeTimeline, createTimelineEvents } from './DisputeTimeline';
export type { DisputeEvent, DisputeEventType } from './DisputeTimeline';
export { DisputeCard } from './DisputeCard';
export { DisputeStatistics } from './DisputeStatistics';
export { DisputeFilters } from './DisputeFilters';
export { default as DisputeMessages } from './DisputeMessages';

// ⚠️ DEPRECATED: Old DisputeList component - Use UnifiedDisputeList instead
// Will be removed in next major version
export { DisputeList as DisputeListLegacy } from './DisputeList';
