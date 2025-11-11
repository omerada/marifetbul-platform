// ================================================
// PROPOSALS DOMAIN COMPONENTS
// ================================================
// All proposal-related components

export { ProposalCard } from './ProposalCard';
export { FreelancerProposalCardV2 } from './FreelancerProposalCardV2';
// AcceptProposalModal moved to jobs domain (more feature-rich with payment mode)
export { AcceptProposalModal } from '../jobs/AcceptProposalModal';
export { RejectProposalModal } from './RejectProposalModal';
export { FreelancerProposalCard } from './FreelancerProposalCard';
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
