// ================================================
// JOBS DOMAIN COMPONENTS
// ================================================
// All job-related components
// Includes job listings, details, proposals, and job management
// Sprint 1: Complete Job Posting Implementation ✨

// Job Components
export { JobDetail } from './JobDetail';
export { JobProposalButton } from './JobProposalButton';
export { JobCard } from './JobCard';
export { JobFilters } from './JobFilters';
export { FilterChips } from './FilterChips';
export { JobCreateForm } from './JobCreateForm';
export { default as JobImageUploader } from './JobImageUploader'; // NEW ✨

// Analytics & Dashboard Components - NEW ✨
export { JobStatsCard, JobStatsGrid } from './JobStatsCard';
export type { JobStatsCardProps, JobStatsGridProps } from './JobStatsCard';
export { JobQuickActions, ActiveFiltersPills } from './JobQuickActions';
export type {
  JobQuickActionsProps,
  FilterPill,
  ActiveFiltersPillsProps,
} from './JobQuickActions';
export { AdvancedJobFilters } from './AdvancedJobFilters';
export type {
  AdvancedJobFiltersState,
  AdvancedJobFiltersProps,
} from './AdvancedJobFilters';
export {
  JobBulkActions,
  JobSelectionCheckbox,
  useBulkActionConfirmation,
} from './JobBulkActions';
export type {
  BulkAction,
  JobBulkActionsProps,
  JobSelectionCheckboxProps,
  BulkActionConfirmation,
} from './JobBulkActions';
export { JobAnalyticsCharts } from './JobAnalyticsCharts';
export type {
  JobAnalyticsData,
  JobAnalyticsChartsProps,
} from './JobAnalyticsCharts';

// Job Management Components (Sprint 2)
export { JobEditForm } from './JobEditForm';
export { JobPreviewModal } from './JobPreviewModal';
export { JobCloseModal, JobReopenModal } from './JobStatusModals';

// Sprint 3 - Story 3.1: Job Deletion
export { DeleteJobModal } from './DeleteJobModal';
export type { DeleteJobModalProps } from './DeleteJobModal';

// Sprint 3 - Story 3.2: Advanced Job Search & Filtering
export { AdvancedJobSearchModal } from './AdvancedJobSearchModal';
export type { AdvancedJobSearchModalProps } from './AdvancedJobSearchModal';
export { BudgetRangeSlider } from './BudgetRangeSlider';

// Proposal Components
export { ProposalForm } from './ProposalForm';
export { ProposalCard } from './ProposalCard';
export { ProposalListItem } from './ProposalListItem';
export { ProposalSubmitModal } from './ProposalSubmitModal';
export { AcceptProposalModal } from './AcceptProposalModal';
export { RejectProposalModal } from './RejectProposalModal';
