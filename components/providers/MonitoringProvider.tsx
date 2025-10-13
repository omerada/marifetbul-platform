'use client';

/**
 * Monitoring Provider
 *
 * Centralizes all monitoring functionality:
 * - Error tracking (Sentry)
 * - Analytics (Google Analytics)
 * - Logging
 * - Performance monitoring
 */

import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AnalyticsProvider } from './AnalyticsProvider';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

/**
 * Monitoring Provider Component
 * Wraps app with error boundary and analytics
 */
export function MonitoringProvider({ children }: MonitoringProviderProps) {
  return (
    <ErrorBoundary>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </ErrorBoundary>
  );
}

export default MonitoringProvider;
