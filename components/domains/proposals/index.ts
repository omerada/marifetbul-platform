// ================================================
// PROPOSALS DOMAIN COMPONENTS
// ================================================
// All proposal-related components

export {
  ProposalStatusBadge,
  getStatusColor,
  getStatusLabel,
} from './ProposalStatusBadge';
export { FreelancerProposalCard } from './FreelancerProposalCard';
export { FreelancerPreviewCard } from './FreelancerPreviewCard';
export { ProposalDetailModal } from './ProposalDetailModal';
export { ProposalComparisonView } from './ProposalComparisonView';
export {
  ProposalNotificationItem,
  ProposalNotificationList,
  ProposalNotificationBadge,
} from './ProposalNotificationItem';

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
