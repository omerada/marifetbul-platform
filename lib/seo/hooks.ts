import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * SEO analytics hook for tracking page views and user interactions
 */
export function useSEOTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: pathname,
        });
      }

      // Yandex Metrica (popular in Turkey)
      if (window.ym) {
        window.ym(process.env.NEXT_PUBLIC_YM_ID, 'hit', pathname);
      }

      // Custom analytics
      trackPageView(pathname);
    }
  }, [pathname]);

  return {
    trackEvent: (eventName: string, parameters?: Record<string, unknown>) => {
      if (typeof window !== 'undefined') {
        // Google Analytics 4
        if (window.gtag) {
          window.gtag('event', eventName, parameters);
        }

        // Yandex Metrica
        if (window.ym) {
          window.ym(
            process.env.NEXT_PUBLIC_YM_ID,
            'reachGoal',
            eventName,
            parameters
          );
        }

        // Custom analytics
        trackCustomEvent(eventName, parameters);
      }
    },
    trackConversion: (conversionName: string, value?: number) => {
      if (typeof window !== 'undefined') {
        // Google Analytics 4
        if (window.gtag) {
          window.gtag('event', 'conversion', {
            send_to: `${process.env.NEXT_PUBLIC_GA_ID}/${conversionName}`,
            value: value,
          });
        }

        // Track conversion in custom analytics
        trackConversion(conversionName, value);
      }
    },
  };
}

/**
 * Custom page view tracking
 */
function trackPageView(pathname: string) {
  // Send to your analytics backend
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'pageview',
        pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }),
    }).catch((error) =>
      logger.error(
        'Pageview tracking failed',
        error
      )
    );
  }
}

/**
 * Custom event tracking
 */
function trackCustomEvent(
  eventName: string,
  parameters?: Record<string, unknown>
) {
  // Send to your analytics backend
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'event',
        eventName,
        parameters,
        timestamp: new Date().toISOString(),
        pathname: window.location.pathname,
      }),
    }).catch((error) =>
      logger.error(
        'Custom event tracking failed',
        error
      )
    );
  }
}

/**
 * Custom conversion tracking
 */
function trackConversion(conversionName: string, value?: number) {
  // Send to your analytics backend
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'conversion',
        conversionName,
        value,
        timestamp: new Date().toISOString(),
        pathname: window.location.pathname,
      }),
    }).catch((error) =>
      logger.error(
        'Conversion tracking failed',
        error
      )
    );
  }
}

/**
 * Declare Yandex Metrica type
 */
declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

/**
 * SEO-friendly link tracking
 */
export function useLinkTracking() {
  return {
    trackExternalLink: (url: string, _linkText: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'click', {
          event_category: 'outbound',
          event_label: url,
          transport_type: 'beacon',
        });
      }
    },
    trackInternalLink: (pathname: string, linkText: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'click', {
          event_category: 'internal',
          event_label: pathname,
          custom_parameter: linkText,
        });
      }
    },
    trackDownload: (fileName: string, fileType: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'file_download', {
          file_name: fileName,
          file_extension: fileType,
        });
      }
    },
  };
}

/**
 * Search tracking for SEO insights
 */
export function useSearchTracking() {
  return {
    trackSearch: (query: string, resultsCount: number) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'search', {
          search_term: query,
          results_count: resultsCount,
        });
      }
    },
    trackSearchResultClick: (
      query: string,
      resultPosition: number,
      resultUrl: string
    ) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'select_content', {
          content_type: 'search_result',
          search_term: query,
          result_position: resultPosition,
          result_url: resultUrl,
        });
      }
    },
  };
}
