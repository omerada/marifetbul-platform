/**
 * ================================================
 * WIDGET HEADER - Shared Component
 * ================================================
 * Standardized header for dashboard widgets
 * Provides consistent title, subtitle, and action buttons
 *
 * @module components/shared/dashboard
 * @since Sprint 1 - Story 4
 */

'use client';

import React, { type ReactNode } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { RefreshCw, Download, Filter, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WidgetHeaderProps {
  /** Header title */
  title: string;

  /** Optional subtitle */
  subtitle?: string;

  /** Badge text (e.g., "Live", "Updated 2m ago") */
  badge?: string;

  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';

  /** Show refresh button */
  showRefresh?: boolean;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Is refreshing (shows spinner) */
  isRefreshing?: boolean;

  /** Show download button */
  showDownload?: boolean;

  /** Download callback */
  onDownload?: () => void;

  /** Show filter button */
  showFilter?: boolean;

  /** Filter callback */
  onFilter?: () => void;

  /** Show settings button */
  showSettings?: boolean;

  /** Settings callback */
  onSettings?: () => void;

  /** Custom actions */
  actions?: ReactNode;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Widget Header Component
 *
 * @example
 * ```tsx
 * <WidgetHeader
 *   title="System Health"
 *   subtitle="Real-time monitoring"
 *   badge="Live"
 *   badgeVariant="success"
 *   showRefresh
 *   onRefresh={handleRefresh}
 *   isRefreshing={loading}
 * />
 * ```
 */
export function WidgetHeader({
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
  showRefresh = false,
  onRefresh,
  isRefreshing = false,
  showDownload = false,
  onDownload,
  showFilter = false,
  onFilter,
  showSettings = false,
  onSettings,
  actions,
  className,
}: WidgetHeaderProps) {
  return (
    <div
      className={cn('flex items-start justify-between space-y-0', className)}
    >
      {/* Left side - Title & Subtitle */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg leading-none font-semibold tracking-tight">
            {title}
          </h3>

          {badge && (
            <Badge variant={badgeVariant as never} className="text-xs">
              {badge}
            </Badge>
          )}
        </div>

        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1">
        {/* Refresh */}
        {showRefresh && onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
            title="Yenile"
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
            />
          </Button>
        )}

        {/* Download */}
        {showDownload && onDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="h-8 w-8 p-0"
            title="İndir"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}

        {/* Filter */}
        {showFilter && onFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilter}
            className="h-8 w-8 p-0"
            title="Filtrele"
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}

        {/* Settings */}
        {showSettings && onSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="h-8 w-8 p-0"
            title="Ayarlar"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {/* Custom Actions */}
        {actions}
      </div>
    </div>
  );
}

export default WidgetHeader;
