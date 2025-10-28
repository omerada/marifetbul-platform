// ================================================
// TYPE SYSTEM INDEX - REFACTORED (Sprint 2)
// ================================================
// Clean re-exports from domain-specific modules

// Core types (User, Freelancer, Employer, ApiResponse, etc.)
export * from './core/base';

// Shared utilities (Performance, SEO, Location, etc.)
export * from './shared/performance';
export * from './shared/seo';
// Location types exported explicitly to avoid conflicts
export type {
  LocationSearchResult,
  LocationSearchResultLegacy,
  LocationPrediction,
  LocationSearchParams,
  LocationSearchRequest,
  LocationAutocompleteRequest,
  GeocodeRequest,
  ReverseGeocodeRequest,
  Coordinates,
  MapBounds,
} from './shared/location';

// Analytics types
export * from './analytics/dashboard';
export * from './analytics';

// Business features
export * from './business/features/analytics';
export * from './business/features/marketplace';
export * from './business/features/messaging';
export * from './business/features/wallet';
export * from './business/features/search';

// Message types (Sprint 5)
export * from './message';

// Import core types for internal usage
import type { User, Freelancer, PaginationMeta } from './core/base';
import type {
  Job,
  ServicePackage,
  Proposal,
} from './business/features/marketplace';
import type {
  LocationSearchResult,
  LocationPrediction,
} from './shared/location';

// ================================================
// INLINE TYPE DEFINITIONS (TO BE MIGRATED)
// ================================================

// Job and Package Filters (to be moved to business/features/)
export interface JobFilters {
  category?: string;
  subcategory?: string; // Subcategory filter
  budget?: { min: number; max: number };
  skills?: string[];
  location?: string | string[];
  search?: string; // MobileJobFilters compatibility
  jobType?: 'fixed' | 'hourly'; // MobileJobFilters compatibility
  budgetMin?: number; // MobileJobFilters compatibility
  budgetMax?: number; // MobileJobFilters compatibility
  budgetType?: 'fixed' | 'hourly'; // Component compatibility
  experienceLevel?: 'beginner' | 'intermediate' | 'expert'; // MobileJobFilters compatibility
  deadline?: string; // Deadline filter
  page?: number; // Pagination
  sortBy?:
    | 'recent'
    | 'budget_desc'
    | 'budget_asc'
    | 'rating'
    | 'newest'
    | 'oldest'
    | 'budget'
    | 'relevance'
    | 'price';
}

export interface PackageFilters {
  category?: string;
  subcategory?: string; // Subcategory filter
  price?: { min: number; max: number };
  priceMin?: number; // Min price filter
  priceMax?: number; // Max price filter
  deliveryTime?: number;
  skills?: string[];
  rating?: number;
  search?: string; // Search filter
  page?: number; // Pagination
  sortBy?:
    | 'recent'
    | 'price_desc'
    | 'price_asc'
    | 'rating'
    | 'newest'
    | 'oldest'
    | 'budget'
    | 'relevance'
    | 'price';
}

// Basic enums and constants
export type Currency = 'TRY' | 'USD' | 'EUR';
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'completed' // Added 'completed' for MSW handler compatibility
  | 'cancelled'
  | 'processing'; // Additional status values
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'canceled'
  | 'cancelled' // MSW handler compatibility
  | 'refunded'
  | 'in_progress'
  | 'disputed'
  | 'under_review'
  | 'rejected'
  | 'requires_approval' // Additional status values
  | 'delayed'; // Added for OrderTimeline compatibility
export type NotificationType =
  | 'job_application'
  | 'message'
  | 'payment'
  | 'review'
  | 'system'
  | 'payment_received' // MSW handler compatibility
  | 'proposal_received' // MSW handler compatibility
  | 'message_received' // MSW handler compatibility
  | 'job_completed' // MSW handler compatibility
  | 'system_announcement' // MSW handler compatibility
  | 'promotion' // Added for unified notification compatibility
  | 'system_update' // Added for features/notifications compatibility
  | 'job_accepted' // Added for features/notifications compatibility
  | 'review_received' // Added for features/notifications compatibility
  | 'reminder'; // Added for features/notifications compatibility

// File upload types
export interface FileAttachment {
  id: string;
  name: string; // Required for utility compatibility
  type: string; // Required for utility compatibility
  filename: string;
  size: number;
  mimetype: string;
  url: string;
  uploadedAt: string;
  thumbnailUrl?: string; // Optional thumbnail URL for preview
}

// Alias for ChatWindow compatibility
export type MessageAttachment = FileAttachment;

// Location types moved to shared/location.ts (imported at top)
// LocationSearchResult, Coordinates, MapBounds, LocationSearchParams, etc.

// Payment types
export interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number | string; // Component compatibility - can be number or string
  expiryYear: number | string; // Component compatibility - can be number or string
  cardNumber?: string;
  cvv?: string;
  cardHolderName?: string;
}

export interface BillingAddress {
  country: string;
  city: string;
  line1: string;
  line2?: string;
  postalCode: string;
  fullName?: string;
  addressLine1?: string;
  state?: string;
  email?: string; // Email field
  phone?: string; // Phone field
}

// Order and Service types

export interface Order {
  id: string;
  packageId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  timeline?: OrderTimeline[];
  milestones?: OrderTimeline[];
  communications?: Message[]; // Added for MSW compatibility
  // MSW handler compatibility
  title?: string;
  description?: string; // Added for dashboard compatibility
  amount?: number;
  deliveryDate?: string; // Added for dashboard compatibility
  userId?: string;
  user?: User;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number; // Alternative to totalAmount
  currency?: string;
  paymentStatus?: string;
  freelancerId?: string; // Seller/freelancer ID
  progress?: {
    percentage: number;
    stagesCompleted: number;
    currentStage?: string; // MSW handler compatibility
    totalStages?: number; // MSW handler compatibility
  }; // MSW handler progress tracking
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status:
    | 'open'
    | 'pending'
    | 'in_progress'
    | 'waiting_user'
    | 'resolved'
    | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category:
    | 'account'
    | 'billing'
    | 'payment'
    | 'technical'
    | 'dispute'
    | 'feature_request'
    | 'bug_report'
    | 'general'
    | 'abuse'
    | 'refund'
    | 'report_user';
  createdAt: string;
  updatedAt: string;
  ticketNumber?: string; // MSW handler compatibility
  estimatedResolutionTime?: string; // MSW handler compatibility
  assignedAgent?: string; // MSW handler compatibility
  // Additional fields for compatibility
  user: {
    id: string;
    name?: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatar?: string;
    userType?: 'freelancer' | 'employer' | 'admin'; // MSW handler compatibility
  };
  responses?: TicketResponse[]; // Support responses
  attachments?: Array<{
    id?: string;
    name: string;
    url?: string;
    size?: number;
    type?: string;
  }>; // Support attachments
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role?: string;
  };
  attachments?: Array<{
    id?: string;
    name: string;
    url?: string;
    size?: number;
    type?: string;
  }>;
}

// Import and re-export messaging types from business domain
export type {
  Message,
  Conversation,
  MessagesResponse,
  ConversationsResponse,
  SendMessageRequest,
  CreateConversationRequest,
  MessageSearchResponse,
  MessageType,
  ConversationParticipant,
  MessageReaction,
  TypingIndicator,
  MessageDraft,
  MessageThread,
} from './business/features/messaging';

// Import types for local use
import type { Message, Conversation } from './business/features/messaging';

// Legacy compatibility aliases
export type { Message as BasicMessage } from './business/features/messaging';
export type { Conversation as BasicConversation } from './business/features/messaging';

// Message search result interface
export interface MessageSearchResult {
  message: Message;
  conversation: Conversation;
  highlights: string[];
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  type:
    | 'status_change'
    | 'message'
    | 'delivery'
    | 'milestone'
    | 'payment'
    | 'dispute'
    | 'status_update' // MSW handler compatibility
    | 'communication' // MSW handler compatibility
    | 'revision' // MSW handler compatibility
    | 'completion'; // MSW handler compatibility
  title: string;
  description: string;
  eventType?: string; // MSW handler compatibility
  actor:
    | 'buyer'
    | 'seller'
    | 'system'
    | {
        id: string;
        name: string;
        avatar: string;
        role: string;
      }; // Enhanced for MSW handler compatibility
  actorId?: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  dueDate?: string; // MSW handler compatibility
  completedAt?: string; // MSW handler compatibility
  amount?: number; // MSW handler compatibility
  status?: OrderStatus; // MSW handler compatibility
}

export interface OrdersResponse {
  data?: Order[];
  meta?: PaginationMeta;
  orders: Order[];
  pagination: PaginationMeta;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

export interface OrderUpdate {
  orderId: string;
  status?: OrderStatus;
  milestone?: OrderTimeline;
  deliverable?: FileAttachment;
  message?: string;
  estimatedDelivery?: string;
  // MSW handler compatibility
  from?: string; // user ID who sent the update
  to?: string; // user ID who received the update
  attachments?: string[]; // attached files
  id?: string; // optional ID for MSW handlers
  type?:
    | 'status_change'
    | 'milestone_completed'
    | 'file_uploaded'
    | 'message'
    | 'payment_released';
  userId?: string;
  timestamp?: string;
}

export interface OrderDispute {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: string;
  // MSW handler compatibility
  evidence?: Array<{
    type: string;
    url: string;
    description?: string;
  }>;
  raisedBy?: string; // User ID who raised the dispute
}

// Notification types
export interface EnhancedNotification {
  id: string;
  userId?: string; // MSW handler compatibility
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  category?: string; // Required for notification center compatibility
  // MSW handler compatibility
  priority?: string;
  readAt?: string;
  deliveryStatus?: string;
  deliveryAttempts?:
    | number
    | Array<{
        id: string;
        notificationId: string;
        channel?: string;
        status: string;
        attemptedAt: string;
        deliveredAt?: string; // MSW handler compatibility
      }>; // MSW handler compatibility
  channel?: string;
  expiresAt?: string;
  actionText?: string;
  imageUrl?: string;
  tags?: string[]; // MSW handler compatibility
  metadata?: Record<string, unknown>; // MSW handler compatibility
}

export interface NotificationCenter {
  notifications: EnhancedNotification[];
  unreadCount: number;
  lastFetched: string;
  // MSW handler compatibility
  summary?: {
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    total?: number; // MSW handler compatibility
    unread?: number; // MSW handler compatibility
  };
  pagination?: PaginationMeta; // MSW handler compatibility
}

export interface NotificationPreferences {
  userId?: string; // MSW handler compatibility
  browser?: {
    enabled: boolean;
    proposals: boolean;
    messages: boolean;
    payments: boolean;
    orders: boolean;
    system: boolean;
    marketing: boolean;
  }; // MSW handler compatibility
  email:
    | boolean
    | {
        enabled: boolean;
        proposals: boolean;
        messages: boolean;
        payments: boolean;
        orders: boolean;
        system: boolean;
        marketing: boolean;
        digest: string;
        digestTime: string;
      }; // MSW handler compatibility
  push:
    | boolean
    | {
        enabled?: boolean;
        immediate?: string[];
        batched?: string[];
        batchInterval?: number;
        proposals?: boolean; // MSW handler compatibility
        messages?: boolean; // MSW handler compatibility
        payments?: boolean; // MSW handler compatibility
        orders?: boolean; // MSW handler compatibility
        system?: boolean; // MSW handler compatibility
        sound?: boolean; // MSW handler compatibility
        vibration?: boolean; // MSW handler compatibility
      }; // MSW handler compatibility
  sms:
    | boolean
    | {
        enabled: boolean;
        urgent: boolean;
        payments: boolean;
        security: boolean;
      }; // MSW handler compatibility
  inApp?: boolean; // MSW handler compatibility
  frequency:
    | 'immediate'
    | 'daily'
    | 'weekly'
    | 'never'
    | { immediate: string[]; batched: string[]; batchInterval: number }; // MSW handler compatibility
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
    daysOfWeek: string[];
  }; // MSW handler compatibility
  updatedAt?: string; // MSW handler compatibility
}

export interface NotificationFilters {
  type?: NotificationType[];
  isRead?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface NotificationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  userMessage?: string; // Store compatibility
}

export interface PushSubscriptionData {
  id?: string; // MSW handler compatibility
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  // MSW handler compatibility
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUsed?: string; // MSW handler compatibility
  userAgent?: string;
  deviceType?: string;
  isActive?: boolean;
  failureCount?: number; // Store compatibility
  metadata?: Record<string, unknown>; // MSW handler compatibility
}

export interface NotificationBatch {
  notifications: EnhancedNotification[];
  total: number;
  hasMore: boolean;
}

// Payment related types
export interface Payment {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  orderId: string;
  payerId: string;
  payeeId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string; // MSW handler compatibility
  paymentId?: string; // MSW handler compatibility
  gatewayReference?: string; // MSW handler compatibility
  receiptUrl?: string; // MSW handler compatibility
  method?: 'credit_card' | 'bank_transfer' | 'paypal'; // Store compatibility
  escrowStatus?: 'held' | 'released' | 'disputed' | 'pending'; // MSW handler compatibility
  escrowReleaseDate?: string; // MSW handler compatibility
  refundableAmount?: number; // Store compatibility
  userId?: string; // MSW handler compatibility
  transactionId?: string; // MSW handler compatibility
  isValid?: boolean; // MSW handler compatibility
  fees?: {
    platformFee: number;
    processingFee: number;
    total: number;
  }; // MSW handler compatibility
  metadata?: Record<string, unknown>; // MSW handler compatibility
  paymentMethodDetails?: {
    type: string;
    last4?: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
    holderName?: string; // MSW handler compatibility
    bankName?: string; // MSW handler compatibility
    expiryMonth?: string; // MSW handler compatibility - string format for month
    expiryYear?: string; // MSW handler compatibility - string format for year
    accountNumber?: string; // MSW handler compatibility - bank account
  }; // MSW handler compatibility
  invoiceUrl?: string; // MSW handler compatibility
}

export interface PaymentHistory {
  payments: Payment[];
  pagination: PaginationMeta;
  totalAmount: number;
  summary?:
    | {
        // Required core properties
        totalEarnings: number;
        totalSpent: number;
        pendingAmount: number;
        completedTransactions: number;
        failedTransactions: number;
        averageTransactionAmount: number;
        // MSW handler compatibility - additional properties
        totalPayments?: number;
        successfulPayments?: number;
        failedPayments?: number;
        totalAmount?: number;
        refundedAmount?: number;
        escrowAmount?: number;
      }
    | {
        // Alternative MSW handler format
        totalPayments: number;
        totalAmount: number;
        successfulPayments: number;
        failedPayments: number;
        refundedAmount: number;
        escrowAmount: number;
      };
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency: Currency;
  paymentMethodId: string;
  payerId?: string; // MSW handler compatibility
  payeeId?: string; // MSW handler compatibility
  method?: 'credit_card' | 'bank_transfer' | 'paypal'; // MSW handler compatibility
}

export interface CreatePaymentResponse {
  payment: Payment;
  success: boolean;
  error?: string;
  clientSecret?: string;
  data?: {
    status: string;
    paymentId?: string; // MSW handler compatibility
    paymentUrl?: string; // MSW handler compatibility
    invoiceUrl?: string; // MSW handler compatibility
    redirectUrl?: string; // MSW handler compatibility
    estimatedCompletionTime?: string; // MSW handler compatibility
  };
}

export interface PaymentFilters {
  status?: PaymentStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  minAmount?: number;
  maxAmount?: number;
}

export interface InvoiceDetails {
  id: string;
  paymentId: string;
  orderId?: string; // MSW handler compatibility
  invoiceNumber?: string; // MSW handler compatibility
  issueDate?: string; // MSW handler compatibility
  createdAt?: string; // MSW handler compatibility
  updatedAt?: string; // MSW handler compatibility
  amount?: number; // MSW handler compatibility
  currency?: string; // MSW handler compatibility
  status?: 'paid' | 'unpaid' | 'overdue' | 'cancelled'; // MSW handler compatibility
  items: Array<{
    id?: string; // MSW handler compatibility
    description: string;
    amount: number;
    quantity: number;
    unitPrice?: number; // MSW handler compatibility
    totalPrice?: number; // MSW handler compatibility
  }>;
  tax: number;
  total: number;
  totalAmount?: number; // MSW handler compatibility
  dueDate: string;
}

export interface EscrowDetails {
  id: string;
  paymentId: string;
  amount: number;
  releaseConditions: string[];
  status: 'pending' | 'released' | 'disputed' | 'held'; // Enhanced with 'held' status
  createdAt?: string;
  updatedAt?: string; // MSW handler compatibility
  releaseDate?: string;
  disputeReason?: string;
  releasedBy?: string;
  orderId?: string;
  milestoneId?: string;
  autoReleaseDate?: string;
  metadata?: Record<string, unknown>; // Store compatibility
  currency?: string; // MSW handler compatibility
  holdStartDate?: string; // MSW handler compatibility
  releaseTrigger?: string; // MSW handler compatibility
  fees?: {
    escrowFee: number;
    processingFee?: number; // Made optional for MSW handler compatibility
    platformFee?: number; // MSW handler compatibility
  };
}

export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable?: boolean; // Store compatibility
  userMessage?: string; // Store compatibility
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'credit_card'; // Added 'credit_card' for MSW handler compatibility
  isDefault: boolean;
  metadata?: Record<string, unknown>; // Made optional for MSW handler compatibility
  createdAt?: string; // MSW handler compatibility
  updatedAt?: string; // MSW handler compatibility
  name?: string; // MSW handler compatibility - display name like "Visa ****1234"
  cardNumber?: string; // MSW handler compatibility
  expiryDate?: string; // MSW handler compatibility - card expiry date
  cardHolderName?: string; // MSW handler compatibility
  isValid?: boolean; // MSW handler compatibility
}

// Payment method type alias for compatibility
export type PaymentMethodType = PaymentMethod;

// Notification interface for compatibility
export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// Notification alias for compatibility
export type Notification = InAppNotification;

// Notification settings interface for compatibility
export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  marketing?: boolean;
  updates?: boolean;
  reminders?: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  browser: {
    enabled: boolean;
    [key: string]: string | boolean;
  };
}

// Notification type enum for compatibility
export enum NotificationTypeEnum {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  MESSAGE = 'message',
  ORDER = 'order',
  PAYMENT = 'payment',
  SYSTEM = 'system',
}

// Order milestone and progress types for compatibility
export interface OrderMilestone {
  id: string;
  title: string;
  description?: string;
  status:
    | 'completed'
    | 'in_progress'
    | 'pending'
    | 'requires_approval'
    | 'rejected'
    | 'cancelled'
    | 'delayed'; // Added for OrderTimeline compatibility
  dueDate?: string;
  completedAt?: string;
  amount?: number;
  deliverables?: Array<{
    id: string;
    name: string;
    description?: string;
    isCompleted: boolean;
    completedAt?: string;
  }>;
}

export interface OrderProgress {
  percentage: number;
  status?:
    | 'completed'
    | 'in_progress'
    | 'pending'
    | 'requires_approval'
    | 'rejected'
    | 'cancelled';
  estimatedCompletion?: string;
  stagesCompleted?: number;
  currentStage?: string;
  totalStages?: number;
  milestones: Array<{
    id: string;
    title: string;
    status:
      | 'completed'
      | 'in_progress'
      | 'pending'
      | 'requires_approval'
      | 'rejected'
      | 'cancelled';
    completedAt?: string;
  }>;
}

// Analytics types
export interface FreelancerAnalytics {
  earnings: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    trend: 'up' | 'down' | 'stable';
    timeframe?: { period: string }; // MSW handler compatibility
    totalEarnings?: number; // MSW handler compatibility
    earningsTrend?: unknown; // Additional field for MSW compatibility
    earningsByCategory?: unknown[]; // MSW handler compatibility
    projectedEarnings?: number; // MSW handler compatibility
  };
  jobs: {
    completed: number;
    active: number;
    successRate: number;
  };
  profile: {
    views: number;
    rating: number;
    responseTime: number;
  };
  overview?: {
    [key: string]: unknown; // Overview data
  };
  orders?:
    | unknown[]
    | {
        total?: number; // MSW handler compatibility
        [key: string]: unknown;
      }; // Orders data
  performance?: {
    [key: string]: unknown; // Performance data
  };
  clients?: {
    [key: string]: unknown; // Clients data
  };
  growth?: {
    [key: string]: unknown; // Growth data
  };
}

export interface EmployerAnalytics {
  spending: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    trend: 'up' | 'down' | 'stable';
    spendingTrend?: unknown; // Additional field for MSW compatibility
  };
  jobs: {
    posted: number;
    completed: number;
    activeHires: number;
  };
  hiring: {
    avgTimeToHire: number;
    freelancerRetention: number;
    satisfaction: number;
  };
  overview?: {
    [key: string]: unknown; // Overview data
  };
  projects?: unknown[]; // Projects data
}

// More missing types
export interface RecommendationsRequest {
  type: 'jobs' | 'freelancers' | 'packages';
  userId?: string; // Made optional for compatibility
  limit?: number;
  excludeIds?: string[];
  basedOn?: string; // Additional field
  targetItemId?: string; // Additional field
}

export interface RecommendationsResponse {
  success?: boolean;
  data?: Recommendation[];
  error?: string;
  recommendations: Recommendation[];
  total: number;
  nextPage?: string;
}

export interface Recommendation {
  id: string;
  type: 'job' | 'freelancer' | 'package';
  targetId: string;
  score: number;
  reasons: string[];
  metadata: Record<string, unknown>;
  // Additional fields for compatibility
  item?: unknown; // The recommended item
  reason?:
    | string
    | {
        type: string;
        description: string;
      }; // Single reason field - can be string or object
}

export interface RecommendationFeedback {
  recommendationId: string;
  feedback: 'helpful' | 'not_helpful' | 'irrelevant' | 'like' | 'dislike'; // Component compatibility
  reason?: string;
  userId?: string; // Component compatibility
  timestamp?: string; // Component compatibility
}

// Additional missing types for reputation and security
export interface ReputationScore {
  userId: string;
  score: number;
  overallScore?: number; // For component compatibility
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badges:
    | string[]
    | Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        category: string;
        earnedAt: string;
        isVisible?: boolean;
      }>; // MSW handler compatibility - can be string array or object array
  reviews: {
    total: number;
    average: number;
    breakdown: Record<number, number>;
  };
  calculatedAt?: string; // MSW handler compatibility
  expiresAt?: string; // MSW handler compatibility
  history?: Array<{
    date: string;
    score: number;
    change: number;
    reason: string;
    factors?: unknown[]; // MSW handler compatibility
  }>; // For component compatibility
  factors?: Array<{
    name: string;
    score: number;
    description: string;
    weight: number;
    currentValue?: number; // Component compatibility
    maxValue?: number; // Component compatibility
    trend?: string; // MSW handler compatibility
  }>; // For component compatibility
  nextLevelRequirements?: Array<{
    name?: string; // MSW handler compatibility
    type: string;
    current: number;
    required: number;
    description: string;
    currentProgress?: number; // Component compatibility
    targetValue?: number; // Component compatibility
  }>; // For component compatibility
}

export interface SecurityStatus {
  userId: string;
  verifications: SecurityVerification[];
  alerts: SecurityAlert[];
  riskLevel: 'low' | 'medium' | 'high';
  level?: 'good' | 'fair' | 'poor'; // MSW handler compatibility
  lastUpdated: string;
  nextAssessment?: string; // MSW handler compatibility
  overallScore?: number; // For component compatibility
  recommendations?:
    | string[]
    | Array<{
        id: string;
        type: string;
        priority: string;
        title: string;
        description: string;
        impact: string;
        actionText: string;
        actionUrl: string;
        isCompleted: boolean;
        estimatedTime: string;
      }>; // MSW handler compatibility - can be string array or object array
}

export interface SecurityAlert {
  id: string;
  type:
    | 'login'
    | 'payment'
    | 'profile'
    | 'security'
    | 'verification'
    | 'account'
    | 'error'
    | 'warning'; // Enhanced for component compatibility
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority?: 'critical' | 'high' | 'medium' | 'low'; // Store compatibility
  title: string;
  description: string;
  isResolved: boolean;
  isRead?: boolean; // Store compatibility
  createdAt: string;
  message?: string; // AdminDashboard component compatibility
  userId?: string; // MSW handler compatibility
  recommendations?: string[]; // MSW handler compatibility
  actionRequired?: boolean; // MSW handler compatibility
  actionUrl?: string; // MSW handler compatibility
  actionText?: string; // MSW handler compatibility
  dismissible?: boolean; // MSW handler compatibility
  isDismissed?: boolean; // MSW handler compatibility
  expiresAt?: string; // For component compatibility
  category?: string; // For MSW handler compatibility
}

export interface TrustIndicators {
  isVerified: boolean;
  hasCompletedJobs: boolean;
  hasPositiveReviews: boolean;
  isFreelancerPlus: boolean;
  securityScore: number;
  overallTrustScore?: number; // For component compatibility
  activityScore?: number; // For MSW handler compatibility
  userId?: string; // MSW handler compatibility
  profileCompletion?: number; // MSW handler compatibility
  verificationLevel?: number; // MSW handler compatibility
  reviewScore?: number; // MSW handler compatibility
  paymentHistory?: number; // MSW handler compatibility
  communityStanding?: number; // MSW handler compatibility
  publicBadges?: unknown[]; // MSW handler compatibility
  calculatedAt?: string; // MSW handler compatibility
}

export interface SecurityVerification {
  id: string;
  type: 'identity' | 'phone' | 'email' | 'address' | 'bank' | '2fa'; // Added '2fa' for MSW handler compatibility
  status: 'pending' | 'verified' | 'failed' | 'not_started'; // Added 'not_started' for MSW handler compatibility
  verifiedAt?: string;
  metadata?: Record<string, unknown>;
  // MSW handler compatibility
  retryCount?: number;
  maxRetries?: number;
}

export interface GetReputationResponse {
  success?: boolean;
  data?: {
    score: ReputationScore;
    status: SecurityStatus;
    trustIndicators: TrustIndicators;
  };
  error?: string;
  // Core required fields
  reputation?: ReputationScore; // Made optional for MSW handler compatibility
  trustIndicators?: TrustIndicators; // Made optional for MSW handler compatibility
  securityStatus?: SecurityStatus; // Made optional for MSW handler compatibility
}

export interface GetSecurityAlertsResponse {
  success?: boolean;
  data?: SecurityAlert[];
  error?: string;
  // Core required fields - made optional for MSW handler compatibility
  alerts?: SecurityAlert[];
  unreadCount?: number;
  pagination?: PaginationMeta;
}

// Review related types
export interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  revieweeId: string;
  orderId?: string;
  jobId?: string;
  packageId?: string;
  isPublic: boolean;
  response?: string;
  createdAt: string;
  updatedAt?: string; // Made optional for MSW handler compatibility
  status?: 'active' | 'hidden' | 'flagged' | 'deleted'; // MSW handler compatibility
  reportCount?: number; // MSW handler compatibility
  // MSW handler compatibility - alternative format
  reviewer?: {
    id: string;
    name: string;
    avatar: string;
    firstName?: string; // MSW handler compatibility
    lastName?: string; // Component compatibility
    userType?: string; // Component compatibility
  };
  reviewee?: {
    id: string;
    name: string;
    avatar: string;
    firstName?: string; // MSW handler compatibility
    lastName?: string; // Component compatibility
  };
  categories?: string[] | Record<string, number>; // MSW handler compatibility - can be array or object
  helpfulCount?: number; // MSW handler compatibility
  verifiedPurchase?: boolean; // Component compatibility
  projectTitle?: string; // Component compatibility
  projectCategory?: string; // Component compatibility
  reply?: {
    id: string;
    reviewId?: string; // MSW handler compatibility
    userId?: string; // MSW handler compatibility
    comment: string;
    content?: string; // Component compatibility
    createdAt: string;
    authorId: string;
    authorName: string;
    user?: {
      id: string;
      name: string;
      avatar: string;
      firstName?: string;
      lastName?: string;
    }; // Component compatibility
  }; // Component compatibility
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  recentReviews: ReviewData[];
  qualityScores: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
  verifiedPurchasePercentage?: number; // MSW handler compatibility
  // MSW handler compatibility
  categoryAverages?: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
    timing?: number; // MSW handler compatibility
  };
}

export interface CreateReviewRequest {
  orderId: string;
  rating: number;
  comment: string;
  qualityScores?: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
  // MSW handler compatibility
  reviewerId?: string;
  revieweeId?: string;
  categories?:
    | string[]
    | {
        communication: number;
        quality: number;
        timing: number;
        professionalism?: number;
        value?: number;
      }; // Component compatibility - can be array or object
  isPublic?: boolean;
}

export interface CreateReviewResponse {
  review: ReviewData;
  success: boolean;
  error?: string;
  message?: string;
  data?: ReviewData;
  // MSW handler compatibility - required properties
  id?: string;
  status?: string;
  timestamp?: string;
}

export interface ReviewFilters {
  rating?: number[];
  dateRange?: {
    start: string;
    end: string;
  };
  orderBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
}

export interface ReviewsResponse {
  success?: boolean;
  data?: {
    reviews: ReviewData[];
    summary: ReviewSummary;
    pagination?: PaginationMeta; // MSW handler compatibility
  };
  error?: string;
  reviews: ReviewData[];
  summary: ReviewSummary;
  pagination: PaginationMeta;
}

// Help center and support types
export interface HelpCategory {
  id: string;
  name: string;
  slug?: string; // MSW handler compatibility
  description?: string; // MSW handler compatibility
  icon?: string; // MSW handler compatibility
  articleCount?: number; // Keep for existing usage
  isPopular?: boolean; // Keep for existing usage
  order?: number; // Keep for existing usage
  parentId?: string; // For hierarchical categories
  articles?: HelpArticle[]; // MSW handler compatibility
  isVisible?: boolean; // MSW handler compatibility
  color?: string; // MSW handler compatibility
  createdAt?: string; // MSW handler compatibility
  updatedAt?: string; // MSW handler compatibility
  // Additional fields for compatibility
  children?: HelpCategory[]; // Child categories
}

export interface HelpArticle {
  id: string;
  categoryId?: string; // MSW handler compatibility
  title: string;
  content: string;
  slug?: string; // MSW handler compatibility
  excerpt?: string; // MSW handler compatibility
  tags?: string[]; // MSW handler compatibility
  isPublished?: boolean; // MSW handler compatibility
  views?: number; // MSW handler compatibility
  helpfulVotes?: number; // MSW handler compatibility
  totalVotes?: number; // MSW handler compatibility
  lastUpdated?: string; // MSW handler compatibility
  publishedAt?: string; // Added for ArticleViewer compatibility
  relatedArticles?: string[]; // Added for ArticleViewer compatibility
  author: string | { id: string; name: string; avatar: string }; // MSW handler compatibility
  featured?: boolean; // MSW handler compatibility
  rating?: number; // MSW handler compatibility
  ratingCount?: number; // MSW handler compatibility
  createdAt?: string; // MSW handler compatibility
  updatedAt?: string; // Article update time
  estimatedReadTime?: number; // Reading time estimation
  language?: string; // MSW handler compatibility
  category?: string | HelpCategory; // Category name or object
}

export interface ArticleRatingFormData {
  articleId: string;
  isHelpful: boolean;
  feedback?: string;
}

// Help Support Types
export interface SupportAnalytics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  satisfactionScore: number;
  averageResolutionTime?: number; // MSW handler compatibility
  customerSatisfaction?: number; // MSW handler compatibility
  ticketsByCategory?: Array<{
    category: string;
    count: number;
    percentage: number;
  }>; // MSW handler compatibility
  responseTimeMetrics?: Array<{
    metric: string;
    value: number;
    trend: string;
  }>; // Added for SupportStats component
  chatMetrics?: {
    averageResponseTime: number;
    averageSessionDuration: number;
    customerSatisfactionScore: number;
  }; // Added for SupportStats component
  resolutionTrend?: Array<{
    date: string;
    resolved: number;
    created: number;
  }>; // MSW handler compatibility
  satisfactionTrend?: Array<{
    date: string;
    score: number;
  }>; // MSW handler compatibility
  // Additional fields for compatibility
  overview?: {
    totalTickets?: number;
    openTickets?: number;
    resolvedTickets?: number;
    averageResolutionTime?: number;
    customerSatisfaction?: number;
    firstCallResolution?: number;
    responseTimeMetrics?: unknown;
    chatMetrics?: unknown;
    averageResponseTime?: number; // MSW handler compatibility
  };
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
  description?: string; // MSW handler compatibility
  category: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
  userId?: string; // MSW handler compatibility
}

export interface CreateTicketResponse {
  success: boolean;
  data: SupportTicket;
}

export interface ArticleRatingRequest {
  articleId: string;
  rating: number;
  feedback?: string;
}

export interface ArticleRatingResponse {
  success: boolean;
  message?: string; // Made optional for MSW handler compatibility
  data?: {
    avgRating: number;
    ratingCount: number;
  }; // MSW handler compatibility
}

// Favorites types
export interface FavoriteItem {
  id: string;
  type: 'job' | 'freelancer' | 'package';
  targetId: string;
  folderId?: string;
  notes?: string;
  note?: string; // Alias for notes for backward compatibility
  createdAt: string;
  addedAt?: string; // When the item was added to favorites
  tags?: string[]; // Tags associated with the favorite item
  item?: Job | Freelancer | ServicePackage; // The actual favorited item data
}

export interface FavoriteFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  itemCount: number;
  createdAt: string;
}

export interface FavoritesRequest {
  type?: 'job' | 'freelancer' | 'package';
  folderId?: string;
  page?: number;
  limit?: number;
}

export interface FavoritesResponse {
  items: FavoriteItem[];
  folders: FavoriteFolder[];
  pagination: PaginationMeta;
  // Store compatibility
  success?: boolean;
  data?: FavoriteItem[];
  error?: string;
}

export interface AddToFavoritesRequest {
  type: 'job' | 'freelancer' | 'package';
  targetId: string;
  folderId?: string;
  notes?: string;
  itemType?: string; // Additional field for compatibility
  itemId?: string; // Hook compatibility
}

// Dashboard types
export interface FreelancerDashboard {
  overview: {
    totalEarnings: number;
    completedJobs: number;
    activeJobs: number;
    profileViews: number;
    successRate: number;
    responseTime: number;
  };
  stats: {
    totalEarnings: number;
    currentMonthEarnings: number;
    activeOrders: number;
    completedJobs: number;
    rating: number;
    profileViews: number;
    responseRate: number;
  };
  quickStats: {
    messagesWaiting: number;
    pendingProposals: number;
    reviewsPending: number;
  };
  recentJobs: Job[];
  recentOrders: Order[];
  recentProposals: Proposal[];
  earnings: Record<string, number>;
  analytics: FreelancerAnalytics;
  recommendations: Recommendation[];
  notifications: EnhancedNotification[];
  chartData?: {
    earnings: Array<{ date: string; amount: number; orderCount?: number }>;
    packages: Array<{
      packageId: string;
      packageName: string;
      sales: number;
      revenue: number;
      views: number;
      conversionRate: number;
    }>;
    clients: {
      totalClients: number;
      newClients: number;
      repeatClients: number;
      averageSatisfaction: number;
      repeatRate: number;
      topClients: Array<{
        id: string;
        name: string;
        orders: number;
        totalSpent: number;
      }>;
    };
  };
}

export interface EmployerDashboard {
  overview: {
    totalSpent: number;
    jobsPosted: number;
    activeJobs: number;
    completedJobs: number;
    avgTimeToHire: number;
    freelancerRetention: number;
  };
  stats: {
    activeJobs: number;
    totalSpent: number;
    savedFreelancers: number;
    completedJobs: number;
  };
  activeJobs: Job[];
  recentJobs: Job[];
  spending: Record<string, number>;
  analytics: EmployerAnalytics;
  recommendations: Recommendation[];
  notifications: EnhancedNotification[];
  chartData?: {
    spending: Array<{ date: string; amount: number; jobCount?: number }>;
    hiring: {
      avgTimeToHire: number;
      freelancerRetention: number;
      satisfaction: number;
    };
  };
}

// Location search response types
export interface LocationSearchResponse {
  success: boolean;
  data?: LocationSearchResult[];
  error?: string;
}

export interface LocationAutocompleteResponse {
  success: boolean;
  data?: {
    predictions: LocationPrediction[];
  };
  error?: string;
}

export interface GeocodeResponse {
  success: boolean;
  data?: {
    location: import('./core/base').LocationData;
  };
  error?: string;
}

// Location types moved to shared/location.ts (already imported)
// Removed duplicate LocationSearchResult, LocationPrediction, etc.

// Admin Types
export interface AdminDashboardStore {
  data: AdminDashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  clearError: () => void;
  // Computed
  unreadAlerts: SecurityAlert[];
  criticalAlerts: SecurityAlert[];
  charts?: Record<string, unknown>; // Store compatibility
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  issues?: string[];
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalJobs: number;
    activeJobs: number;
    totalRevenue: number;
    pendingPayouts: number;
    // Additional stats for AdminDashboard component
    newUsersToday?: number;
    monthlyRevenue?: number;
    revenueGrowth?: number;
    pendingOrders?: number;
    completedOrders?: number;
    conversionRate?: number;
    userRetentionRate?: number;
  };
  alerts?: SecurityAlert[];
  recentActivity: SecurityAlert[];
  systemHealth: SystemHealth;
  charts?: Record<string, unknown>; // AdminDashboard component compatibility
  lastUpdated?: string;
}

export interface AdminModerationStore {
  items: ModerationItem[];
  filters: ModerationFilters;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
  selectedItems: string[];
  selectedItem?: ModerationItem | null; // Store compatibility
  // Store compatibility - additional required methods
  fetchModerationQueue: (filters?: ModerationFilters) => Promise<void>;
  fetchItems: (filters?: ModerationFilters) => Promise<void>;
  fetchModerationStats?: () => Promise<void>; // Store compatibility
  approveItem: (itemId: string, reason?: string) => Promise<void>;
  rejectItem: (itemId: string, reason: string) => Promise<void>;
  escalateItem: (itemId: string, reason: string) => Promise<void>;
  performModerationAction: (
    itemId: string,
    action: ModerationActionRequest
  ) => Promise<void>; // Hook compatibility
  assignModerator: (itemId: string, moderatorId: string) => Promise<void>; // Hook compatibility
  bulkAction: (
    action: 'approve' | 'reject' | 'escalate',
    itemIds: string[],
    reason?: string
  ) => Promise<void>;
  setFilters: (filters: Partial<ModerationFilters>) => void;
  clearFilters: () => void;
  clearError: () => void; // Store compatibility
  selectItem: (item: ModerationItem | null) => void; // Changed signature for store compatibility
  selectAllItems: () => void;
  clearSelection: () => void;
  // Computed
  pendingItems: ModerationItem[];
  approvedItems: ModerationItem[];
  rejectedItems: ModerationItem[];
  escalatedItems: ModerationItem[];
  highPriorityItems: ModerationItem[];
  urgentItems: ModerationItem[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    escalated: number;
    reviewItems: number;
    jobItems: number;
    serviceItems: number;
    profileItems: number;
    totalItems?: number; // Store compatibility
    averageReviewTime?: number; // Store compatibility
    automatedFlagAccuracy?: number; // Store compatibility
  } | null; // Store compatibility - can be null initially
}

export interface ModerationItem {
  id: string;
  type: 'review' | 'job' | 'service' | 'profile' | 'message';
  content: Record<string, unknown>;
  reportReason: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'dismissed'; // Added 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reportedBy: string;
  reportedAt: string;
  moderatedBy?: string;
  moderatedAt?: string;
  notes?: string;
  moderatorNotes?: string; // MSW handler compatibility
  updatedAt?: string; // MSW handler compatibility
  resolvedAt?: string; // MSW handler compatibility
  // ContentModerationQueue component compatibility
  reason?: string; // Alternative to reportReason
  reporterInfo?: User; // Reporter information
  createdAt?: string; // Alternative to reportedAt
}

export interface ModerationFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'escalated';
  type?: 'review' | 'job' | 'service' | 'profile' | 'message';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dateFrom?: string;
  dateTo?: string;
  search?: string; // ContentModerationQueue component compatibility
  sort?: string; // Hook compatibility
}

export interface ModerationActionRequest {
  itemId: string;
  action: 'approve' | 'reject' | 'escalate' | 'dismiss' | 'request_changes'; // Extended for component compatibility
  reason?: string;
  notes?: string;
}

// Admin types moved to types/features/admin.ts to avoid duplication
// Re-export for compatibility
export type { UserAnalytics } from './business/features/admin';
export type {
  AdminUserStore,
  AdminUserData,
  AdminUser,
  UserStats,
  UserFilters,
  UserActionRequest,
  BulkUserActionRequest,
} from './business/features/admin';
export type {
  PlatformSettings,
  AdminSettingsStore,
} from './business/features/admin';

// Analytics additional types
export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: string; // Store compatibility
  endDate?: string; // Store compatibility
}

export interface AnalyticsFilters {
  timeframe: AnalyticsTimeframe;
  metrics?: string[];
  userType?: 'freelancer' | 'employer';
}

// Analytics interfaces moved to types/features/analytics.ts to avoid duplication

// Search Types - manually added for compatibility
export interface SaveSearchRequest {
  query: string;
  filters?: Record<string, unknown>;
  name: string;
  alertFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';
}

// Toast system types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
}

// Enhanced Search Types
export interface EnhancedSearchResult {
  id: string;
  title: string;
  description: string;
  type: 'job' | 'freelancer' | 'package';
  relevanceScore: number;
  matchedFields: string[];
  highlights: Record<string, string[]>;
}

export interface EnhancedSearchFilters {
  query?: string;
  type?: string[];
  category?: string[];
  skills?: string[];
  location?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: boolean;
  experienceLevel?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseEnhancedSearchReturn {
  results: EnhancedSearchResult[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  search: (filters: EnhancedSearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  query: string;
  filters: EnhancedSearchFilters;
  setQuery: (query: string) => void;
  applyFilter: (key: string, value: unknown) => void;
  removeFilter: (key: string) => void;
  clearSearch: () => void;
  saveCurrentSearch: (name: string) => Promise<void>;
  getSearchAnalytics: () => Promise<SearchAnalytics>;
}

export interface SearchAnalytics {
  popularQueries: Array<{
    query: string;
    count: number;
  }>;
  searchTrends: Array<{
    period: string;
    searches: number;
  }>;
  conversionRate: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  rating: number;
  type: 'job' | 'freelancer' | 'package';
  skills: string[];
  freelancer?: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  employer?: {
    id: string;
    name: string;
    avatar: string;
  };
  price?: number;
  deliveryTime?: number;
  createdAt: string;
}
