/**
 * Appeal Helper Utilities
 *
 * Reusable utility functions for content appeal system.
 * Extracted from ContentAppealSystem.tsx for better maintainability.
 */

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import type {
  AppealStatus,
  AppealPriority,
  AppealReason,
} from '../types/appeal';

/**
 * Get icon component for appeal status
 */
export function getStatusIcon(status: AppealStatus): LucideIcon {
  const iconMap: Record<AppealStatus, LucideIcon> = {
    pending: Clock,
    under_review: Eye,
    approved: CheckCircle,
    rejected: XCircle,
    escalated: AlertTriangle,
  };

  return iconMap[status] || AlertCircle;
}

/**
 * Get Tailwind CSS classes for status badge
 */
export function getStatusColor(status: AppealStatus): string {
  const colorMap: Record<AppealStatus, string> = {
    pending: 'bg-orange-100 text-orange-800 border-orange-200',
    under_review: 'bg-blue-100 text-blue-800 border-blue-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    escalated: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get Tailwind CSS classes for priority badge
 */
export function getPriorityColor(priority: AppealPriority): string {
  const colorMap: Record<AppealPriority, string> = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };

  return colorMap[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get human-readable text for appeal reason
 */
export function getReasonText(reason: AppealReason): string {
  const reasonMap: Record<AppealReason, string> = {
    incorrect_decision: 'Yanlış Karar',
    content_misunderstood: 'İçerik Yanlış Anlaşıldı',
    policy_misapplied: 'Politika Yanlış Uygulandı',
    technical_error: 'Teknik Hata',
    other: 'Diğer',
  };

  return reasonMap[reason] || reason;
}

/**
 * Get human-readable text for status
 */
export function getStatusText(status: AppealStatus): string {
  const statusMap: Record<AppealStatus, string> = {
    pending: 'Bekleyen',
    under_review: 'İnceleniyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    escalated: 'Yükseltildi',
  };

  return statusMap[status] || status;
}

/**
 * Get human-readable text for priority
 */
export function getPriorityText(priority: AppealPriority): string {
  const priorityMap: Record<AppealPriority, string> = {
    urgent: 'Acil',
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük',
  };

  return priorityMap[priority] || priority;
}

/**
 * Format date string to Turkish locale
 */
export function formatAppealDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return formatAppealDate(dateString);
}

/**
 * Get color class for reviewer success rate
 */
export function getSuccessRateColor(successRate: number): string {
  if (successRate >= 90) return 'text-green-600';
  if (successRate >= 75) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Calculate urgency score based on priority and age
 */
export function calculateUrgencyScore(
  priority: AppealPriority,
  createdAt: string,
  dueDate?: string
): number {
  const priorityWeight: Record<AppealPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const ageHours =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const ageScore = Math.min(ageHours / 24, 5); // Max 5 points for age

  let dueDateScore = 0;
  if (dueDate) {
    const hoursUntilDue =
      (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilDue < 24) dueDateScore = 3;
    else if (hoursUntilDue < 72) dueDateScore = 2;
    else dueDateScore = 1;
  }

  return priorityWeight[priority] + ageScore + dueDateScore;
}

/**
 * Check if appeal is overdue
 */
export function isAppealOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

/**
 * Format time duration in hours to human-readable format
 */
export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} dakika`;
  if (hours < 24) return `${hours.toFixed(1)} saat`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days} gün`;
  return `${days} gün ${remainingHours.toFixed(0)} saat`;
}
