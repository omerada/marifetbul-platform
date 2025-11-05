/**
 * Disputes Domain - Core Components
 *
 * Central barrel export for core dispute components
 * Sprint 1.1: Component Consolidation
 */

// Main unified component (replaces 3 duplicate components)
export { UnifiedDisputeList } from './UnifiedDisputeList';
export { default as UnifiedDisputeListDefault } from './UnifiedDisputeList';

// Export types
export type {
  UnifiedDisputeListProps,
  DisputeListVariant,
  DisputeFilters,
} from './UnifiedDisputeList';
