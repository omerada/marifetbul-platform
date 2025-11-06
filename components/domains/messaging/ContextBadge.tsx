'use client';

import { memo } from 'react';
import {
  ShoppingCart,
  FileText,
  Briefcase,
  Box,
  ExternalLink,
} from 'lucide-react';
import type { ContextType } from '@/types/business/features/messaging';

interface ContextBadgeProps {
  /** Context type (ORDER, PROPOSAL, JOB, PACKAGE) */
  contextType: ContextType;
  /** Context title */
  title?: string;
  /** Context ID for navigation */
  contextId?: string;
  /** Show link icon */
  showLink?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Get icon component for context type
 */
function getContextIcon(contextType: ContextType) {
  switch (contextType) {
    case 'ORDER':
      return ShoppingCart;
    case 'PROPOSAL':
      return FileText;
    case 'JOB':
      return Briefcase;
    case 'PACKAGE':
      return Box;
  }
}

/**
 * Get color classes for context type
 */
function getContextColor(contextType: ContextType) {
  switch (contextType) {
    case 'ORDER':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/50',
      };
    case 'PROPOSAL':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:bg-purple-200 dark:hover:bg-purple-900/50',
      };
    case 'JOB':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:bg-green-200 dark:hover:bg-green-900/50',
      };
    case 'PACKAGE':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/50',
      };
  }
}

/**
 * Get display label for context type
 */
function getContextLabel(contextType: ContextType): string {
  switch (contextType) {
    case 'ORDER':
      return 'Sipariş';
    case 'PROPOSAL':
      return 'Teklif';
    case 'JOB':
      return 'İş İlanı';
    case 'PACKAGE':
      return 'Paket';
  }
}

/**
 * Get size classes
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        container: 'px-2 py-0.5 text-xs gap-1',
        icon: 'h-3 w-3',
      };
    case 'md':
      return {
        container: 'px-3 py-1 text-sm gap-1.5',
        icon: 'h-4 w-4',
      };
    case 'lg':
      return {
        container: 'px-4 py-2 text-base gap-2',
        icon: 'h-5 w-5',
      };
  }
}

/**
 * ContextBadge Component
 *
 * Reusable badge for displaying context information (Order, Proposal, Job, Package).
 *
 * Features:
 * - Color-coded by context type
 * - Icon + label + optional title
 * - Clickable with hover effect
 * - Link icon for navigation
 * - Size variants (sm, md, lg)
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <ContextBadge
 *   contextType="ORDER"
 *   title="Web Sitesi Geliştirme"
 *   contextId="order-123"
 *   showLink={true}
 *   onClick={() => router.push(`/orders/${contextId}`)}
 * />
 * ```
 */
export const ContextBadge = memo(function ContextBadge({
  contextType,
  title,
  contextId,
  showLink = false,
  size = 'md',
  className = '',
  onClick,
}: ContextBadgeProps) {
  const Icon = getContextIcon(contextType);
  const colors = getContextColor(contextType);
  const label = getContextLabel(contextType);
  const sizes = getSizeClasses(size);

  const badgeClasses = `
    inline-flex items-center rounded-full font-medium
    ${sizes.container}
    ${colors.bg}
    ${colors.text}
    ${colors.border}
    border
    ${onClick ? `cursor-pointer transition-colors ${colors.hover}` : ''}
    ${className}
  `.trim();

  const content = (
    <>
      <Icon className={sizes.icon} />
      <span>{label}</span>
      {title && (
        <>
          <span className="opacity-50">•</span>
          <span className="max-w-[200px] truncate">{title}</span>
        </>
      )}
      {showLink && contextId && (
        <ExternalLink className={`${sizes.icon} opacity-70`} />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={badgeClasses}
        onClick={onClick}
        aria-label={`${label}: ${title || contextId}`}
      >
        {content}
      </button>
    );
  }

  return <div className={badgeClasses}>{content}</div>;
});
