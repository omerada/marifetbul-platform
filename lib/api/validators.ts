/**
 * API Response Validators
 *
 * Runtime validation schemas using Zod for type-safe API responses.
 * Ensures responses match expected structure and provides detailed validation errors.
 *
 * NOTE: Order types moved to @/types/backend-aligned for centralized type management
 */

import { z } from 'zod';
import { ValidationError } from './errors';

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * User role schema
 */
export const UserRoleSchema = z.enum(['FREELANCER', 'EMPLOYER', 'ADMIN']);

/**
 * Pagination metadata schema
 */
export const PaginationMetaSchema = z.object({
  currentPage: z.number().int().min(1),
  totalPages: z.number().int().min(0),
  totalElements: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

/**
 * Generic paginated response schema
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return z.object({
    content: z.array(itemSchema),
    pagination: PaginationMetaSchema,
  });
}

// ============================================================================
// User Schemas
// ============================================================================

/**
 * User profile schema
 */
export const UserProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  profilePictureUrl: z.string().url().nullable(),
  bio: z.string().nullable(),
  verified: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Authentication response schema
 */
export const AuthResponseSchema = z.object({
  user: UserProfileSchema,
  token: z.string().optional(), // Optional for cookie-based auth
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ============================================================================
// Package Schemas
// ============================================================================

/**
 * Package pricing schema
 */
export const PackagePricingSchema = z.object({
  basic: z.number().min(0),
  standard: z.number().min(0),
  premium: z.number().min(0),
});

/**
 * Package delivery time schema (in days)
 */
export const PackageDeliveryTimeSchema = z.object({
  basic: z.number().int().min(1),
  standard: z.number().int().min(1),
  premium: z.number().int().min(1),
});

/**
 * Package revision schema
 */
export const PackageRevisionSchema = z.object({
  basic: z.number().int().min(0),
  standard: z.number().int().min(0),
  premium: z.number().int().min(0),
});

/**
 * Package feature schema
 */
export const PackageFeatureSchema = z.object({
  basic: z.boolean(),
  standard: z.boolean(),
  premium: z.boolean(),
});

/**
 * Complete package schema
 */
export const PackageSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  categoryId: z.number(),
  categoryName: z.string().optional(),
  subcategoryId: z.number().nullable(),
  subcategoryName: z.string().nullable(),
  pricing: PackagePricingSchema,
  deliveryTime: PackageDeliveryTimeSchema,
  revisions: PackageRevisionSchema,
  features: z.record(z.string(), PackageFeatureSchema).optional(),
  thumbnailUrl: z.string().url().nullable(),
  galleryUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  active: z.boolean(),
  views: z.number().int().min(0).optional(),
  orders: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(5).nullable(),
  reviewCount: z.number().int().min(0).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  user: UserProfileSchema.optional(), // Include user when needed
});

export type Package = z.infer<typeof PackageSchema>;

/**
 * Paginated packages response
 */
export const PackagesResponseSchema =
  createPaginatedResponseSchema(PackageSchema);
export type PackagesResponse = z.infer<typeof PackagesResponseSchema>;

// ============================================================================
// ============================================================================
// Proposal Schemas
// ============================================================================

/**
 * Proposal status schema
 */
export const ProposalStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]);

/**
 * Proposal schema
 */
export const ProposalSchema = z.object({
  id: z.number(),
  jobId: z.number(),
  freelancerId: z.number(),
  coverLetter: z.string(),
  proposedPrice: z.number().min(0),
  deliveryDays: z.number().int().min(1),
  status: ProposalStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Related entities
  freelancer: UserProfileSchema.optional(),
});

export type Proposal = z.infer<typeof ProposalSchema>;

/**
 * Paginated proposals response
 */
export const ProposalsResponseSchema =
  createPaginatedResponseSchema(ProposalSchema);
export type ProposalsResponse = z.infer<typeof ProposalsResponseSchema>;

// ============================================================================
// Review Schemas
// ============================================================================

/**
 * Review schema
 */
export const ReviewSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  reviewerId: z.number(),
  revieweeId: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.string().datetime(),
  // Related entities
  reviewer: UserProfileSchema.optional(),
  // Order field removed - use orderId for lookups instead
});

export type Review = z.infer<typeof ReviewSchema>;

/**
 * Paginated reviews response
 */
export const ReviewsResponseSchema =
  createPaginatedResponseSchema(ReviewSchema);
export type ReviewsResponse = z.infer<typeof ReviewsResponseSchema>;

// ============================================================================
// Category Schemas
// ============================================================================

/**
 * Category schema
 */
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  iconUrl: z.string().url().nullable(),
  parentId: z.number().nullable(),
  active: z.boolean(),
  displayOrder: z.number().int(),
  packageCount: z.number().int().min(0).optional(),
});

export type Category = z.infer<typeof CategorySchema>;

/**
 * Category with subcategories
 */
export const CategoryWithSubcategoriesSchema = CategorySchema.extend({
  subcategories: z.array(z.lazy(() => CategorySchema)).optional(),
});

export type CategoryWithSubcategories = z.infer<
  typeof CategoryWithSubcategoriesSchema
>;

// ============================================================================
// Message Schemas
// ============================================================================

/**
 * Message schema
 */
export const MessageSchema = z.object({
  id: z.number(),
  conversationId: z.number(),
  senderId: z.number(),
  content: z.string(),
  attachmentUrls: z.array(z.string().url()).optional(),
  read: z.boolean(),
  createdAt: z.string().datetime(),
  sender: UserProfileSchema.optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Conversation schema
 */
export const ConversationSchema = z.object({
  id: z.number(),
  participant1Id: z.number(),
  participant2Id: z.number(),
  lastMessageAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  // Related entities
  participant1: UserProfileSchema.optional(),
  participant2: UserProfileSchema.optional(),
  lastMessage: MessageSchema.optional(),
  unreadCount: z.number().int().min(0).optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// ============================================================================
// Blog Schemas
// ============================================================================

/**
 * Blog post status schema
 */
export const BlogPostStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'SCHEDULED',
]);

/**
 * Blog category schema
 */
export const BlogCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  postCount: z.number().int().min(0).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BlogCategory = z.infer<typeof BlogCategorySchema>;

/**
 * Blog tag schema
 */
export const BlogTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  usageCount: z.number().int().min(0).optional(),
});

export type BlogTag = z.infer<typeof BlogTagSchema>;

/**
 * Blog author schema
 */
export const BlogAuthorSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().url().nullable().optional(),
  name: z.string().optional(), // Backward compatibility
  avatar: z.string().optional(), // Backward compatibility
});

export type BlogAuthor = z.infer<typeof BlogAuthorSchema>;

/**
 * Blog post summary schema (for lists)
 */
export const BlogPostSummarySchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  coverImageUrl: z.string().url().nullable().optional(),
  status: BlogPostStatusSchema,
  featured: z.boolean(),
  viewCount: z.number().int().min(0),
  commentCount: z.number().int().min(0),
  readingTime: z.number().int().min(0),
  publishedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  category: BlogCategorySchema.optional(),
  author: BlogAuthorSchema,
  tags: z.array(BlogTagSchema),
});

export type BlogPostSummary = z.infer<typeof BlogPostSummarySchema>;

/**
 * Blog comment status schema
 */
export const BlogCommentStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SPAM',
]);

/**
 * Blog comment schema (recursive for replies)
 */
export type BlogCommentType = {
  id: number;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  author: z.infer<typeof BlogAuthorSchema>;
  parentId?: number | null;
  replies: BlogCommentType[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  depth: number;
};

export const BlogCommentSchema: z.ZodType<BlogCommentType> = z.lazy(() =>
  z.object({
    id: z.number(),
    content: z.string(),
    status: BlogCommentStatusSchema,
    author: BlogAuthorSchema,
    parentId: z.number().nullable().optional(),
    replies: z.array(BlogCommentSchema),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    approvedAt: z.string().datetime().nullable().optional(),
    depth: z.number().int().min(0),
  })
);

export type BlogComment = BlogCommentType;

/**
 * Complete blog post schema
 */
export const BlogPostSchema = BlogPostSummarySchema.extend({
  content: z.string(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  comments: z.array(BlogCommentSchema).optional(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

/**
 * Paginated blog posts response
 */
export const BlogPostsResponseSchema = createPaginatedResponseSchema(
  BlogPostSummarySchema
);
export type BlogPostsResponse = z.infer<typeof BlogPostsResponseSchema>;

// ============================================================================
// Wallet & Payment Schemas
// ============================================================================

/**
 * Wallet status schema
 */
export const WalletStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'FROZEN']);

/**
 * Wallet schema
 */
export const WalletSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  balance: z.number().min(0),
  pendingBalance: z.number().min(0),
  totalBalance: z.number().min(0),
  status: WalletStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activeOrdersCount: z.number().int().min(0).optional(),
});

export type Wallet = z.infer<typeof WalletSchema>;

/**
 * Balance response schema
 */
export const BalanceResponseSchema = z.object({
  availableBalance: z.number().min(0),
  pendingBalance: z.number().min(0),
  totalBalance: z.number().min(0),
  totalEarnings: z.number().min(0),
  pendingPayouts: z.number().min(0),
});

export type BalanceResponse = z.infer<typeof BalanceResponseSchema>;

/**
 * Transaction type schema
 */
export const TransactionTypeSchema = z.enum([
  'CREDIT',
  'DEBIT',
  'ESCROW_HOLD',
  'ESCROW_RELEASE',
  'PAYOUT',
  'REFUND',
  'FEE',
  'COMMISSION',
  'DEPOSIT',
  'WITHDRAWAL',
]);

/**
 * Transaction schema
 */
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  walletId: z.string().uuid(),
  paymentId: z.string().uuid().optional(),
  type: TransactionTypeSchema,
  amount: z.number(),
  currency: z.string().default('TRY'),
  balanceBefore: z.number(),
  balanceAfter: z.number(),
  description: z.string(),
  referenceId: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Transaction filter schema
 */
export const TransactionFilterSchema = z.object({
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).max(100).default(20),
  type: TransactionTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  search: z.string().optional(),
});

export type TransactionFilter = z.infer<typeof TransactionFilterSchema>;

/**
 * Paginated transaction response schema
 */
export const PaginatedTransactionResponseSchema = z.object({
  content: z.array(TransactionSchema),
  totalElements: z.number().int(),
  totalPages: z.number().int(),
  currentPage: z.number().int(),
  pageSize: z.number().int(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
  isFirst: z.boolean(),
  isLast: z.boolean(),
});

export type PaginatedTransactionResponse = z.infer<
  typeof PaginatedTransactionResponseSchema
>;

/**
 * Payment status schema
 */
export const PaymentStatusSchema = z.enum([
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);

/**
 * Payment schema
 */
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  payerId: z.string().uuid(),
  payeeId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().default('TRY'),
  platformFee: z.number().min(0),
  netAmount: z.number().min(0),
  status: PaymentStatusSchema,
  paymentMethod: z.string(),
  iyzicoPaymentId: z.string().optional(),
  iyzicoTransactionId: z.string().optional(),
  description: z.string().optional(),
  failureReason: z.string().optional(),
  refundedAmount: z.number().min(0).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Payment = z.infer<typeof PaymentSchema>;

/**
 * Payment intent schema
 */
export const PaymentIntentSchema = z.object({
  id: z.string(),
  clientSecret: z.string(),
  amount: z.number().min(0),
  currency: z.string().default('TRY'),
  status: z.enum([
    'REQUIRES_PAYMENT_METHOD',
    'REQUIRES_CONFIRMATION',
    'REQUIRES_ACTION',
    'PROCESSING',
    'SUCCEEDED',
    'CANCELED',
  ]),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;

/**
 * Payout status schema
 */
export const PayoutStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

/**
 * Payout method schema
 */
export const PayoutMethodSchema = z.enum(['BANK_TRANSFER', 'IYZICO']);

/**
 * Payout schema
 */
export const PayoutSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().default('TRY'),
  status: PayoutStatusSchema,
  method: PayoutMethodSchema,
  paymentMethodId: z.string().uuid().optional(),
  paymentMethodDetails: z.string().optional(),
  iyzicoPayoutId: z.string().optional(),
  iyzicoTransferId: z.string().optional(),
  description: z.string().optional(),
  failureReason: z.string().optional(),
  adminNotes: z.string().optional(),
  requestedAt: z.string().datetime(),
  processedAt: z.string().datetime().optional(),
  processedBy: z.string().uuid().optional(),
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Payout = z.infer<typeof PayoutSchema>;

/**
 * Payout limits schema
 */
export const PayoutLimitsSchema = z.object({
  minimum: z.number().min(0),
  maximum: z.number().min(0),
});

export type PayoutLimits = z.infer<typeof PayoutLimitsSchema>;

/**
 * Payout eligibility schema
 */
export const PayoutEligibilitySchema = z.object({
  eligible: z.boolean(),
  minimumAmount: z.number().min(0),
  maximumAmount: z.number().min(0),
  availableBalance: z.number().min(0),
  pendingPayouts: z.number().min(0),
  reason: z.string().optional(),
});

export type PayoutEligibility = z.infer<typeof PayoutEligibilitySchema>;

// ============================================================================
// Wallet Analytics Schemas
// ============================================================================

/**
 * Earnings data point schema (for trend charts)
 */
export const EarningsDataPointSchema = z.object({
  date: z.string(), // ISO date string (YYYY-MM-DD)
  amount: z.number().min(0),
  transactionCount: z.number().int().min(0),
});

export type EarningsDataPoint = z.infer<typeof EarningsDataPointSchema>;

/**
 * Earnings trend response schema
 */
export const EarningsTrendResponseSchema = z.object({
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  currentPeriod: z.object({
    totalEarnings: z.number().min(0),
    averagePerDay: z.number().min(0),
    transactionCount: z.number().int().min(0),
  }),
  previousPeriod: z.object({
    totalEarnings: z.number().min(0),
    averagePerDay: z.number().min(0),
    transactionCount: z.number().int().min(0),
  }),
  comparison: z.object({
    earningsChange: z.number(), // Percentage change
    transactionChange: z.number(), // Percentage change
  }),
  dataPoints: z.array(EarningsDataPointSchema),
});

export type EarningsTrendResponse = z.infer<typeof EarningsTrendResponseSchema>;

/**
 * Revenue category schema
 */
export const RevenueCategorySchema = z.object({
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  revenue: z.number().min(0),
  percentage: z.number().min(0).max(100),
  orderCount: z.number().int().min(0),
});

export type RevenueCategory = z.infer<typeof RevenueCategorySchema>;

/**
 * Revenue breakdown response schema
 */
export const RevenueBreakdownResponseSchema = z.object({
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  totalRevenue: z.number().min(0),
  categories: z.array(RevenueCategorySchema),
  topCategory: RevenueCategorySchema.optional(),
});

export type RevenueBreakdownResponse = z.infer<
  typeof RevenueBreakdownResponseSchema
>;

/**
 * Transaction type summary schema
 */
export const TransactionTypeSummarySchema = z.object({
  type: TransactionTypeSchema,
  count: z.number().int().min(0),
  totalAmount: z.number(),
  percentage: z.number().min(0).max(100),
});

export type TransactionTypeSummary = z.infer<
  typeof TransactionTypeSummarySchema
>;

/**
 * Transaction summary response schema
 */
export const TransactionSummaryResponseSchema = z.object({
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  income: z.object({
    total: z.number().min(0),
    count: z.number().int().min(0),
    average: z.number().min(0),
  }),
  expenses: z.object({
    total: z.number().min(0),
    count: z.number().int().min(0),
    average: z.number().min(0),
  }),
  netIncome: z.number(),
  transactionsByType: z.array(TransactionTypeSummarySchema),
});

export type TransactionSummaryResponse = z.infer<
  typeof TransactionSummaryResponseSchema
>;

// ============================================================================
// Validation Helper
// ============================================================================

/**
 * Validates data against a Zod schema and throws ValidationError on failure
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to field-level errors
      const fieldErrors: Record<string, string[]> = {};

      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      const message = context
        ? `${context} doğrulaması başarısız oldu`
        : 'Yanıt doğrulaması başarısız oldu';

      throw new ValidationError(message, fieldErrors);
    }
    throw error;
  }
}

/**
 * Validates data and returns null on failure (non-throwing version)
 */
export function validateResponseSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}
