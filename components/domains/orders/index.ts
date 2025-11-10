/**
 * Orders Domain Components
 * Sprint 1 Story 1.3: Consolidated from components/dashboard/orders and components/dashboard/client/orders
 */

// Sprint 1: New action buttons
export { DeliverOrderButton } from './DeliverOrderButton';
export { AcceptOrderButton } from './AcceptOrderButton';
export { RequestRevisionButton } from './RequestRevisionButton';

// Order workflow modals
export { DeliverOrderModal } from './DeliverOrderModal';
export { ApproveDeliveryModal } from './ApproveDeliveryModal';
export { RequestRevisionModal } from './RequestRevisionModal';
export { AcceptOrderModal } from './AcceptOrderModal';
export { DeliverySubmissionModal } from './DeliverySubmissionModal';
export { CancelOrderModal } from './CancelOrderModal';
export { EscrowReleaseModal } from './EscrowReleaseModal';

// Order revision components (Sprint 1.3)
export { OrderRevisionList } from './OrderRevisionList';

// Sprint 1 - Story 3: Milestone Revision UI
export { MilestoneRevisionModal } from './MilestoneRevisionModal';
export { RevisionHistoryTimeline } from './RevisionHistoryTimeline';
export { MilestoneProgressTracker } from './MilestoneProgressTracker';
export type { MilestoneRevisionModalProps } from './MilestoneRevisionModal';
export type { RevisionHistoryTimelineProps } from './RevisionHistoryTimeline';
export type { MilestoneProgressTrackerProps } from './MilestoneProgressTracker';

// Sprint 1 - Story 1.1: Manual Payment & IBAN Display
export { IBANDisplayCard } from './IBANDisplayCard';
export { ManualPaymentConfirmationForm } from './ManualPaymentConfirmationForm';
export type { IBANDisplayCardProps } from './IBANDisplayCard';
export type { ManualPaymentConfirmationFormProps } from './ManualPaymentConfirmationForm';

// Sprint 1 - Story 1.2: Milestone List & Progress Display
export { MilestoneListCard } from './MilestoneListCard';
export type { MilestoneListCardProps } from './MilestoneListCard';

// Sprint 1 - Story 1.3: Milestone Delivery & Acceptance
export { MilestoneDeliveryForm } from './MilestoneDeliveryForm';
export { MilestoneAcceptancePanel } from './MilestoneAcceptancePanel';
export type { MilestoneDeliveryFormProps } from './MilestoneDeliveryForm';
export type { MilestoneAcceptancePanelProps } from './MilestoneAcceptancePanel';

// Sprint 2 - Story 2: Milestone Creation & Editing
export { MilestoneCreationWizard } from './MilestoneCreationWizard';
export { MilestoneEditForm } from './MilestoneEditForm';
export { MilestoneDeletionModal } from './MilestoneDeletionModal';
export type { MilestoneCreationWizardProps } from './MilestoneCreationWizard';
export type { MilestoneEditFormProps } from './MilestoneEditForm';
export type { MilestoneDeletionModalProps } from './MilestoneDeletionModal';

// Order UI components
export {
  OrderReviewButton,
  OrderReviewButtonCompact,
} from './OrderReviewButton';
export { OrderTimeline } from './OrderTimeline';
export { OrderWorkflowStepper } from './OrderWorkflowStepper';
export { OrderActions } from './OrderActions';
export { OrderCard, OrderCardSkeleton } from './OrderCard';
export { OrderMessagingPanel } from './OrderMessagingPanel';
export { OrderMessageBadge } from './OrderMessageBadge';
export { OrderListFilters } from './OrderListFilters';
export { EscrowStatus } from './EscrowStatus';
export { DeliveryManager } from './DeliveryManager';

// Sprint 2: Order Dashboard Components
export { OrderStatsWidget } from './OrderStatsWidget';
export { RecentOrdersList } from './RecentOrdersList';
export { OrderQuickActions } from './OrderQuickActions';
export { OrderActivityLog } from './OrderActivityLog';
export { OrderAttachmentsViewer } from './OrderAttachmentsViewer';
export { AdvancedOrderFilters } from './AdvancedOrderFilters';
export type { OrderFilterValues } from './AdvancedOrderFilters';
export { OrderExportButton } from './OrderExportButton';

// Order creation forms (Dual Payment System)
export { CustomOrderForm } from './CustomOrderForm';

// Type exports
export type { OrderStats } from '@/types/business/features/orders';
export type { OrderWorkflowStepperProps } from './OrderWorkflowStepper';
export type { OrderActionsProps } from './OrderActions';
export type { AcceptOrderModalProps } from './AcceptOrderModal';
export type { DeliverySubmissionModalProps } from './DeliverySubmissionModal';
export type { CancelOrderModalProps } from './CancelOrderModal';
export type { OrderListFiltersProps } from './OrderListFilters';
export type { OrderCardProps } from './OrderCard';
export type { OrderMessagingPanelProps } from './OrderMessagingPanel';
export type { OrderMessageBadgeProps } from './OrderMessageBadge';
