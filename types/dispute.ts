/**
 * Dispute System Types
 * Sprint 1: Order Dispute System
 */

/**
 * Dispute reason enum
 */
export enum DisputeReason {
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  DELIVERY_NOT_RECEIVED = 'DELIVERY_NOT_RECEIVED',
  INCOMPLETE_WORK = 'INCOMPLETE_WORK',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  COMMUNICATION_ISSUE = 'COMMUNICATION_ISSUE',
  DEADLINE_MISSED = 'DEADLINE_MISSED',
  UNAUTHORIZED_WORK = 'UNAUTHORIZED_WORK',
  OTHER = 'OTHER',
}

/**
 * Display names for dispute reasons
 */
export const disputeReasonLabels: Record<DisputeReason, string> = {
  [DisputeReason.QUALITY_ISSUE]: 'Kalite Sorunu',
  [DisputeReason.DELIVERY_NOT_RECEIVED]: 'Teslimat Alınmadı',
  [DisputeReason.INCOMPLETE_WORK]: 'Eksik İş',
  [DisputeReason.NOT_AS_DESCRIBED]: 'Açıklamaya Uygun Değil',
  [DisputeReason.COMMUNICATION_ISSUE]: 'İletişim Sorunu',
  [DisputeReason.DEADLINE_MISSED]: 'Termin Kaçırıldı',
  [DisputeReason.UNAUTHORIZED_WORK]: 'Yetkisiz İş',
  [DisputeReason.OTHER]: 'Diğer',
};

/**
 * Dispute status enum
 */
export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  AWAITING_BUYER_RESPONSE = 'AWAITING_BUYER_RESPONSE',
  AWAITING_SELLER_RESPONSE = 'AWAITING_SELLER_RESPONSE',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

/**
 * Display names for dispute statuses
 */
export const disputeStatusLabels: Record<DisputeStatus, string> = {
  [DisputeStatus.OPEN]: 'Açık',
  [DisputeStatus.UNDER_REVIEW]: 'İnceleniyor',
  [DisputeStatus.AWAITING_BUYER_RESPONSE]: 'Alıcı Yanıtı Bekleniyor',
  [DisputeStatus.AWAITING_SELLER_RESPONSE]: 'Satıcı Yanıtı Bekleniyor',
  [DisputeStatus.ESCALATED]: 'Yükseltildi',
  [DisputeStatus.RESOLVED]: 'Çözümlendi',
  [DisputeStatus.CLOSED]: 'Kapatıldı',
};

/**
 * Status colors for UI
 */
export const disputeStatusColors: Record<DisputeStatus, string> = {
  [DisputeStatus.OPEN]: 'bg-red-100 text-red-800',
  [DisputeStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
  [DisputeStatus.AWAITING_BUYER_RESPONSE]: 'bg-blue-100 text-blue-800',
  [DisputeStatus.AWAITING_SELLER_RESPONSE]: 'bg-purple-100 text-purple-800',
  [DisputeStatus.ESCALATED]: 'bg-orange-100 text-orange-800',
  [DisputeStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [DisputeStatus.CLOSED]: 'bg-gray-100 text-gray-800',
};

/**
 * Dispute resolution type enum
 */
export enum DisputeResolutionType {
  FAVOR_BUYER_FULL_REFUND = 'FAVOR_BUYER_FULL_REFUND',
  FAVOR_BUYER_PARTIAL_REFUND = 'FAVOR_BUYER_PARTIAL_REFUND',
  FAVOR_SELLER_NO_REFUND = 'FAVOR_SELLER_NO_REFUND',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
}

/**
 * Display names for resolution types
 */
export const disputeResolutionTypeLabels: Record<
  DisputeResolutionType,
  string
> = {
  [DisputeResolutionType.FAVOR_BUYER_FULL_REFUND]: 'Alıcı Lehine - Tam İade',
  [DisputeResolutionType.FAVOR_BUYER_PARTIAL_REFUND]:
    'Alıcı Lehine - Kısmi İade',
  [DisputeResolutionType.FAVOR_SELLER_NO_REFUND]: 'Satıcı Lehine - İade Yok',
  [DisputeResolutionType.MUTUAL_AGREEMENT]: 'Karşılıklı Anlaşma',
  [DisputeResolutionType.PARTIAL_REFUND]: 'Kısmi İade',
};

/**
 * Dispute request (for creating new dispute)
 */
export interface DisputeRequest {
  orderId: string;
  reason: DisputeReason;
  description: string;
  evidenceUrls?: string[];
}

/**
 * Dispute response
 */
export interface DisputeResponse {
  id: string;
  orderId: string;
  raisedByUserId: string;
  raisedByUserFullName: string;
  reason: DisputeReason;
  reasonDisplayName: string;
  status: DisputeStatus;
  description: string;
  evidenceUrls: string[];
  resolution: string | null;
  resolvedByUserId: string | null;
  resolvedByUserFullName: string | null;
  resolutionType: DisputeResolutionType | null;
  refundAmount: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

/**
 * Dispute resolution request (for admin to resolve dispute)
 */
export interface DisputeResolutionRequest {
  resolutionType: DisputeResolutionType;
  resolution: string;
  refundAmount?: number;
}

/**
 * Dispute statistics (for admin dashboard)
 */
export interface DisputeStatistics {
  openDisputesCount: number;
  averageResolutionTimeHours: number;
}

/**
 * Helper: Check if dispute is resolved
 */
export const isDisputeResolved = (dispute: DisputeResponse): boolean => {
  return dispute.status === DisputeStatus.RESOLVED;
};

/**
 * Helper: Check if dispute includes refund
 */
export const includesRefund = (
  resolutionType: DisputeResolutionType
): boolean => {
  return resolutionType !== DisputeResolutionType.FAVOR_SELLER_NO_REFUND;
};

/**
 * Helper: Check if dispute is open/active
 */
export const isDisputeActive = (status: DisputeStatus): boolean => {
  return status !== DisputeStatus.RESOLVED && status !== DisputeStatus.CLOSED;
};

// ==================== EXTENDED TYPES FOR FRONTEND ====================

/**
 * Dispute with order and user details (enriched for frontend)
 */
export interface DisputeWithDetails extends DisputeResponse {
  orderNumber?: string;
  packageTitle?: string;
  sellerName?: string;
  buyerName?: string;
}

/**
 * Dispute evidence file metadata
 */
export interface DisputeEvidence {
  id: string;
  disputeId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

/**
 * Dispute message for messaging thread
 */
export interface DisputeMessage {
  id: string;
  disputeId: string;
  userId: string;
  userFullName: string;
  userRole: 'BUYER' | 'SELLER' | 'ADMIN';
  message: string;
  attachments?: string[];
  createdAt: string;
}

// ==================== SPRINT 2: MESSAGING SYSTEM TYPES ====================

/**
 * Message role enum (matches backend)
 */
export enum MessageRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

/**
 * Dispute message response from backend (Sprint 1 Story 1.1)
 */
export interface DisputeMessageResponse {
  id: string;
  disputeId: string;
  senderId: string | null;
  senderFullName: string | null;
  senderRole: MessageRole;
  content: string;
  attachmentUrls: string[];
  isRead: boolean;
  isSystemMessage: boolean;
  createdAt: string;
}

/**
 * Dispute conversation response (includes metadata)
 */
export interface DisputeConversationResponse {
  messages: DisputeMessageResponse[];
  totalMessages: number;
  unreadCount: number;
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  content: string;
  attachmentUrls?: string[];
}

// ==================== END SPRINT 2 TYPES ====================

/**
 * Dispute filters for admin list
 */
export interface DisputeFilters {
  status?: DisputeStatus;
  reason?: DisputeReason;
  raisedByUserId?: string;
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: 'createdAt' | 'updatedAt' | 'resolvedAt';
  order?: 'asc' | 'desc';
}

/**
 * Dispute statistics for admin dashboard (extended)
 */
export interface DisputeStatisticsExtended extends DisputeStatistics {
  totalDisputes: number;
  openDisputes: number;
  inProgressDisputes: number;
  resolvedDisputes: number;
  rejectedDisputes: number;
  closedDisputes: number;
  resolutionRate: number;
  favorBuyerCount: number;
  favorSellerCount: number;
  mutualAgreementCount: number;
  reasonDistribution: Record<string, number>;
  topReasons: Array<{
    reason: DisputeReason;
    count: number;
    percentage: number;
  }>;
  disputesOverTime: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Create dispute form data (UI state)
 */
export interface CreateDisputeFormData {
  orderId: string;
  reason: DisputeReason;
  description: string;
  evidenceFiles?: File[];
}

// Use canonical PageResponse from backend-aligned types
export type { PageResponse } from './backend-aligned';

/**
 * Type guard: Check if resolution includes refund
 */
export const resolutionIncludesRefund = (
  resolution: DisputeResolutionRequest
): boolean => {
  return (
    resolution.resolutionType !== DisputeResolutionType.FAVOR_SELLER_NO_REFUND
  );
};
