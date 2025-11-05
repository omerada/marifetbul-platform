/**
 * ================================================
 * MILESTONE TYPES - ORDER & PROPOSAL MILESTONES
 * ================================================
 * Type definitions for milestone-based project management
 *
 * Features:
 * - Order milestones (future - pending backend)
 * - Proposal milestones (backend ready)
 * - Progress tracking
 * - Partial payments
 *
 * @version 1.0.0
 * @sprint Sprint 4 - Milestone Payment System
 * @author MarifetBul Development Team
 */

// ================================================
// ENUMS
// ================================================

/**
 * Milestone Status
 */
export enum MilestoneStatus {
  /** Milestone not yet started */
  PENDING = 'PENDING',
  /** Freelancer is working on milestone */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Freelancer delivered milestone */
  DELIVERED = 'DELIVERED',
  /** Buyer accepted milestone and payment released */
  ACCEPTED = 'ACCEPTED',
  /** Milestone revision requested */
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  /** Milestone canceled */
  CANCELED = 'CANCELED',
}

// ================================================
// ORDER MILESTONE (Future - Pending Backend Implementation)
// ================================================

/**
 * Order Milestone
 * NOTE: Backend implementation pending - types ready for future use
 */
export interface OrderMilestone {
  /** Milestone UUID */
  id: string;
  /** Parent order UUID */
  orderId: string;
  /** Milestone sequence number (1, 2, 3...) */
  sequence: number;
  /** Milestone title */
  title: string;
  /** Milestone description/requirements */
  description: string;
  /** Milestone amount (partial payment) */
  amount: number;
  /** Currency code */
  currency: string;
  /** Target due date */
  dueDate: string; // ISO 8601
  /** Current status */
  status: MilestoneStatus;
  /** Delivery notes from freelancer */
  deliveryNotes?: string;
  /** Delivery attachments (URLs) */
  attachments?: string[];
  /** When milestone was delivered */
  deliveredAt?: string;
  /** When milestone was accepted */
  acceptedAt?: string;
  /** Created timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Create Order Milestone Request
 */
export interface CreateOrderMilestoneRequest {
  /** Milestone sequence number */
  sequence: number;
  /** Milestone title */
  title: string;
  /** Milestone description */
  description: string;
  /** Milestone amount */
  amount: number;
  /** Due date (optional) */
  dueDate?: string;
}

/**
 * Update Order Milestone Request
 */
export interface UpdateOrderMilestoneRequest {
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string;
  /** Updated amount */
  amount?: number;
  /** Updated due date */
  dueDate?: string;
}

/**
 * Deliver Milestone Request
 */
export interface DeliverMilestoneRequest {
  /** Delivery notes */
  deliveryNotes: string;
  /** Attachment URLs */
  attachments?: string;
}

// ================================================
// PROPOSAL MILESTONE (Backend Ready)
// ================================================

/**
 * Proposal Milestone
 * Backend: ProposalMilestoneDTO in ProposalResponse
 */
export interface ProposalMilestone {
  /** Milestone UUID */
  id: string;
  /** Milestone title */
  title: string;
  /** Milestone description */
  description: string;
  /** Milestone amount */
  amount: number;
  /** Target completion date */
  dueDate: string; // ISO 8601
  /** Milestone order/sequence */
  sequence: number;
}

/**
 * Create Proposal Milestone Request
 */
export interface CreateProposalMilestoneRequest {
  /** Milestone title */
  title: string;
  /** Milestone description */
  description: string;
  /** Milestone amount */
  amount: number;
  /** Due date */
  dueDate: string;
}

// ================================================
// MILESTONE STATISTICS
// ================================================

/**
 * Milestone Progress Summary
 */
export interface MilestoneProgress {
  /** Total milestones */
  total: number;
  /** Completed milestones */
  completed: number;
  /** In progress milestones */
  inProgress: number;
  /** Pending milestones */
  pending: number;
  /** Total amount */
  totalAmount: number;
  /** Amount released */
  releasedAmount: number;
  /** Amount remaining */
  remainingAmount: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
}

// ================================================
// UI HELPER TYPES
// ================================================

/**
 * Milestone Display Metadata
 */
export interface MilestoneStatusMetadata {
  status: MilestoneStatus;
  label: string;
  color: 'gray' | 'blue' | 'yellow' | 'green' | 'red' | 'purple';
  icon: string;
  description: string;
}

/**
 * Milestone status display metadata
 */
export const MILESTONE_STATUS_METADATA: Record<
  MilestoneStatus,
  MilestoneStatusMetadata
> = {
  [MilestoneStatus.PENDING]: {
    status: MilestoneStatus.PENDING,
    label: 'Beklemede',
    color: 'gray',
    icon: 'clock',
    description: 'Milestone henüz başlamadı',
  },
  [MilestoneStatus.IN_PROGRESS]: {
    status: MilestoneStatus.IN_PROGRESS,
    label: 'Devam Ediyor',
    color: 'blue',
    icon: 'loader',
    description: 'Freelancer üzerinde çalışıyor',
  },
  [MilestoneStatus.DELIVERED]: {
    status: MilestoneStatus.DELIVERED,
    label: 'Teslim Edildi',
    color: 'yellow',
    icon: 'package',
    description: 'Alıcı onayı bekleniyor',
  },
  [MilestoneStatus.ACCEPTED]: {
    status: MilestoneStatus.ACCEPTED,
    label: 'Onaylandı',
    color: 'green',
    icon: 'check-circle',
    description: 'Ödeme serbest bırakıldı',
  },
  [MilestoneStatus.REVISION_REQUESTED]: {
    status: MilestoneStatus.REVISION_REQUESTED,
    label: 'Revizyon İstendi',
    color: 'purple',
    icon: 'refresh-cw',
    description: 'Revizyon gerekiyor',
  },
  [MilestoneStatus.CANCELED]: {
    status: MilestoneStatus.CANCELED,
    label: 'İptal Edildi',
    color: 'red',
    icon: 'x-circle',
    description: 'Milestone iptal edildi',
  },
};

// ================================================
// WEBSOCKET EVENTS
// ================================================

/**
 * Milestone WebSocket Event Types
 */
export enum MilestoneWebSocketEventType {
  /** Milestone delivered */
  MILESTONE_DELIVERED = 'MILESTONE_DELIVERED',
  /** Milestone accepted */
  MILESTONE_ACCEPTED = 'MILESTONE_ACCEPTED',
  /** Milestone revision requested */
  MILESTONE_REVISION_REQUESTED = 'MILESTONE_REVISION_REQUESTED',
  /** Milestone status changed */
  MILESTONE_STATUS_CHANGED = 'MILESTONE_STATUS_CHANGED',
  /** Milestone completed (all milestones done) */
  MILESTONE_COMPLETED = 'MILESTONE_COMPLETED',
}

/**
 * Milestone WebSocket Update Payload
 */
export interface MilestoneWebSocketUpdate<T = unknown> {
  /** Event type */
  type: MilestoneWebSocketEventType;
  /** Order ID */
  orderId: string;
  /** Milestone ID */
  milestoneId: string;
  /** Update data */
  data: T;
  /** Timestamp */
  timestamp: string;
  /** Optional message */
  message?: string;
}

/**
 * Milestone Delivered Event Data
 */
export interface MilestoneDeliveredData {
  /** Milestone details */
  milestone: OrderMilestone;
  /** Delivery notes */
  deliveryNotes: string;
  /** Attachment URLs */
  attachments: string[];
  /** Delivered by */
  deliveredBy: {
    id: string;
    name: string;
  };
}

/**
 * Milestone Accepted Event Data
 */
export interface MilestoneAcceptedData {
  /** Milestone details */
  milestone: OrderMilestone;
  /** Payment released */
  paymentReleased: number;
  /** Accepted by */
  acceptedBy: {
    id: string;
    name: string;
  };
  /** Feedback */
  feedback?: string;
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Calculate milestone progress
 */
export function calculateMilestoneProgress(
  milestones: OrderMilestone[]
): MilestoneProgress {
  const total = milestones.length;
  const completed = milestones.filter(
    (m) => m.status === MilestoneStatus.ACCEPTED
  ).length;
  const inProgress = milestones.filter(
    (m) => m.status === MilestoneStatus.IN_PROGRESS
  ).length;
  const pending = milestones.filter(
    (m) => m.status === MilestoneStatus.PENDING
  ).length;

  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const releasedAmount = milestones
    .filter((m) => m.status === MilestoneStatus.ACCEPTED)
    .reduce((sum, m) => sum + m.amount, 0);
  const remainingAmount = totalAmount - releasedAmount;

  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    completed,
    inProgress,
    pending,
    totalAmount,
    releasedAmount,
    remainingAmount,
    progressPercentage: Math.round(progressPercentage),
  };
}

/**
 * Check if milestone can be delivered
 */
export function canDeliverMilestone(milestone: OrderMilestone): boolean {
  return (
    milestone.status === MilestoneStatus.IN_PROGRESS ||
    milestone.status === MilestoneStatus.REVISION_REQUESTED
  );
}

/**
 * Check if milestone can be accepted
 */
export function canAcceptMilestone(milestone: OrderMilestone): boolean {
  return milestone.status === MilestoneStatus.DELIVERED;
}

/**
 * Check if milestone is overdue
 */
export function isMilestoneOverdue(milestone: OrderMilestone): boolean {
  if (milestone.status === MilestoneStatus.ACCEPTED) {
    return false; // Accepted milestones can't be overdue
  }
  return new Date(milestone.dueDate) < new Date();
}

/**
 * Get next actionable milestone
 */
export function getNextMilestone(
  milestones: OrderMilestone[]
): OrderMilestone | null {
  // Sort by sequence
  const sorted = [...milestones].sort((a, b) => a.sequence - b.sequence);

  // Find first non-accepted milestone
  return sorted.find((m) => m.status !== MilestoneStatus.ACCEPTED) || null;
}

/**
 * Format milestone amount
 */
export function formatMilestoneAmount(
  amount: number,
  currency: string = 'TRY'
): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(amount);
}
