/**
 * Analytics Helper Functions
 *
 * Reusable utility functions for analytics formatting and calculations.
 */

import {
  TrendingUp,
  TrendingDown,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import type {
  WorkloadType,
  StatusType,
  RiskLevelType,
} from '../types/moderationAnalytics';
import { formatCurrency as formatCurrencyCanonical } from '@/lib/shared/formatters';

/**
 * Get trend icon component based on trend value
 */
export function getTrendIcon(trend: number): LucideIcon {
  if (trend > 0) return TrendingUp;
  if (trend < 0) return TrendingDown;
  return Activity;
}

/**
 * Get Tailwind color classes for trend value
 */
export function getTrendColor(trend: number): string {
  if (trend > 0) return 'text-green-600';
  if (trend < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format duration from minutes to readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes.toFixed(1)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toFixed(0)}m`;
}

/**
 * Get Tailwind badge classes for workload type
 */
export function getWorkloadColor(workload: WorkloadType): string {
  switch (workload) {
    case 'light':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'normal':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'heavy':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'overloaded':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get Tailwind badge classes for status type
 */
export function getStatusColor(status: StatusType): string {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'busy':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'offline':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get Tailwind badge classes for risk level
 */
export function getRiskColor(level: RiskLevelType): string {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format date range for display
 */
export function formatDateRange(range: string): string {
  switch (range) {
    case '1d':
      return 'Son 24 Saat';
    case '7d':
      return 'Son 7 Gün';
    case '30d':
      return 'Son 30 Gün';
    case '90d':
      return 'Son 90 Gün';
    case 'custom':
      return 'Özel Tarih Aralığı';
    default:
      return range;
  }
}

/**
 * Format risk score as percentage
 */
export function formatRiskScore(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

/**
 * Determine workload level from action count
 */
export function calculateWorkload(actionCount: number): WorkloadType {
  if (actionCount >= 200) return 'overloaded';
  if (actionCount >= 150) return 'heavy';
  if (actionCount >= 100) return 'normal';
  return 'light';
}

/**
 * Format currency amount
 *
 * @deprecated Sprint 6 - Use formatCurrency from @/lib/shared/formatters
 * Kept as wrapper for backward compatibility
 */
export function formatCurrency(
  amount: number,
  currency: string = 'TRY'
): string {
  return formatCurrencyCanonical(amount, currency);
}
