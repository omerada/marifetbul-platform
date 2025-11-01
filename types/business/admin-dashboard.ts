/**
 * ================================================
 * ADMIN DASHBOARD API TYPES
 * ================================================
 * Enhanced types for Sprint 3.2
 *
 * @version 2.0.0 - Sprint 3.2: Admin Dashboard Enhancement
 * @author MarifetBul Development Team
 */

// ================================================
// SYSTEM HEALTH
// ================================================

export interface ServerStatus {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number; // seconds
  lastRestart: string; // ISO timestamp
  version: string;
  environment: 'production' | 'staging' | 'development';
}

export interface DatabaseStatus {
  status: 'healthy' | 'warning' | 'critical';
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  responseTime: number; // milliseconds
  lastBackup: string; // ISO timestamp
}

export interface RedisStatus {
  status: 'healthy' | 'warning' | 'critical';
  connected: boolean;
  memory: {
    used: number; // bytes
    max: number; // bytes
    percentage: number;
  };
  keys: number;
  hitRate: number; // percentage
}

export interface APIPerformance {
  avgResponseTime: number; // milliseconds
  requestsPerMinute: number;
  errorRate: number; // percentage
  slowestEndpoint: {
    path: string;
    avgTime: number;
  };
}

export interface SystemHealthMetrics {
  server: ServerStatus;
  database: DatabaseStatus;
  redis: RedisStatus;
  api: APIPerformance;
  timestamp: string;
}

// ================================================
// BUSINESS METRICS
// ================================================

export interface RevenueData {
  total: number;
  currency: string;
  period: 'today' | 'week' | 'month' | 'year';
  previousPeriod: number;
  percentageChange: number;
  chart: {
    labels: string[];
    values: number[];
  };
}

export interface OrderMetrics {
  active: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalValue: number;
  avgOrderValue: number;
}

export interface UserGrowthMetrics {
  total: number;
  new: number; // last 30 days
  active: number; // last 30 days
  byRole: {
    freelancers: number;
    employers: number;
  };
  growthRate: number; // percentage
  chart: {
    labels: string[];
    values: number[];
  };
}

export interface RefundMetrics {
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  avgProcessingTime: number; // hours
}

export interface BusinessMetrics {
  revenue: RevenueData;
  orders: OrderMetrics;
  users: UserGrowthMetrics;
  refunds: RefundMetrics;
  timestamp: string;
}

// ================================================
// RECENT ACTIVITIES
// ================================================

export type ActivityType =
  | 'user_registration'
  | 'order_placed'
  | 'order_completed'
  | 'refund_approved'
  | 'user_banned'
  | 'dispute_created'
  | 'payment_received'
  | 'package_created'
  | 'review_flagged';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  icon?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export interface RecentActivitiesResponse {
  activities: RecentActivity[];
  total: number;
  hasMore: boolean;
}

// ================================================
// QUICK ACCESS
// ================================================

export interface QuickAccessCard {
  title: string;
  value: number;
  icon: string;
  href: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  description?: string;
}

export interface QuickAccessData {
  users: QuickAccessCard;
  orders: QuickAccessCard;
  disputes: QuickAccessCard;
  support: QuickAccessCard;
  moderation: QuickAccessCard;
}

// ================================================
// DASHBOARD RESPONSE
// ================================================

export interface EnhancedAdminDashboardResponse {
  systemHealth: SystemHealthMetrics;
  businessMetrics: BusinessMetrics;
  recentActivities: RecentActivitiesResponse;
  quickAccess: QuickAccessData;
  timestamp: string;
}

// ================================================
// EXPORT OPTIONS
// ================================================

export type ExportFormat = 'csv' | 'json' | 'xlsx';
export type ExportDataType = 'users' | 'orders' | 'revenue' | 'analytics';

export interface ExportRequest {
  dataType: ExportDataType;
  format: ExportFormat;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, unknown>;
}

export interface ExportResponse {
  success: boolean;
  downloadUrl: string;
  expiresAt: string;
  fileSize: number; // bytes
}
