'use client';

/**
 * Monitoring Provider
 *
 * Centralizes all monitoring functionality:
 * - Error tracking (Sentry)
 * - Analytics (Google Analytics)
 * - Logging
 * - Performance monitoring
 *
 * Story 1.3: Migrated to UnifiedErrorBoundary for better error handling
 */

import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { AnalyticsProvider } from './AnalyticsProvider';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

/**
 * Monitoring Provider Component
 * Wraps app with error boundary and analytics
 *
 * Story 1.3: Using UnifiedErrorBoundary with global level error handling
 */
export function MonitoringProvider({ children }: MonitoringProviderProps) {
  return (
    <UnifiedErrorBoundary
      level="global"
      enableReporting={process.env.NODE_ENV === 'production'}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </UnifiedErrorBoundary>
  );
}

export default MonitoringProvider;
