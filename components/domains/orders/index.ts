/**
 * Orders Domain Components
 * Sprint 1 Story 1.3: Consolidated from components/dashboard/orders and components/dashboard/client/orders
 */

// ================================================
// UNIFIED DELIVERY COMPONENTS (Production-Ready)
// ================================================
export { UnifiedDeliveryButton } from './UnifiedDeliveryButton';
export { UnifiedDeliveryModal } from './UnifiedDeliveryModal';
export type { UnifiedDeliveryButtonProps } from './UnifiedDeliveryButton';
export type {
  UnifiedDeliveryModalProps,
  DeliveryMode,
} from './UnifiedDeliveryModal';

// Sprint 1: Action buttons
export { AcceptOrderButton } from './AcceptOrderButton';
export { RequestRevisionButton } from './RequestRevisionButton';

// Order workflow modals
export { ApproveDeliveryModal } from './ApproveDeliveryModal';
export { RequestRevisionModal } from './RequestRevisionModal';
export { AcceptOrderModal } from './AcceptOrderModal';
export { CancelOrderModal } from './CancelOrderModal';

// ================================================
// SPRINT 2 CLEANUP - UNUSED ESCROW COMPONENTS ✅
// ================================================
// EscrowReleaseModal.tsx (341 lines) - DELETED
//   - Duplicate of wallet/ReleaseEscrowFlow
//   - Never used, ReleaseEscrowFlow is canonical
//   - Removed: 2025-11-14
//
// EscrowStatus.tsx (221 lines) - DELETED
//   - Never used in production
//   - StatusBadge provides needed functionality
//   - Removed: 2025-11-14
//
// Total reduction: 562 lines of duplicate/unused code
// ================================================

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
export { PaymentModeDisplay } from './PaymentModeDisplay';
export type { IBANDisplayCardProps } from './IBANDisplayCard';
export type { ManualPaymentConfirmationFormProps } from './ManualPaymentConfirmationForm';
export type { PaymentModeDisplayProps } from './PaymentModeDisplay';

// Sprint 1 - Story 1.2: Milestone Components MOVED
// @removed MilestoneListCard - Deprecated, use MilestoneList from @/components/domains/milestones
// Clean migration completed: All milestone UI now uses canonical components
// Date: 2025-11-15 (Sprint 1 Story 1.1)

// ================================================
// MILESTONE COMPONENTS - REMOVED (Sprint 1 Cleanup)
// ================================================
// All milestone components moved to @/components/domains/milestones
// Migration completed: 2025-11-16
//
// Removed deprecated components:
// - MilestoneAcceptancePanel → Use AcceptMilestoneModal
// - MilestoneCreationWizard → Use CreateMilestoneForm
// - MilestoneEditForm → Not needed in current flow
//
// Clean imports from milestones:
// import { AcceptMilestoneModal, CreateMilestoneForm, MilestoneList } from '@/components/domains/milestones';
// ================================================

// Order UI components
export {
  OrderReviewButton,
  OrderReviewButtonCompact,
} from './OrderReviewButton';
export { OrderTimeline } from './OrderTimeline';
export { OrderWorkflowStepper } from './OrderWorkflowStepper';
export { OrderActions } from './OrderActions';
export { OrderDetailTabs } from './OrderDetailTabs'; // Story 1.1 ✅
export type { OrderDetailTabsProps, OrderTab } from './OrderDetailTabs';
export { OrderCard, OrderCardSkeleton } from './OrderCard';
export { OrderMessagingPanel } from './OrderMessagingPanel';
export { OrderMessageBadge } from './OrderMessageBadge';
export { OrderListFilters } from './OrderListFilters';
export { DeliveryManager } from './DeliveryManager';

// @deprecated EscrowStatus removed - use StatusBadge from @/components/ui/Badge

// Sprint 2: Order Dashboard Components
export { OrderStatsWidget } from './OrderStatsWidget';
export { RecentOrdersList } from './RecentOrdersList';
export { OrderQuickActions } from './OrderQuickActions';
export { OrderActivityLog } from './OrderActivityLog';
export { OrderAttachmentsViewer } from './OrderAttachmentsViewer';
export { OrderExportButton } from './OrderExportButton';

// Type exports for Order Dashboard Components
export type { OrderStatsWidgetProps } from './OrderStatsWidget';
export type { RecentOrdersListProps } from './RecentOrdersList';
export type { OrderQuickActionsProps } from './OrderQuickActions';

// Order creation forms (Dual Payment System)
export { CustomOrderForm } from './CustomOrderForm';

// Type exports
export type { OrderStats } from '@/types/business/features/orders';
export type { OrderWorkflowStepperProps } from './OrderWorkflowStepper';
export type { OrderActionsProps } from './OrderActions';
export type { AcceptOrderModalProps } from './AcceptOrderModal';
export type { CancelOrderModalProps } from './CancelOrderModal';
export type { OrderListFiltersProps } from './OrderListFilters';

// ================================================
// CLEAN ARCHITECTURE NOTES
// ================================================
// - Milestone components: @/components/domains/milestones
// - Order workflow: @/components/domains/orders
// - Payment flow: @/components/checkout
// - Admin tools: @/components/admin
// ================================================
export type { OrderCardProps } from './OrderCard';
export type { OrderMessagingPanelProps } from './OrderMessagingPanel';
export type { OrderMessageBadgeProps } from './OrderMessageBadge';
