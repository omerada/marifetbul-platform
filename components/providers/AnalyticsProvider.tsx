'use client';

/**
 * Analytics Provider
 *
 * Initializes Google Analytics and tracks page views automatically
 * Wraps the app to provide analytics context
 */

import { useEffect } from 'react';
import Script from 'next/script';
import {
  initGA,
  getGATrackingId,
} from '@/lib/infrastructure/monitoring/analytics';
import { usePageTracking } from '@/hooks/infrastructure/integrations/useAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Component that tracks page views
 */
function PageViewTracker() {
  usePageTracking();
  return null;
}

/**
 * Analytics Provider Component
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const gaTrackingId = getGATrackingId();
  const isEnabled = !!gaTrackingId;

  useEffect(() => {
    if (isEnabled) {
      initGA();
    }
  }, [isEnabled]);

  return (
    <>
      {/* Google Analytics Scripts */}
      {isEnabled && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaTrackingId}', {
                  page_path: window.location.pathname,
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      )}

      {/* Page View Tracker */}
      {isEnabled && <PageViewTracker />}

      {children}
    </>
  );
}

export default AnalyticsProvider;
