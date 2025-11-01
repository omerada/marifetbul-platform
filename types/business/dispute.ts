/**
 * ================================================
 * DISPUTE TYPES
 * ================================================
 * Type definitions for dispute management system
 *
 * Sprint 4.1: Dispute System Integration
 * @version 1.0.0
 */

// ================================================
// ENUMS
// ================================================

export enum DisputeType {
  CHARGEBACK = 'CHARGEBACK',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  DELIVERY_ISSUE = 'DELIVERY_ISSUE',
  COMMUNICATION_ISSUE = 'COMMUNICATION_ISSUE',
  SCOPE_DISAGREEMENT = 'SCOPE_DISAGREEMENT',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

export enum DisputeResolution {
  BUYER_FAVOR = 'BUYER_FAVOR',
  SELLER_FAVOR = 'SELLER_FAVOR',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
  DISMISSED = 'DISMISSED',
}

export enum DisputePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// ================================================
// INTERFACES
// ================================================

export interface DisputeParticipant {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER';
  avatar?: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  type: DisputeType;
  status: DisputeStatus;
  priority: DisputePriority;
  reason: string;
  description: string;
  disputeAmount: number;
  currency: string;

  // Participants
  reportedBy: DisputeParticipant;
  reportedAgainst: DisputeParticipant;

  // Resolution
  resolvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  resolutionAmount?: number;
  resolvedAt?: string;

  // Escalation
  escalatedAt?: string;
  escalationReason?: string;

  // Escrow
  escrowHeld: boolean;
  escrowAmount?: number;

  // Evidence
  evidenceUrls: string[];
  attachments: DisputeAttachment[];

  // Timeline
  createdAt: string;
  updatedAt: string;

  // Metadata
  orderDetails?: {
    packageName: string;
    packagePrice: number;
    deliveryDate?: string;
  };
}

export interface DisputeAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DisputeTimeline {
  id: string;
  disputeId: string;
  action: string;
  description: string;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ================================================
// API REQUEST/RESPONSE TYPES
// ================================================

export interface CreateDisputeRequest {
  orderId: string;
  type: DisputeType;
  reason: string;
  description: string;
  disputeAmount?: number;
  evidenceUrls?: string[];
}

export interface ResolveDisputeRequest {
  resolution: DisputeResolution;
  resolutionNotes: string;
  resolutionAmount?: number;
  notifyParties: boolean;
}

export interface EscalateDisputeRequest {
  reason: string;
  priority?: DisputePriority;
}

export interface DisputeFilters {
  status?: DisputeStatus;
  type?: DisputeType;
  priority?: DisputePriority;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

export interface DisputesResponse {
  disputes: Dispute[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface DisputeStatsResponse {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  escalated: number;
  avgResolutionTime: number; // hours
  totalDisputeAmount: number;
  resolvedThisMonth: number;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

export const getDisputeTypeLabel = (type: DisputeType): string => {
  const labels: Record<DisputeType, string> = {
    CHARGEBACK: 'Chargeback',
    QUALITY_ISSUE: 'Quality Issue',
    DELIVERY_ISSUE: 'Delivery Issue',
    COMMUNICATION_ISSUE: 'Communication Issue',
    SCOPE_DISAGREEMENT: 'Scope Disagreement',
    PAYMENT_ISSUE: 'Payment Issue',
    OTHER: 'Other',
  };
  return labels[type];
};

export const getDisputeStatusLabel = (status: DisputeStatus): string => {
  const labels: Record<DisputeStatus, string> = {
    PENDING: 'Pending',
    IN_REVIEW: 'In Review',
    RESOLVED: 'Resolved',
    ESCALATED: 'Escalated',
    CLOSED: 'Closed',
  };
  return labels[status];
};

export const getDisputeResolutionLabel = (
  resolution: DisputeResolution
): string => {
  const labels: Record<DisputeResolution, string> = {
    BUYER_FAVOR: 'Buyer Favor',
    SELLER_FAVOR: 'Seller Favor',
    PARTIAL_REFUND: 'Partial Refund',
    MUTUAL_AGREEMENT: 'Mutual Agreement',
    DISMISSED: 'Dismissed',
  };
  return labels[resolution];
};

export const getDisputePriorityColor = (priority: DisputePriority): string => {
  const colors: Record<DisputePriority, string> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  };
  return colors[priority];
};

export const getDisputeStatusColor = (status: DisputeStatus): string => {
  const colors: Record<DisputeStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_REVIEW: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-green-100 text-green-700',
    ESCALATED: 'bg-red-100 text-red-700',
    CLOSED: 'bg-gray-100 text-gray-700',
  };
  return colors[status];
};
