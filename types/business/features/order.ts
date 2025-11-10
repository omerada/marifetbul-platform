/**
 * ================================================
 * ORDER TYPES - BACKEND ALIGNED
 * ================================================
 * Complete type definitions matching Spring Boot backend DTOs
 *
 * Backend Source:
 * - OrderResponse.java: com.marifetbul.api.domain.order.dto.OrderResponse
 * - OrderStatus.java: com.marifetbul.api.domain.order.entity.OrderStatus
 * - OrderType.java: com.marifetbul.api.domain.order.entity.OrderType
 * - PaymentMode.java: com.marifetbul.api.domain.order.entity.PaymentMode
 *
 * @version 2.1.0 - Dual Payment System
 * @author MarifetBul Development Team
 * @created Sprint 1 - Story 7 (Type Alignment)
 * @updated Sprint X - Dual Payment System
 */

// ================================================
// ENUMS
// ================================================

/**
 * Package Tier Enum (also defined in package.ts)
 */
export enum PackageTier {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

/**
 * Payment Mode Enum
 * Backend: com.marifetbul.api.domain.order.entity.PaymentMode
 * 
 * @since Sprint X - Dual Payment System
 */
export enum PaymentMode {
  /** Platform-managed escrow via iyzico payment gateway */
  ESCROW_PROTECTED = 'ESCROW_PROTECTED',
  /** Direct bank transfer with dual confirmation */
  MANUAL_IBAN = 'MANUAL_IBAN',
}

/**
 * Order Type Enum
 * Backend: com.marifetbul.api.domain.order.entity.OrderType
 */
export enum OrderType {
  /** Order created from a package */
  PACKAGE_ORDER = 'PACKAGE_ORDER',
  /** Order created from a job posting */
  JOB_ORDER = 'JOB_ORDER',
  /** Custom order negotiated between buyer and seller */
  CUSTOM_ORDER = 'CUSTOM_ORDER',
}

/**
 * Order Status Enum - CRITICAL: Must match backend exactly
 * Backend: com.marifetbul.api.domain.order.entity.OrderStatus
 */
export enum OrderStatus {
  /** Order created but payment not completed */
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  /** Payment completed, waiting for seller to accept */
  PAID = 'PAID',
  /** Seller accepted the order and started working */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Order is under review (quality check) */
  IN_REVIEW = 'IN_REVIEW',
  /** Seller submitted the delivery */
  DELIVERED = 'DELIVERED',
  /** Order completed successfully */
  COMPLETED = 'COMPLETED',
  /** Order canceled */
  CANCELED = 'CANCELED',
  /** Payment refunded */
  REFUNDED = 'REFUNDED',
  /** Order in dispute */
  DISPUTED = 'DISPUTED',
}

/**
 * Order Cancellation Reason Enum
 * Backend: com.marifetbul.api.domain.order.entity.OrderCancellationReason
 */
export enum OrderCancellationReason {
  BUYER_REQUEST = 'BUYER_REQUEST',
  SELLER_UNAVAILABLE = 'SELLER_UNAVAILABLE',
  REQUIREMENTS_UNCLEAR = 'REQUIREMENTS_UNCLEAR',
  PRICE_DISAGREEMENT = 'PRICE_DISAGREEMENT',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
  ADMIN_DECISION = 'ADMIN_DECISION',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  OTHER = 'OTHER',
}

/**
 * Currency Enum
 */
export enum Currency {
  TRY = 'TRY',
}

// ================================================
// MAIN ORDER INTERFACE
// ================================================

/**
 * Complete Order Details
 * Backend: OrderResponse.java
 *
 * This interface matches the backend DTO exactly for type safety
 */
export interface Order {
  // ==================== Identity ====================
  /** Order UUID */
  id: string;
  /** Order number (format: ORD-YYYYMMDD-XXXXX) */
  orderNumber: string;
  /** Order type */
  type: OrderType;
  /** Current order status */
  status: OrderStatus;
  /** Payment mode (escrow vs manual IBAN) */
  paymentMode: PaymentMode;

  // ==================== Parties ====================
  /** Buyer (employer) UUID */
  buyerId: string;
  /** Buyer full name */
  buyerName: string;
  /** Seller (freelancer) UUID */
  sellerId: string;
  /** Seller full name */
  sellerName: string;

  // ==================== Related Entities ====================
  /** Job UUID (if JOB_ORDER) */
  jobId: string | null;
  /** Job title (if JOB_ORDER) */
  jobTitle: string | null;
  /** Package UUID (if PACKAGE_ORDER) */
  packageId: string | null;
  /** Package title (if PACKAGE_ORDER) */
  packageTitle: string | null;
  /** Payment UUID */
  paymentId: string | null;

  // ==================== Financial ====================
  /** Total order amount */
  totalAmount: number;
  /** Platform commission fee */
  platformFee: number;
  /** Net amount for seller (totalAmount - platformFee) */
  netAmount: number;
  /** Currency code */
  currency: string;

  // ==================== Order Details ====================
  /** Order requirements/description */
  requirements: string | null;
  /** Deliverables description */
  deliverables: string | null;
  /** Seller's delivery note */
  deliveryNote: string | null;
  /** Additional notes */
  notes: string | null;
  /** Delivery deadline */
  deadline: string; // ISO 8601 datetime

  // ==================== Revision System ====================
  /** Current revision count */
  revisionCount: number;
  /** Maximum allowed revisions */
  maxRevisions: number;

  // ==================== Timestamps ====================
  /** When order was placed (created) */
  orderedAt: string; // ISO 8601 datetime
  /** When seller accepted the order */
  acceptedAt: string | null;
  /** When seller started working */
  startedAt: string | null;
  /** When delivery was submitted */
  deliveredAt: string | null;
  /** When buyer approved delivery */
  approvedAt: string | null;
  /** When order was completed */
  completedAt: string | null;
  /** When order was canceled */
  canceledAt: string | null;
  /** Created timestamp */
  createdAt: string; // ISO 8601 datetime
  /** Last updated timestamp */
  updatedAt: string; // ISO 8601 datetime

  // ==================== Cancellation ====================
  /** Cancellation reason (if canceled) */
  cancellationReason: OrderCancellationReason | null;
  /** Cancellation note/explanation */
  cancellationNote: string | null;

  // ==================== Computed Fields ====================
  /** Remaining hours until deadline */
  remainingHours: number | null;
  /** Order age in days */
  orderAgeDays: number | null;
  /** Can this order be canceled? */
  canCancel: boolean;
  /** Can this order be completed? */
  canComplete: boolean;
  /** Is order overdue? */
  isOverdue: boolean;
  /** Is order active? */
  isActive: boolean;
}

/**
 * Order Summary - For list views
 * Backend: OrderSummaryResponse.java
 */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  packageTitle: string | null;
  jobTitle: string | null;
  buyerName: string;
  sellerName: string;
  totalAmount: number;
  currency: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// ================================================
// REQUEST/RESPONSE TYPES
// ================================================

/**
 * Create Order Request
 * Backend: CreateOrderRequest.java (base), CreatePackageOrderRequest.java
 */
export interface CreateOrderRequest {
  /** Package UUID (required for PACKAGE_ORDER) */
  packageId: string;
  /** Package tier (BASIC, STANDARD, PREMIUM) */
  tier: PackageTier;
  /** Payment mode */
  paymentMode: PaymentMode;
  /** Order requirements/description */
  requirements: string;
  /** Custom requirements (optional) */
  customizations?: string;
}

/**
 * Create Job Order Request
 * Backend: CreateJobOrderRequest.java
 * 
 * @since Sprint X - Dual Payment System
 */
export interface CreateJobOrderRequest {
  /** Job UUID */
  jobId: string;
  /** Seller (freelancer) UUID */
  sellerId: string;
  /** Payment mode */
  paymentMode: PaymentMode;
  /** Order amount */
  amount: number;
  /** Order requirements */
  requirements: string;
  /** Delivery deadline */
  deadline: string; // ISO 8601 datetime
  /** Additional notes (optional) */
  notes?: string;
}

/**
 * Create Package Order Request
 * Backend: CreatePackageOrderRequest.java
 * 
 * @since Sprint X - Dual Payment System
 */
export interface CreatePackageOrderRequest {
  /** Package UUID */
  packageId: string;
  /** Payment mode */
  paymentMode: PaymentMode;
  /** Order amount */
  amount: number;
  /** Package customizations (optional) */
  customizations?: string;
  /** Delivery deadline */
  deadline: string; // ISO 8601 datetime
  /** Additional notes (optional) */
  notes?: string;
}

/**
 * Submit Delivery Request
 * Backend: SubmitDeliveryRequest.java
 */
export interface SubmitDeliveryRequest {
  /** Delivery note explaining the work */
  deliveryNote: string;
  /** Array of file URLs (uploaded to cloud storage) */
  attachments: string[];
}

/**
 * Request Revision Request
 * Backend: RequestRevisionRequest.java
 */
export interface RequestRevisionRequest {
  /** Revision requirements explaining what needs to be fixed */
  revisionNote: string;
}

/**
 * Cancel Order Request
 * Backend: CancelOrderRequest.java
 */
export interface CancelOrderRequest {
  /** Cancellation reason */
  reason: OrderCancellationReason;
  /** Additional explanation (optional) */
  note?: string;
}

/**
 * Approve Delivery Request
 * Backend: ApproveDeliveryRequest.java
 */
export interface ApproveDeliveryRequest {
  /** Optional feedback for the seller */
  feedback?: string;
}

// ================================================
// ORDER TIMELINE & ACTIVITY
// ================================================

/**
 * Order Timeline Event
 */
export interface OrderTimelineEvent {
  id: string;
  type: OrderEventType;
  title: string;
  description: string;
  performedBy: {
    id: string;
    name: string;
    avatar?: string;
    role: 'buyer' | 'seller' | 'system' | 'admin';
  };
  timestamp: string; // ISO 8601
  metadata?: Record<string, unknown>;
}

/**
 * Order Event Type
 */
export enum OrderEventType {
  CREATED = 'CREATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  ACCEPTED = 'ACCEPTED',
  STARTED = 'STARTED',
  DELIVERED = 'DELIVERED',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  REVISION_SUBMITTED = 'REVISION_SUBMITTED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  FILE_UPLOADED = 'FILE_UPLOADED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
}

// ================================================
// WEBSOCKET ORDER UPDATES
// ================================================

/**
 * WebSocket Order Update Message Types
 * These are sent over WebSocket when order status changes
 */
export enum OrderWebSocketEventType {
  /** Order has been delivered by freelancer */
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  /** Order delivery accepted by buyer */
  ORDER_ACCEPTED = 'ORDER_ACCEPTED',
  /** Buyer requested revision */
  ORDER_REVISION_REQUESTED = 'ORDER_REVISION_REQUESTED',
  /** Order completed successfully */
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  /** Order status changed (generic) */
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  /** Order updated (any field changed) */
  ORDER_UPDATED = 'ORDER_UPDATED',
  /** Order canceled */
  ORDER_CANCELED = 'ORDER_CANCELED',
  /** New message in order conversation */
  ORDER_MESSAGE = 'ORDER_MESSAGE',
}

/**
 * WebSocket Order Update Payload
 */
export interface OrderWebSocketUpdate<T = unknown> {
  /** Event type */
  type: OrderWebSocketEventType;
  /** Order ID */
  orderId: string;
  /** Update data */
  data: T;
  /** Timestamp of event */
  timestamp: string;
  /** Optional message for user */
  message?: string;
}

/**
 * Order Status Changed Event Data
 */
export interface OrderStatusChangedData {
  /** Previous status */
  previousStatus: OrderStatus;
  /** New status */
  newStatus: OrderStatus;
  /** Full updated order */
  order: Order;
  /** Who triggered the change */
  triggeredBy: {
    id: string;
    name: string;
    role: 'buyer' | 'seller';
  };
}

/**
 * Order Delivered Event Data
 */
export interface OrderDeliveredData {
  /** Delivery note */
  deliveryNote: string;
  /** Attachment URLs */
  attachments: string[];
  /** Delivery timestamp */
  deliveredAt: string;
  /** Freelancer info */
  deliveredBy: {
    id: string;
    name: string;
  };
}

/**
 * Order Accepted Event Data
 */
export interface OrderAcceptedData {
  /** Optional feedback from buyer */
  feedback?: string;
  /** Acceptance timestamp */
  acceptedAt: string;
  /** Buyer info */
  acceptedBy: {
    id: string;
    name: string;
  };
  /** Payment released amount */
  paymentReleased: number;
}

/**
 * Revision Requested Event Data
 */
export interface RevisionRequestedData {
  /** Revision requirements */
  revisionNote: string;
  /** Current revision count */
  revisionCount: number;
  /** Max revisions allowed */
  maxRevisions: number;
  /** Request timestamp */
  requestedAt: string;
  /** Buyer info */
  requestedBy: {
    id: string;
    name: string;
  };
}

// ================================================
// ORDER STATISTICS
// ================================================

/**
 * Order Statistics (for dashboards)
 */
export interface OrderStatistics {
  /** Total number of orders */
  total: number;
  /** Active orders (PAID, IN_PROGRESS, DELIVERED) */
  active: number;
  /** Completed orders */
  completed: number;
  /** Canceled orders */
  canceled: number;
  /** Total revenue */
  totalRevenue: number;
  /** Average order value */
  averageOrderValue: number;
  /** Completion rate (percentage) */
  completionRate: number;
  /** Average delivery time in days */
  averageDeliveryTime: number;
  currency: string;
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * Order Status Display Metadata
 */
export interface OrderStatusMetadata {
  status: OrderStatus;
  label: string;
  color: 'gray' | 'blue' | 'yellow' | 'green' | 'red' | 'purple';
  icon: string;
  description: string;
}

/**
 * Order status display metadata
 */
export const ORDER_STATUS_METADATA: Record<OrderStatus, OrderStatusMetadata> = {
  [OrderStatus.PENDING_PAYMENT]: {
    status: OrderStatus.PENDING_PAYMENT,
    label: 'Ödeme Bekleniyor',
    color: 'gray',
    icon: 'clock',
    description: 'Sipariş oluşturuldu, ödeme bekleniyor',
  },
  [OrderStatus.PAID]: {
    status: OrderStatus.PAID,
    label: 'Ödendi',
    color: 'blue',
    icon: 'check-circle',
    description: 'Ödeme alındı, satıcı kabulü bekleniyor',
  },
  [OrderStatus.IN_PROGRESS]: {
    status: OrderStatus.IN_PROGRESS,
    label: 'Devam Ediyor',
    color: 'yellow',
    icon: 'loader',
    description: 'Satıcı çalışmaya başladı',
  },
  [OrderStatus.IN_REVIEW]: {
    status: OrderStatus.IN_REVIEW,
    label: 'İncelemede',
    color: 'purple',
    icon: 'eye',
    description: 'Kalite kontrolü yapılıyor',
  },
  [OrderStatus.DELIVERED]: {
    status: OrderStatus.DELIVERED,
    label: 'Teslim Edildi',
    color: 'blue',
    icon: 'package',
    description: 'Teslimat yapıldı, alıcı onayı bekleniyor',
  },
  [OrderStatus.COMPLETED]: {
    status: OrderStatus.COMPLETED,
    label: 'Tamamlandı',
    color: 'green',
    icon: 'check',
    description: 'Sipariş başarıyla tamamlandı',
  },
  [OrderStatus.CANCELED]: {
    status: OrderStatus.CANCELED,
    label: 'İptal Edildi',
    color: 'red',
    icon: 'x',
    description: 'Sipariş iptal edildi',
  },
  [OrderStatus.REFUNDED]: {
    status: OrderStatus.REFUNDED,
    label: 'İade Edildi',
    color: 'red',
    icon: 'arrow-left',
    description: 'Ödeme iade edildi',
  },
  [OrderStatus.DISPUTED]: {
    status: OrderStatus.DISPUTED,
    label: 'İhtilaf',
    color: 'red',
    icon: 'alert-triangle',
    description: 'Sipariş ihtilaf sürecinde',
  },
};

/**
 * Order cancellation reason display metadata
 */
export const ORDER_CANCELLATION_REASON_LABELS: Record<
  OrderCancellationReason,
  string
> = {
  [OrderCancellationReason.BUYER_REQUEST]: 'Alıcı Talebi',
  [OrderCancellationReason.SELLER_UNAVAILABLE]: 'Satıcı Müsait Değil',
  [OrderCancellationReason.REQUIREMENTS_UNCLEAR]: 'Gereksinimler Net Değil',
  [OrderCancellationReason.PRICE_DISAGREEMENT]: 'Fiyat Anlaşmazlığı',
  [OrderCancellationReason.MUTUAL_AGREEMENT]: 'Karşılıklı Anlaşma',
  [OrderCancellationReason.ADMIN_DECISION]: 'Admin Kararı',
  [OrderCancellationReason.PAYMENT_ISSUE]: 'Ödeme Sorunu',
  [OrderCancellationReason.OTHER]: 'Diğer',
};

/**
 * Check if order status is active
 */
export function isOrderActive(status: OrderStatus): boolean {
  return [
    OrderStatus.PAID,
    OrderStatus.IN_PROGRESS,
    OrderStatus.IN_REVIEW,
    OrderStatus.DELIVERED,
    OrderStatus.DISPUTED,
  ].includes(status);
}

/**
 * Check if order status is terminal (cannot transition)
 */
export function isOrderTerminal(status: OrderStatus): boolean {
  return [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELED,
    OrderStatus.REFUNDED,
  ].includes(status);
}

/**
 * Check if order can be canceled in current status
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
    OrderStatus.IN_PROGRESS,
  ].includes(status);
}

/**
 * Check if revision can be requested in current status
 */
export function canRequestRevision(
  status: OrderStatus,
  revisionCount: number,
  maxRevisions: number
): boolean {
  return status === OrderStatus.DELIVERED && revisionCount < maxRevisions;
}

/**
 * Get refund percentage based on order status
 */
export function getRefundPercentage(status: OrderStatus): number {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
    case OrderStatus.PAID:
      return 100;
    case OrderStatus.IN_PROGRESS:
      return 50;
    default:
      return 0;
  }
}

// ================================================
// RE-EXPORTS (for convenience)
// ================================================

// Note: Interfaces are already exported above
// This section is for documentation purposes
