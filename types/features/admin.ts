// Admin panel types
import { User } from '../core/base';
import { PaginationMeta } from '../utils/api';

export type UserRole =
  | 'freelancer'
  | 'employer'
  | 'admin'
  | 'super_admin'
  | 'moderator';

// User Analytics interface for store compatibility
export interface UserAnalytics {
  userId: string;
  userStats: {
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    totalEarnings: number;
    avgRating: number;
  };
  activityStats: {
    loginCount: number;
    lastLoginDate: string;
    averageSessionDuration: number;
    profileViews: number;
  };
  engagementStats: {
    messagesExchanged: number;
    reviewsGiven: number;
    reviewsReceived: number;
    referralsCount: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  averageSessionDuration: number;
  topLocations: Array<{
    location: string;
    count: number;
  }>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
}

export interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    maxFileUploadSize?: number; // MSW handler compatibility
  };
  features: {
    enableJobPosting: boolean;
    enableServicePackages: boolean;
    enableEscrow: boolean;
    enableDirectPayments: boolean;
    enableReviews: boolean;
    enableMessaging: boolean;
    emailVerificationRequired?: boolean; // Store compatibility
    userRegistration?: boolean; // MSW handler compatibility
    profileVerification?: boolean; // MSW handler compatibility
  };
  payments: {
    commissionRate: number;
    minimumPayout: number;
    paymentMethods: string[];
    currencies: string[];
    defaultCurrency: string;
    platformFee?: number; // Store compatibility
  };
  // Store compatibility - additional settings sections
  payment?: {
    platformFee: number;
    minimumWithdrawal?: number; // MSW handler compatibility
  };
  security?: {
    twoFactorAuth: boolean;
    passwordRequirements?: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
    }; // MSW handler compatibility
  };
  email?: Record<string, unknown>;
  content?: Record<string, unknown>;
  api?: Record<string, unknown>;
  integrations?: Record<string, unknown>;
  maintenance?: {
    isMaintenanceMode: boolean;
    maintenanceMessage?: string; // MSW handler compatibility
    scheduledMaintenance?: unknown[]; // MSW handler compatibility
  };
  moderation: {
    autoModeration: boolean;
    moderationQueue: boolean;
    requireApproval: boolean;
    contentFilters: string[];
  };
}

// Missing admin types from store imports
export interface AdminUserStore {
  users: AdminUserData[]; // Changed to AdminUserData for component compatibility
  currentUser: AdminUserData | null; // Changed to AdminUserData
  selectedUser: AdminUserData | null; // Changed to AdminUserData for compatibility
  totalUsers: number;
  pagination: PaginationMeta | null; // Store allows null initially
  filters: EmptyUserFilters; // Use EmptyUserFilters for initial compatibility
  isLoading: boolean;
  error: string | null;
  bulkSelectedIds: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  // Store method signatures for type compatibility
  fetchUsers: (filters?: UserFilters) => Promise<void>; // Added filters parameter
  fetchUserById: (userId: string) => Promise<void>; // Added missing method
  updateUser: (userId: string, data: Partial<AdminUserData>) => Promise<void>; // Use AdminUserData for compatibility
  performUserAction: (request: UserActionRequest) => Promise<void>; // Added missing method
  performBulkAction: (action: BulkUserActionRequest) => Promise<void>;
  setFilters: (filters: Partial<UserFilters>) => void; // Added missing method
  selectUser: (user: AdminUserData | null) => void; // Updated to use AdminUserData
  toggleBulkSelection: (userId: string) => void; // Added missing method
  selectAllUsers: () => void; // Added missing method
  clearBulkSelection: () => void; // Added missing method
  clearError: () => void; // Added missing method
}

export interface AdminUserData extends AdminUser {
  statistics: {
    actionsPerformed: number;
    usersModerated: number;
    ticketsResolved: number;
  };
  deletedAt?: string;
  // Additional fields from main index.ts for compatibility
  email: string;
  name: string;
  userType: 'freelancer' | 'employer';
  accountStatus: 'active' | 'suspended' | 'banned';
  verificationStatus: 'verified' | 'unverified' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  profileCompletion: number;
  totalJobs?: number;
  totalEarnings?: number;
  rating?: number;
  reviewCount?: number;
  firstName?: string;
  lastName?: string;
  location?: string;
  joinDate?: string;
  totalOrders?: number;
  successRate?: number;
  disputeCount?: number;
  riskScore?: number;
  totalSpent?: number;
  verificationBadges?: string[];
  loginCount?: number;
  warningCount?: number;
  updatedAt?: string;
  suspensionHistory?: Array<{
    id: string;
    reason: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    moderatorId: string;
  }>;
  // MSW Handler compatibility fields
  role?: UserRole;
  adminPermissions?: AdminPermission[]; // Use correct type
  departments?: string[];
  isActive?: boolean;
}

export interface UserFilters {
  search?: string; // Made optional for hook compatibility
  status?:
    | 'all'
    | 'active'
    | 'suspended'
    | 'banned'
    | string[]
    | ('all' | 'active' | 'suspended' | 'banned')[];
  userType?: 'all' | 'freelancer' | 'employer';
  verificationStatus?: 'all' | 'verified' | 'unverified' | 'pending';
  registrationDate?: {
    from: Date | null;
    to: Date | null;
  }; // Made optional for hook compatibility
  country?: string; // Made optional for hook compatibility
  adminLevel?: 'super_admin' | 'admin' | 'moderator' | 'all';
  sort?: string; // For hooks compatibility
}

// Alternative empty UserFilters for initial state compatibility
export interface EmptyUserFilters extends Partial<UserFilters> {
  search?: string;
  status?:
    | 'all'
    | 'active'
    | 'suspended'
    | 'banned'
    | string[]
    | ('all' | 'active' | 'suspended' | 'banned')[];
  userType?: 'all' | 'freelancer' | 'employer';
  verificationStatus?: 'all' | 'verified' | 'unverified' | 'pending';
  registrationDate?: {
    from: Date | null;
    to: Date | null;
  };
  country?: string;
  adminLevel?: 'super_admin' | 'admin' | 'moderator' | 'all';
  sort?: string; // For hooks compatibility
}

export interface UserActionRequest {
  userId: string;
  action:
    | 'suspend'
    | 'unsuspend'
    | 'ban'
    | 'unban'
    | 'verify'
    | 'unverify'
    | 'promote'
    | 'demote';
  reason?: string;
  duration?: number; // in days
  endDate?: string; // For handler compatibility
  adminNote?: string;
}

export interface BulkUserActionRequest {
  userIds: string[];
  action:
    | 'suspend'
    | 'unsuspend'
    | 'ban'
    | 'unban'
    | 'verify'
    | 'unverify'
    | 'delete';
  reason?: string;
  duration?: number;
  adminNote?: string;
}

export interface AdminUser
  extends Omit<User, 'permissions' | 'role' | 'updatedAt'> {
  role?: UserRole; // Made optional for MSW compatibility
  adminPermissions?: AdminPermission[]; // Made optional for MSW compatibility
  departments?: string[]; // Made optional for MSW compatibility
  lastLoginAt?: string;
  isActive?: boolean; // Made optional for MSW compatibility
  createdBy?: string;
  notes?: string;
  updatedAt?: string; // Made optional for compatibility
}

export interface AdminPermission {
  resource: AdminResource;
  actions: AdminAction[];
  conditions?: PermissionCondition[];
}

export type AdminResource =
  | 'users'
  | 'jobs'
  | 'orders'
  | 'payments'
  | 'reviews'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'content'
  | 'categories'
  | 'packages'
  | 'disputes'
  | 'notifications'
  | 'system';

export type AdminAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'activate'
  | 'export'
  | 'import';

export interface PermissionCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'in'
    | 'not_in'
    | 'greater_than'
    | 'less_than';
  value: unknown;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  revenueToday: number;
  disputeCount: number;
  reportCount: number;
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export interface AdminReport {
  id: string;
  type: AdminReportType;
  title: string;
  description?: string;
  reporterId: string;
  targetId?: string;
  targetType?: 'user' | 'job' | 'order' | 'review' | 'message';
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence?: string[];
  createdAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
  actions?: AdminAction[];
}

export type AdminReportType =
  | 'user_violation'
  | 'content_violation'
  | 'fraud'
  | 'spam'
  | 'harassment'
  | 'copyright'
  | 'quality_issue'
  | 'payment_dispute'
  | 'system_bug'
  | 'feature_request';

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  resource: AdminResource;
  targetId?: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  moderationEnabled: boolean;
  defaultCurrency: string;
  supportedCurrencies: string[];
  commissionRate: number;
  minWithdrawal: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  socialMediaLinks: SocialMediaLinks;
  emailSettings: EmailSettings;
  seoSettings: SEOSettings;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  robotsTxt: string;
  sitemapEnabled: boolean;
}

export interface ContentModerationRule {
  id: string;
  name: string;
  type: 'keyword' | 'pattern' | 'ml_model';
  target: 'title' | 'description' | 'comment' | 'message' | 'all';
  rule: string;
  action: 'flag' | 'auto_reject' | 'require_approval';
  severity: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSettingsStore {
  settings: PlatformSettings | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  pendingChanges: Partial<PlatformSettings>;
  hasPendingChanges: boolean;
  hasUnsavedChanges?: boolean; // Store compatibility
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<PlatformSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  savePendingChanges: () => Promise<void>;
  discardPendingChanges: () => void;
  updatePendingSetting: (key: string, value: unknown) => void;
  exportSettings: () => Promise<void>; // Store compatibility
  importSettings: (settings: PlatformSettings) => Promise<void>; // Store compatibility
  clearError: () => void; // Hook compatibility
}

export interface GetAnalyticsResponse {
  users: UserStats;
  system: {
    uptime: number;
    performance: {
      responseTime: number;
      throughput: number;
    };
  };
  timestamp?: string; // For handler compatibility
}

export interface AdminNotification {
  id: string;
  type:
    | 'user_report'
    | 'system_alert'
    | 'payment_issue'
    | 'dispute'
    | 'security';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}
