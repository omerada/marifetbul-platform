/**
 * ================================================
 * ORDER VALIDATION SCHEMAS
 * ================================================
 * Runtime validation schemas using Zod for type-safe API responses.
 *
 * This file contains:
 * - Enum schemas matching backend exactly
 * - Order request/response validation
 * - Helper validation functions
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 3: Backend Alignment
 */

import { z } from 'zod';
import { ValidationError } from '../errors';

// ================================================
// ENUM SCHEMAS
// ================================================

/**
 * Order status enum schema (backend-aligned)
 * Matches: com.marifetbul.backend.order.OrderStatus
 */
export const OrderStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'PAID',
  'IN_PROGRESS',
  'DELIVERED',
  'COMPLETED',
  'CANCELED',
  'REFUNDED',
  'DISPUTED',
  'IN_REVIEW',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

/**
 * Order type enum schema
 */
export const OrderTypeSchema = z.enum([
  'PACKAGE_ORDER',
  'JOB_ORDER',
  'CUSTOM_ORDER',
]);

export type OrderType = z.infer<typeof OrderTypeSchema>;

/**
 * Order cancellation reason enum schema
 */
export const OrderCancellationReasonSchema = z.enum([
  'BUYER_REQUEST',
  'SELLER_UNAVAILABLE',
  'REQUIREMENTS_NOT_MET',
  'PAYMENT_ISSUE',
  'MUTUAL_AGREEMENT',
  'FRAUD_SUSPECTED',
  'TERMS_VIOLATION',
  'OTHER',
]);

export type OrderCancellationReason = z.infer<
  typeof OrderCancellationReasonSchema
>;

/**
 * Package tier enum schema
 */
export const PackageTierSchema = z.enum(['BASIC', 'STANDARD', 'PREMIUM']);

export type PackageTier = z.infer<typeof PackageTierSchema>;

/**
 * Order payment status enum schema
 */
export const OrderPaymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);

export type OrderPaymentStatus = z.infer<typeof OrderPaymentStatusSchema>;

/**
 * Delivery status enum schema
 */
export const DeliveryStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'REVISION_REQUESTED',
  'APPROVED',
]);

export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

// ================================================
// NESTED OBJECT SCHEMAS
// ================================================

/**
 * Package details schema
 */
export const PackageDetailsSchema = z.object({
  packageId: z.string().uuid(),
  packageTitle: z.string(),
  tier: PackageTierSchema,
  originalPrice: z.number().min(0),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  revisionLimit: z.number().int().min(0),
  deliveryDays: z.number().int().min(1),
});

export type PackageDetails = z.infer<typeof PackageDetailsSchema>;

/**
 * Seller details schema
 */
export const SellerDetailsSchema = z.object({
  sellerId: z.string().uuid(),
  username: z.string(),
  fullName: z.string(),
  profilePictureUrl: z.string().url().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  completedOrders: z.number().int().min(0).optional(),
});

export type SellerDetails = z.infer<typeof SellerDetailsSchema>;

/**
 * Buyer details schema
 */
export const BuyerDetailsSchema = z.object({
  buyerId: z.string().uuid(),
  username: z.string(),
  fullName: z.string(),
  profilePictureUrl: z.string().url().nullable().optional(),
});

export type BuyerDetails = z.infer<typeof BuyerDetailsSchema>;

/**
 * Financial details schema
 */
export const FinancialDetailsSchema = z.object({
  subtotal: z.number().min(0),
  serviceFee: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).optional(),
  total: z.number().min(0),
  sellerEarnings: z.number().min(0),
  currency: z.string().default('TRY'),
});

export type FinancialDetails = z.infer<typeof FinancialDetailsSchema>;

/**
 * Delivery details schema
 */
export const DeliveryDetailsSchema = z.object({
  deliveryNote: z.string().nullable().optional(),
  attachments: z.array(z.string().url()).optional(),
  submittedAt: z.string().datetime().nullable().optional(),
  approvedAt: z.string().datetime().nullable().optional(),
  revisionNote: z.string().nullable().optional(),
  revisionRequestedAt: z.string().datetime().nullable().optional(),
});

export type DeliveryDetails = z.infer<typeof DeliveryDetailsSchema>;

/**
 * Timeline event schema
 */
export const OrderTimelineEventSchema = z.object({
  eventType: z.string(),
  description: z.string(),
  actorId: z.string().uuid().nullable().optional(),
  actorName: z.string().nullable().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

export type OrderTimelineEvent = z.infer<typeof OrderTimelineEventSchema>;

/**
 * Cancellation details schema
 */
export const CancellationDetailsSchema = z.object({
  reason: OrderCancellationReasonSchema,
  note: z.string().nullable().optional(),
  canceledBy: z.string().uuid(),
  canceledAt: z.string().datetime(),
  refundAmount: z.number().min(0).optional(),
  refundStatus: OrderPaymentStatusSchema.optional(),
});

export type CancellationDetails = z.infer<typeof CancellationDetailsSchema>;

/**
 * Revision tracking schema
 */
export const RevisionTrackingSchema = z.object({
  revisionsUsed: z.number().int().min(0),
  revisionsRemaining: z.number().int().min(0),
  revisionLimit: z.number().int().min(0),
  canRequestRevision: z.boolean(),
});

export type RevisionTracking = z.infer<typeof RevisionTrackingSchema>;

// ================================================
// MAIN ORDER SCHEMAS
// ================================================

/**
 * Complete Order schema (backend-aligned)
 * Matches: com.marifetbul.backend.order.dto.OrderResponse
 */
export const OrderSchema = z.object({
  // Basic Info
  id: z.string().uuid(),
  orderNumber: z.string(),
  type: OrderTypeSchema,
  status: OrderStatusSchema,

  // Parties
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  buyer: BuyerDetailsSchema.optional(),
  seller: SellerDetailsSchema.optional(),

  // Package Details
  packageDetails: PackageDetailsSchema.nullable().optional(),
  customDescription: z.string().nullable().optional(),

  // Requirements
  requirements: z.string().nullable().optional(),
  requirementsSubmittedAt: z.string().datetime().nullable().optional(),

  // Financial
  financials: FinancialDetailsSchema,
  paymentStatus: OrderPaymentStatusSchema,
  paymentId: z.string().uuid().nullable().optional(),

  // Delivery
  deliveryStatus: DeliveryStatusSchema,
  delivery: DeliveryDetailsSchema.nullable().optional(),

  // Timeline
  deadline: z.string().datetime().nullable().optional(),
  estimatedDelivery: z.string().datetime().nullable().optional(),
  actualDeliveryDate: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),

  // Revisions
  revisions: RevisionTrackingSchema.optional(),

  // Cancellation
  cancellation: CancellationDetailsSchema.nullable().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Timeline Events
  timeline: z.array(OrderTimelineEventSchema).optional(),

  // Action Flags
  canCancel: z.boolean().optional(),
  canComplete: z.boolean().optional(),
  canRequestRevision: z.boolean().optional(),
  canSubmitDelivery: z.boolean().optional(),
  canApproveDelivery: z.boolean().optional(),
});

export type Order = z.infer<typeof OrderSchema>;

/**
 * Order summary schema (for list views)
 */
export const OrderSummarySchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  type: OrderTypeSchema,
  status: OrderStatusSchema,
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  buyer: BuyerDetailsSchema.optional(),
  seller: SellerDetailsSchema.optional(),
  packageDetails: PackageDetailsSchema.nullable().optional(),
  financials: FinancialDetailsSchema,
  deliveryStatus: DeliveryStatusSchema,
  deadline: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type OrderSummary = z.infer<typeof OrderSummarySchema>;

// ================================================
// REQUEST SCHEMAS
// ================================================

/**
 * Create package order request schema
 */
export const CreatePackageOrderRequestSchema = z.object({
  packageId: z.string().uuid(),
  tier: PackageTierSchema,
  requirements: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePackageOrderRequest = z.infer<
  typeof CreatePackageOrderRequestSchema
>;

/**
 * Create custom order request schema
 */
export const CreateCustomOrderRequestSchema = z.object({
  sellerId: z.string().uuid(),
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  amount: z.number().min(1),
  requirements: z.string().optional(),
  deadline: z.string().datetime(),
});

export type CreateCustomOrderRequest = z.infer<
  typeof CreateCustomOrderRequestSchema
>;

/**
 * Submit delivery request schema
 */
export const SubmitDeliveryRequestSchema = z.object({
  deliveryNote: z.string().min(10).max(2000),
  attachments: z.array(z.string().url()).max(10).optional(),
});

export type SubmitDeliveryRequest = z.infer<typeof SubmitDeliveryRequestSchema>;

/**
 * Request revision request schema
 */
export const RequestRevisionRequestSchema = z.object({
  revisionNote: z.string().min(10).max(2000),
});

export type RequestRevisionRequest = z.infer<
  typeof RequestRevisionRequestSchema
>;

/**
 * Cancel order request schema
 */
export const CancelOrderRequestSchema = z.object({
  reason: OrderCancellationReasonSchema,
  note: z.string().max(1000).optional(),
});

export type CancelOrderRequest = z.infer<typeof CancelOrderRequestSchema>;

/**
 * Order list filters schema
 */
export const OrderListFiltersSchema = z.object({
  status: z.array(OrderStatusSchema).optional(),
  type: z.array(OrderTypeSchema).optional(),
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'deadline', 'totalAmount']).default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export type OrderListFilters = z.infer<typeof OrderListFiltersSchema>;

// ================================================
// RESPONSE SCHEMAS
// ================================================

/**
 * Order statistics schema
 */
export const OrderStatisticsSchema = z.object({
  totalOrders: z.number().int().min(0),
  activeOrders: z.number().int().min(0),
  completedOrders: z.number().int().min(0),
  canceledOrders: z.number().int().min(0),
  totalRevenue: z.number().min(0),
  averageOrderValue: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  onTimeDeliveryRate: z.number().min(0).max(100),
});

export type OrderStatistics = z.infer<typeof OrderStatisticsSchema>;

/**
 * Paginated orders response schema
 */
export const PagedOrdersResponseSchema = z.object({
  content: z.array(OrderSummarySchema),
  page: z.number().int().min(0),
  size: z.number().int().min(1),
  totalElements: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  last: z.boolean(),
  first: z.boolean(),
});

export type PagedOrdersResponse = z.infer<typeof PagedOrdersResponseSchema>;

// ================================================
// VALIDATION HELPERS
// ================================================

/**
 * Validates order data against schema
 * @throws {ValidationError} If validation fails
 */
export function validateOrder(data: unknown): Order {
  try {
    return OrderSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};

      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      throw new ValidationError(
        'Sipariş doğrulaması başarısız oldu',
        fieldErrors
      );
    }
    throw error;
  }
}

/**
 * Validates order data and returns null on failure (non-throwing)
 */
export function validateOrderSafe(data: unknown): Order | null {
  const result = OrderSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validates order summary data
 * @throws {ValidationError} If validation fails
 */
export function validateOrderSummary(data: unknown): OrderSummary {
  try {
    return OrderSummarySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};

      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      throw new ValidationError(
        'Sipariş özeti doğrulaması başarısız oldu',
        fieldErrors
      );
    }
    throw error;
  }
}

/**
 * Validates paged orders response
 * @throws {ValidationError} If validation fails
 */
export function validatePagedOrders(data: unknown): PagedOrdersResponse {
  try {
    return PagedOrdersResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};

      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      throw new ValidationError(
        'Sayfalı sipariş listesi doğrulaması başarısız oldu',
        fieldErrors
      );
    }
    throw error;
  }
}

/**
 * Validates create package order request
 * @throws {ValidationError} If validation fails
 */
export function validateCreatePackageOrderRequest(
  data: unknown
): CreatePackageOrderRequest {
  try {
    return CreatePackageOrderRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};

      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      throw new ValidationError(
        'Paket sipariş oluşturma doğrulaması başarısız oldu',
        fieldErrors
      );
    }
    throw error;
  }
}

/**
 * Validates create custom order request
 * @throws {ValidationError} If validation fails
 */
export function validateCreateCustomOrderRequest(
  data: unknown
): CreateCustomOrderRequest {
  try {
    return CreateCustomOrderRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};

      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      throw new ValidationError(
        'Özel sipariş oluşturma doğrulaması başarısız oldu',
        fieldErrors
      );
    }
    throw error;
  }
}

// ================================================
// TYPE GUARDS
// ================================================

/**
 * Type guard for Order
 */
export function isOrder(data: unknown): data is Order {
  return OrderSchema.safeParse(data).success;
}

/**
 * Type guard for OrderSummary
 */
export function isOrderSummary(data: unknown): data is OrderSummary {
  return OrderSummarySchema.safeParse(data).success;
}

/**
 * Check if order status is terminal (no further state changes)
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return ['COMPLETED', 'CANCELED', 'REFUNDED'].includes(status);
}

/**
 * Check if order is in active state (work in progress)
 */
export function isActiveStatus(status: OrderStatus): boolean {
  return ['PAID', 'IN_PROGRESS', 'DELIVERED', 'IN_REVIEW'].includes(status);
}

/**
 * Check if order is awaiting payment
 */
export function isAwaitingPayment(status: OrderStatus): boolean {
  return status === 'PENDING_PAYMENT';
}

/**
 * Check if order is in dispute
 */
export function isDisputed(status: OrderStatus): boolean {
  return status === 'DISPUTED';
}
