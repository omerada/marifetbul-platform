// ==========================================
// MARKETPLACE CATEGORIES ANALYTICS
// ==========================================

import { CategoryAnalyticsEvent } from '@/types/business/features/marketplace-categories';
import { logger } from '@/lib/shared/utils/logger';

// Analytics service for category interactions
export class CategoryAnalytics {
  private static instance: CategoryAnalytics;
  private events: CategoryAnalyticsEvent[] = [];

  static getInstance(): CategoryAnalytics {
    if (!CategoryAnalytics.instance) {
      CategoryAnalytics.instance = new CategoryAnalytics();
    }
    return CategoryAnalytics.instance;
  }

  // Track category view
  trackCategoryView(
    categoryId: string,
    categoryTitle: string,
    source?: string
  ) {
    this.trackEvent('category_view', {
      categoryId,
      categoryTitle,
      source,
    });
  }

  // Track category click
  trackCategoryClick(
    categoryId: string,
    categoryTitle: string,
    source?: string
  ) {
    this.trackEvent('category_click', {
      categoryId,
      categoryTitle,
      source,
    });
  }

  // Track category search
  trackCategorySearch(searchTerm: string, resultsCount: number) {
    this.trackEvent('category_search', {
      searchTerm,
      source: `${resultsCount} results`,
    });
  }

  // Track filter usage
  trackFilterApply(filters: Record<string, string | number | boolean>) {
    this.trackEvent('filter_apply', {
      filters,
    });
  }

  // Track filter reset
  trackFilterReset() {
    this.trackEvent('filter_reset');
  }

  // Track sort change
  trackSortChange(sortBy: string) {
    this.trackEvent('sort_change', {
      source: sortBy,
    });
  }

  // Track CTA clicks
  trackCTAClick(
    ctaType: 'job_post' | 'contact' | 'view_services',
    categoryId?: string
  ) {
    this.trackEvent('cta_click', {
      source: ctaType,
      categoryId,
    });
  }

  // Internal track event method
  private trackEvent(
    event: CategoryAnalyticsEvent['event'],
    data?: Partial<CategoryAnalyticsEvent>
  ) {
    const analyticsEvent: CategoryAnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      ...data,
    };

    this.events.push(analyticsEvent);

    // In a real app, you would send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      logger.debug('📊 Analytics Event:', analyticsEvent);
    }

    // Send to analytics services (Google Analytics, Mixpanel, etc.)
    this.sendToAnalyticsServices(analyticsEvent);
  }

  // Get or generate session ID
  private getSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Get user ID if available
  private getUserId(): string | undefined {
    // This would come from your auth system
    return localStorage.getItem('userId') || undefined;
  }

  // Send to analytics services
  private sendToAnalyticsServices(event: CategoryAnalyticsEvent) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, {
        category_id: event.categoryId,
        category_title: event.categoryTitle,
        search_term: event.searchTerm,
        source: event.source,
        user_id: event.userId,
        session_id: event.sessionId,
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', event.event, {
        categoryId: event.categoryId,
        categoryTitle: event.categoryTitle,
        searchTerm: event.searchTerm,
        source: event.source,
      });
    }

    // Custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch((error) =>
        logger.error(
          'Analytics endpoint failed',
          error instanceof Error ? error : new Error(String(error))
        )
      );
    }
  }

  // Get events for debugging
  getEvents(): CategoryAnalyticsEvent[] {
    return this.events;
  }

  // Clear events
  clearEvents() {
    this.events = [];
  }
}

// Convenience hooks for React components
export const useCategoryAnalytics = () => {
  const analytics = CategoryAnalytics.getInstance();

  return {
    trackCategoryView: analytics.trackCategoryView.bind(analytics),
    trackCategoryClick: analytics.trackCategoryClick.bind(analytics),
    trackCategorySearch: analytics.trackCategorySearch.bind(analytics),
    trackFilterApply: analytics.trackFilterApply.bind(analytics),
    trackFilterReset: analytics.trackFilterReset.bind(analytics),
    trackSortChange: analytics.trackSortChange.bind(analytics),
    trackCTAClick: analytics.trackCTAClick.bind(analytics),
  };
};

// Global types for analytics services
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}
