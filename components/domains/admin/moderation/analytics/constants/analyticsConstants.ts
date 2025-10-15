/**
 * Moderation Analytics Constants
 *
 * Configuration constants for analytics system.
 */

import type { DateRangeType, TabType } from '../types/moderationAnalytics';

// Date Range Options
export const DATE_RANGE_OPTIONS = [
  { value: '1d' as DateRangeType, label: 'Son 24 Saat' },
  { value: '7d' as DateRangeType, label: 'Son 7 Gün' },
  { value: '30d' as DateRangeType, label: 'Son 30 Gün' },
  { value: '90d' as DateRangeType, label: 'Son 90 Gün' },
  { value: 'custom' as DateRangeType, label: 'Özel Tarih' },
];

// Refresh Interval Options
export const REFRESH_INTERVAL_OPTIONS = [
  { value: null, label: 'Manuel Yenileme' },
  { value: 30, label: '30 saniye' },
  { value: 60, label: '1 dakika' },
  { value: 300, label: '5 dakika' },
];

// Export Format Options
export const EXPORT_FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'pdf', label: 'PDF' },
];

// Tab Configurations
export const TAB_CONFIGURATIONS: Array<{
  id: TabType;
  label: string;
  icon: string;
}> = [
  { id: 'overview', label: 'Genel Bakış', icon: 'BarChart3' },
  { id: 'moderators', label: 'Moderatörler', icon: 'UserCheck' },
  { id: 'automation', label: 'Otomasyon', icon: 'Zap' },
  { id: 'risk', label: 'Risk Analizi', icon: 'AlertTriangle' },
  { id: 'reports', label: 'Raporlar', icon: 'FileText' },
];

// API Endpoints
export const API_ENDPOINTS = {
  analytics: '/api/moderation/analytics',
  export: '/api/moderation/analytics/export',
};

// Default Filters
export const DEFAULT_FILTERS = {
  dateRange: '7d' as DateRangeType,
  moderators: [],
  categories: [],
  contentTypes: [],
  actionTypes: [],
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6', // blue
  success: '#10b981', // green
  danger: '#ef4444', // red
  warning: '#f59e0b', // orange
  info: '#8b5cf6', // purple
  secondary: '#6b7280', // gray
};

// Workload Thresholds
export const WORKLOAD_THRESHOLDS = {
  light: 50,
  normal: 100,
  heavy: 150,
  overloaded: 200,
};

// Risk Score Thresholds
export const RISK_THRESHOLDS = {
  low: 0.3,
  medium: 0.5,
  high: 0.7,
  critical: 0.9,
};
