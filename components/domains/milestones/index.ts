/**
 * ================================================
 * MILESTONES DOMAIN INDEX
 * ================================================
 * Public exports for milestone components
 * Sprint 1 - Milestone Payment System
 */

export { MilestoneList } from './MilestoneList';
export { DeliverMilestoneModal } from './DeliverMilestoneModal'; // Story 1.4 ✅
export { AcceptMilestoneModal } from './AcceptMilestoneModal'; // Story 1.5 ✅
export { RejectMilestoneModal } from './RejectMilestoneModal'; // Story 1.6 ✅
export { CreateMilestoneForm } from './CreateMilestoneForm'; // Story 1.7 ✅
export { MilestoneStatusBadge } from './MilestoneStatusBadge'; // Sprint 1.2 ✅
export { MilestonePaymentCard } from './MilestonePaymentCard'; // Story 1.6 ✅ - Payment breakdown
export { MilestoneProgressWidget } from './MilestoneProgressWidget'; // Story 1.7 ✅ - Dashboard widget

// Export types
export type { MilestoneStatus } from './MilestoneStatusBadge';
export type { MilestoneStatusBadgeProps } from './MilestoneStatusBadge';
export type { MilestonePaymentCardProps } from './MilestonePaymentCard';
export type { MilestoneProgressWidgetProps } from './MilestoneProgressWidget';
