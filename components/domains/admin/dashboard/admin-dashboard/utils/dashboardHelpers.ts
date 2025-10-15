/**
 * Dashboard Helper Functions
 *
 * Pure utility functions for dashboard formatting and calculations
 */

import type {
  ColorConfig,
  PriorityConfig,
  StatCard,
} from '../types/adminDashboardTypes';
import {
  STAT_COLOR_CONFIG,
  PRIORITY_CONFIG,
  STAT_CARDS_CONFIG,
} from './dashboardConstants';

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format number with Turkish locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR').format(num);
}

/**
 * Format currency in Turkish Lira
 */
export function formatCurrency(amount: number): string {
  return `₺${new Intl.NumberFormat('tr-TR').format(amount)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `%${value}`;
}

// ============================================================================
// Color Configuration Helpers
// ============================================================================

/**
 * Get color configuration for stat cards
 */
export function getStatColorConfig(color: string): ColorConfig {
  return (
    STAT_COLOR_CONFIG[color as keyof typeof STAT_COLOR_CONFIG] ||
    STAT_COLOR_CONFIG.blue
  );
}

/**
 * Get priority configuration for alerts
 */
export function getPriorityConfig(priority: string): PriorityConfig {
  return (
    PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ||
    PRIORITY_CONFIG.low
  );
}

// ============================================================================
// Data Transformation Helpers
// ============================================================================

/**
 * Build stat cards from API data
 */
export function buildStatCards(
  stats: {
    totalUsers?: number;
    newUsersToday?: number;
    monthlyRevenue?: number;
    revenueGrowth?: number;
    pendingOrders?: number;
    completedOrders?: number;
    conversionRate?: number;
    userRetentionRate?: number;
  } | null
): StatCard[] {
  if (!stats) return [];

  return [
    {
      ...STAT_CARDS_CONFIG[0],
      value: formatNumber(stats.totalUsers || 0),
      change: `+${stats.newUsersToday ?? 0} bugün`,
    },
    {
      ...STAT_CARDS_CONFIG[1],
      value: formatCurrency(stats.monthlyRevenue || 0),
      change: `${formatPercentage(stats.revenueGrowth ?? 0)} büyüme`,
    },
    {
      ...STAT_CARDS_CONFIG[2],
      value: formatNumber(stats.pendingOrders || 0),
      change: `${stats.completedOrders ?? 0} tamamlandı`,
    },
    {
      ...STAT_CARDS_CONFIG[3],
      value: formatPercentage(stats.conversionRate ?? 0),
      change: `${formatPercentage(stats.userRetentionRate ?? 0)} tutma oranı`,
    },
  ];
}

/**
 * Format priority label for display
 */
export function formatPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    critical: 'Kritik',
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük',
  };
  return labels[priority] || priority;
}

/**
 * Format date/time in Turkish locale
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('tr-TR');
}
