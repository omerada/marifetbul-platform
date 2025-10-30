/**
 * ================================================
 * BACKEND-ALIGNED TYPE DEFINITIONS
 * ================================================
 * Type definitions matching Spring Boot backend DTOs exactly
 * Version: 2.0.0 - Production Ready
 * Author: MarifetBul Development Team
 */

// ================================================
// COMMON TYPES
// ================================================

/**
 * Standard API Response wrapper (matches backend ApiResponse<T>)
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ErrorDetail;
  timestamp?: string;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Paginated Response (matches Spring Data Page)
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

// ================================================
// ORDER TYPES (OrderResponse.java)
// ================================================

export type OrderType = 'PACKAGE_ORDER' | 'JOB_ORDER' | 'CUSTOM_ORDER';

/**
 * Order Status (matches OrderStatus.java enum)
 * Backend: com.marifetbul.api.domain.order.entity.OrderStatus
 */
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'REFUNDED'
  | 'DISPUTED';

export type OrderCancellationReason =
  | 'BUYER_REQUEST'
  | 'SELLER_UNAVAILABLE'
  | 'REQUIREMENTS_NOT_MET'
  | 'PAYMENT_ISSUE'
  | 'MUTUAL_AGREEMENT'
  | 'FRAUD_SUSPECTED'
  | 'TERMS_VIOLATION'
  | 'OTHER';

export type PackageTier = 'BASIC' | 'STANDARD' | 'PREMIUM';

export type OrderPaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type DeliveryStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'APPROVED';

/**
 * Order Response (matches OrderResponse.java)
 */
export interface OrderResponse {
  // Identifiers
  id: string; // UUID
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;

  // Participants
  buyerId: string; // UUID
  buyerName: string;
  sellerId: string; // UUID
  sellerName: string;

  // Related Entities
  jobId?: string; // UUID
  jobTitle?: string;
  packageId?: string; // UUID
  packageTitle?: string;
  paymentId?: string; // UUID

  // Financial
  totalAmount: number; // BigDecimal from backend
  platformFee: number;
  netAmount: number;
  currency: string;

  // Order Details
  requirements?: string;
  deliverables?: string;
  deliveryNote?: string;
  notes?: string;
  deadline: string; // ISO 8601 LocalDateTime

  // Revisions
  revisionCount: number;
  maxRevisions: number;

  // Timestamps
  orderedAt: string; // ISO 8601
  acceptedAt?: string;
  startedAt?: string;
  deliveredAt?: string;
  approvedAt?: string;
  completedAt?: string;
  canceledAt?: string;

  // Cancellation
  cancellationReason?: OrderCancellationReason;
  cancellationNote?: string;

  // Computed Fields
  remainingHours?: number;
  orderAgeDays?: number;
  canCancel?: boolean;
  canComplete?: boolean;
  isOverdue?: boolean;
  isActive?: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Order Summary (lightweight version for lists)
 */
export interface OrderSummaryResponse {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  buyerName: string;
  sellerName: string;
  // Optional fields for package orders
  packageId?: string;
  packageTitle?: string;
  jobId?: string;
  jobTitle?: string;
  deadline: string;
  createdAt: string;
}

/**
 * Order Statistics
 */
export interface OrderStatistics {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  averageDeliveryTime: number;
}

/**
 * Order Event (timeline)
 */
export interface OrderEvent {
  id: string;
  orderId: string;
  type: string;
  description: string;
  performedBy?: string;
  performedByName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Re-export helper types and functions
export type { OrderWithComputed } from './order-helpers';
export {
  enrichOrder,
  unwrapOrderResponse,
  computePackageDetails,
  computeDeliveryDetails,
  computeRevisionDetails,
  computeFinancialDetails,
  getOrderStatusLabel,
  getOrderStatusColor,
  canRequestRevision,
  canSubmitDelivery,
  canApproveDelivery,
  hasComputedProperties,
} from './order-helpers';

// ================================================
// PROPOSAL TYPES (ProposalResponse.java)
// ================================================

export type ProposalStatus =
  | 'PENDING'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

/**
 * Proposal Response (matches ProposalResponse.java)
 */
export interface ProposalResponse {
  // Identity
  id: string; // UUID

  // Relations
  jobId: string; // UUID
  jobTitle: string;
  freelancerId: string; // UUID
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerRating?: number;
  freelancerSkills?: string[];

  // Proposal Details
  coverLetter: string;
  proposedBudget: number; // BigDecimal
  proposedTimeline: string;
  deliveryDays: number;

  // Status
  status: ProposalStatus;

  // Attachments
  attachments?: string[];

  // Milestones
  milestones?: ProposalMilestone[];

  // Questions
  questions?: ProposalQuestion[];

  // Tracking
  isViewed: boolean;
  viewedAt?: string;
  respondedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ProposalMilestone {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface ProposalQuestion {
  question: string;
  answer: string;
}

// ================================================
// AUTHENTICATION TYPES (AuthResponse.java)
// ================================================

/**
 * Authentication Response (matches AuthResponse.java)
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // Always "Bearer"
  expiresIn: number; // milliseconds
  user: UserResponse;
}

/**
 * Login Request
 */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register Request
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName: string;
  lastName: string;
  accountType: 'FREELANCER' | 'EMPLOYER' | 'BOTH';
  termsAccepted: boolean;
}

/**
 * Refresh Token Request
 */
export interface RefreshTokenRequest {
  refreshToken?: string; // Optional, can use httpOnly cookie
}

// ================================================
// USER TYPES (UserResponse.java)
// ================================================

export type UserRole =
  | 'USER'
  | 'FREELANCER'
  | 'EMPLOYER'
  | 'ADMIN'
  | 'MODERATOR';

export interface UserResponse {
  id: string; // UUID
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  roles: UserRole[];
  accountType: 'FREELANCER' | 'EMPLOYER' | 'BOTH';
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  rating?: number;
  reviewCount?: number;
  totalOrders?: number;
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// PACKAGE TYPES (PackageResponse.java)
// ================================================

export type PackageStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ARCHIVED';

export interface PackageResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CategoryResponse;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating?: number;
  status: PackageStatus;

  // Pricing
  basicPrice: number;
  standardPrice?: number;
  premiumPrice?: number;
  currency: string;

  // Features
  basicFeatures: string[];
  standardFeatures?: string[];
  premiumFeatures?: string[];

  // Delivery
  basicDeliveryDays: number;
  standardDeliveryDays?: number;
  premiumDeliveryDays?: number;

  // Revisions
  basicRevisions: number;
  standardRevisions?: number;
  premiumRevisions?: number;

  // Media
  images: string[];
  video?: string;

  // Stats
  viewCount: number;
  orderCount: number;
  favoriteCount: number;
  averageRating?: number;
  reviewCount: number;

  // Flags
  isFeatured: boolean;
  isVerified: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PackageSummaryResponse {
  id: string;
  title: string;
  slug: string;
  basicPrice: number;
  currency: string;
  sellerName: string;
  sellerAvatar?: string;
  thumbnail: string;
  averageRating?: number;
  reviewCount: number;
  orderCount: number;
  isFeatured: boolean;
  isVerified: boolean;
}

// ================================================
// CATEGORY TYPES (CategoryResponse.java)
// ================================================

export interface CategoryResponse {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string;
  children?: CategoryResponse[];
  packageCount?: number;
  jobCount?: number;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// JOB TYPES (JobResponse.java)
// ================================================

export type JobStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED';
export type JobBudgetType = 'FIXED' | 'HOURLY';
export type JobExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';

export interface JobResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CategoryResponse;
  employerId: string;
  employerName: string;
  status: JobStatus;

  // Budget
  budgetType: JobBudgetType;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRate?: number;
  currency: string;

  // Requirements
  requiredSkills: string[];
  experienceLevel: JobExperienceLevel;
  duration?: string;
  location?: string;
  isRemote: boolean;

  // Stats
  proposalCount: number;
  viewCount: number;

  // Timestamps
  deadline?: string;
  postedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// REVIEW TYPES (ReviewResponse.java)
// ================================================

export interface ReviewResponse {
  id: string;
  orderId: string;
  packageId?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  targetUserId: string;
  targetUserName: string;
  rating: number; // 1-5
  comment: string;
  communication?: number;
  quality?: number;
  delivery?: number;
  wouldRecommend?: boolean;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummaryResponse {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerAvatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface SellerRatingResponse {
  sellerId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number; // star -> count
  };
  recentReviews: ReviewSummaryResponse[];
}

// ================================================
// MESSAGE TYPES (MessageResponse.java)
// ================================================

export interface ConversationResponse {
  id: string;
  participantIds: string[];
  participants: UserResponse[];
  lastMessage?: MessageResponse;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ================================================
// PAYMENT TYPES (PaymentResponse.java)
// ================================================

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'IYZICO'
  | 'BANK_TRANSFER';

export interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// NOTIFICATION TYPES
// ================================================

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_ACCEPTED'
  | 'ORDER_DELIVERED'
  | 'ORDER_COMPLETED'
  | 'PROPOSAL_RECEIVED'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_REJECTED'
  | 'MESSAGE_RECEIVED'
  | 'PAYMENT_RECEIVED'
  | 'REVIEW_RECEIVED'
  | 'SYSTEM_ANNOUNCEMENT';

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ================================================
// ADMIN TYPES
// ================================================

export interface AdminDashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  pendingPayouts: number;
  recentSignups: number;
  platformFee: number;
}

// ================================================
// SEARCH TYPES
// ================================================

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  deliveryTime?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  size?: number;
}

// Note: All types are already exported via 'export interface/type' declarations above
