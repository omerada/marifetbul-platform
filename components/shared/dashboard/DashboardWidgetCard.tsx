/**
 * ================================================
 * DASHBOARD WIDGET CARD - Shared Component
 * ================================================
 * Reusable wrapper for all admin dashboard widgets
 * Provides consistent styling, loading states, and error handling
 *
 * @module components/shared/dashboard
 * @since Sprint 1 - Story 4
 */

'use client';

import React, { type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Common props for all dashboard widgets
 */
export interface DashboardWidgetProps {
  /** Widget title */
  title?: string;

  /** Optional subtitle or description */
  subtitle?: string;

  /** Loading state */
  loading?: boolean;

  /** Error message */
  error?: string | null;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Additional CSS classes */
  className?: string;

  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;

  /** Custom actions in header */
  actions?: ReactNode;

  /** Show refresh button */
  showRefreshButton?: boolean;
}

interface DashboardWidgetCardProps extends DashboardWidgetProps {
  /** Widget content */
  children: ReactNode;

  /** Custom loading component */
  loadingComponent?: ReactNode;

  /** Custom error component */
  errorComponent?: ReactNode;
}

/**
 * Default loading skeleton
 */
function DefaultLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 rounded bg-gray-200"></div>
      <div className="space-y-3">
        <div className="h-20 rounded bg-gray-200"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 rounded bg-gray-200"></div>
          <div className="h-16 rounded bg-gray-200"></div>
          <div className="h-16 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Default error display
 */
function DefaultErrorDisplay({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm font-medium">{error}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tekrar Dene
        </Button>
      )}
    </div>
  );
}

/**
 * Dashboard Widget Card Component
 *
 * @example
 * ```tsx
 * <DashboardWidgetCard
 *   title="System Health"
 *   subtitle="Real-time monitoring"
 *   loading={isLoading}
 *   error={error}
 *   onRefresh={handleRefresh}
 *   showRefreshButton
 * >
 *   <YourWidgetContent />
 * </DashboardWidgetCard>
 * ```
 */
export function DashboardWidgetCard({
  title,
  subtitle,
  loading = false,
  error = null,
  onRefresh,
  className,
  children,
  actions,
  showRefreshButton = true,
  loadingComponent,
  errorComponent,
}: DashboardWidgetCardProps) {
  // ================================================
  // RENDER - Loading State
  // ================================================

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          {title && (
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          )}
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          {loadingComponent || <DefaultLoadingSkeleton />}
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // RENDER - Error State
  // ================================================

  if (error) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          {title && (
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          )}
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent>
          {errorComponent || (
            <DefaultErrorDisplay error={error} onRetry={onRefresh} />
          )}
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // RENDER - Content
  // ================================================

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex-1">
          {title && (
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          )}
          {subtitle && (
            <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions}

          {showRefreshButton && onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
              title="Yenile"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default DashboardWidgetCard;
