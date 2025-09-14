// Admin panel types
import { User } from '../core/base';
import { PaginationMeta } from '../utils/api';

export type UserRole =
  | 'freelancer'
  | 'employer'
  | 'admin'
  | 'super_admin'
  | 'moderator';

// Missing admin types from store imports
export interface AdminUserStore {
  users: AdminUser[];
  currentUser: AdminUser | null;
  totalUsers: number;
  pagination: PaginationMeta;
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
  bulkSelectedIds: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface AdminUserData extends AdminUser {
  statistics: {
    actionsPerformed: number;
    usersModerated: number;
    ticketsResolved: number;
  };
  deletedAt?: string;
}

export interface UserFilters {
  search: string;
  status: 'all' | 'active' | 'suspended' | 'banned';
  userType: 'all' | 'freelancer' | 'employer';
  verificationStatus: 'all' | 'verified' | 'unverified' | 'pending';
  registrationDate: {
    from: Date | null;
    to: Date | null;
  };
  country: string;
  adminLevel?: 'super_admin' | 'admin' | 'moderator' | 'all';
}

export interface UserActionRequest {
  userId: string;
  action: 'suspend' | 'ban' | 'unban' | 'verify' | 'promote' | 'demote';
  reason?: string;
  duration?: number; // in days
  adminNote?: string;
}

export interface BulkUserActionRequest {
  userIds: string[];
  action: 'suspend' | 'ban' | 'unban' | 'verify' | 'delete';
  reason?: string;
  duration?: number;
  adminNote?: string;
}

export interface AdminUser extends Omit<User, 'permissions' | 'role'> {
  role: UserRole;
  adminPermissions: AdminPermission[];
  departments: string[];
  lastLoginAt?: string;
  isActive: boolean;
  createdBy?: string;
  notes?: string;
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
