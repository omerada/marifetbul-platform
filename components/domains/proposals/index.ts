// ================================================
// PROPOSALS DOMAIN COMPONENTS
// ================================================
// All proposal-related components
// Sprint 2: Cleaned up deprecated/duplicate components

export { FreelancerProposalCardV2 } from './FreelancerProposalCardV2';
// Action modals moved to jobs domain (employer-centric functionality)
export { AcceptProposalModal } from '../jobs/AcceptProposalModal';
export { RejectProposalModal } from '../jobs/RejectProposalModal';
export { FreelancerPreviewCard } from './FreelancerPreviewCard';
export { ProposalDetailModal } from './ProposalDetailModal';
export { ProposalComparisonView } from './ProposalComparisonView';
export {
  ProposalNotificationItem,
  ProposalNotificationList,
  ProposalNotificationBadge,
} from './ProposalNotificationItem';

// Sprint: Dashboard Route Consolidation - Shared Components
export { ProposalStatistics } from './ProposalStatistics';
export type { ProposalStatsData } from './ProposalStatistics';
export { ProposalFilters } from './ProposalFilters';
export type { SortOption, FilterStatus } from './ProposalFilters';

// Error Boundary
export {
  ProposalErrorBoundary,
  withProposalErrorBoundary,
} from './ProposalErrorBoundary';

// Loading Skeletons
export {
  ProposalCardSkeleton,
  JobCardSkeleton,
  ProposalDetailSkeleton,
  NotificationListSkeleton,
  DashboardStatsSkeleton,
  FormSkeleton,
} from './ProposalSkeletons';

// NEW ✨ Sprint 1 - Enhanced Proposal Form
export { ProposalFormV2 } from './ProposalFormV2';

// NEW ✨ Sprint 1 - Proposal Comparison Modal
export { ProposalComparisonModal } from './ProposalComparisonModal';
export type { ProposalComparisonModalProps } from './ProposalComparisonModal';
