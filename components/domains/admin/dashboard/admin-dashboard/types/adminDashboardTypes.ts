/**
 * AdminDashboard Types
 *
 * Type definitions for admin dashboard components
 */

import type { LucideIcon } from 'lucide-react';
import type { SecurityAlert, SystemHealth } from '@/types';

// ============================================================================
// Core Types
// ============================================================================

export interface StatCard {
  title: string;
  name: string; // Used for color config
  value: string;
  change: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple';
  trend: 'up' | 'down';
  growth?: string;
}

export interface ActivityItem {
  icon: LucideIcon;
  color: 'blue' | 'green' | 'emerald' | 'red';
  title: string;
  time: string;
  detail: string;
}

export interface PendingTask {
  icon: LucideIcon;
  title: string;
  description: string;
  count: number;
  color: 'orange' | 'red' | 'blue' | 'purple';
}

export interface DemoFeature {
  label: string;
  status: 'Aktif' | 'Canlı' | 'Hazır' | 'Yapılandırıldı';
}

// ============================================================================
// Color Configuration Types
// ============================================================================

export interface ColorConfig {
  text: string;
  bg: string;
  border: string;
  gradient: string;
}

export interface PriorityConfig {
  bg: string;
  border: string;
  dot: string;
  badge: string;
}

// ============================================================================
// Component Props
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DashboardLoadingStateProps {
  // No props - static skeleton
}

export interface DashboardErrorStateProps {
  error: string;
  onRetry: () => void;
}

export interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated?: Date;
}

export interface DemoInfoCardProps {
  features?: DemoFeature[];
}

export interface SystemHealthAlertProps {
  systemHealth: SystemHealth | null | undefined;
}

export interface StatsGridProps {
  stats: StatCard[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PerformanceSectionProps {
  // PerformanceMonitor component is self-contained
}

export interface RecentActivityCardProps {
  activities?: ActivityItem[];
}

export interface SecurityAlertsCardProps {
  alerts: SecurityAlert[];
  onAlertAction: (
    alertId: string,
    action: 'read' | 'dismiss'
  ) => void | Promise<void>;
}

export interface SystemHealthCardProps {
  systemHealth: SystemHealth | null | undefined;
}

export interface PendingTasksCardProps {
  tasks?: PendingTask[];
}
