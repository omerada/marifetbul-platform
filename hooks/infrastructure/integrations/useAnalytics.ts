'use client';

/**
 * React Hooks for Analytics Integration
 *
 * Provides easy-to-use hooks for tracking user interactions
 * and page views with Google Analytics
 *
 * Features:
 * - Page view tracking
 * - Event tracking
 * - E-commerce tracking
 * - User properties
 * - Custom events
 */

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  trackPageView,
  trackEvent,
  trackJobApplication,
  trackServiceOrder,
  trackSearch,
  trackMessageSent,
  trackProfileView,
  trackReviewSubmission,
  trackShare,
  trackUserLogin,
  trackUserRegistration,
  setUserId,
  setUserProperties,
} from '@/lib/infrastructure/monitoring/analytics';

/**
 * Hook to track page views automatically
 * Use in layout components
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const url = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;

    trackPageView({
      page_path: pathname,
      page_title: document.title,
      page_location: url,
    });
  }, [pathname, searchParams]);
}

/**
 * Hook to track custom events
 */
export function useAnalytics() {
  const trackCustomEvent = useCallback(
    (
      action: string,
      params?: {
        category?: string;
        label?: string;
        value?: number;
        [key: string]: unknown;
      }
    ) => {
      trackEvent({
        action,
        category: params?.category,
        label: params?.label,
        value: params?.value,
        ...params,
      });
    },
    []
  );

  const trackClick = useCallback((elementName: string, category = 'UI') => {
    trackEvent({
      action: 'click',
      category,
      label: elementName,
    });
  }, []);

  const trackFormSubmit = useCallback((formName: string) => {
    trackEvent({
      action: 'form_submit',
      category: 'Form',
      label: formName,
    });
  }, []);

  const trackFormError = useCallback((formName: string, errorField: string) => {
    trackEvent({
      action: 'form_error',
      category: 'Form',
      label: formName,
      error_field: errorField,
    });
  }, []);

  return {
    trackEvent: trackCustomEvent,
    trackClick,
    trackFormSubmit,
    trackFormError,
  };
}

/**
 * Hook to track user authentication events
 */
export function useAuthTracking() {
  const trackLogin = useCallback((method: string) => {
    trackUserLogin(method);
  }, []);

  const trackRegistration = useCallback((method: string) => {
    trackUserRegistration(method);
  }, []);

  const setUser = useCallback(
    (userId: string, properties?: Record<string, unknown>) => {
      setUserId(userId);
      if (properties) {
        setUserProperties(properties);
      }
    },
    []
  );

  return {
    trackLogin,
    trackRegistration,
    setUser,
  };
}

/**
 * Hook to track marketplace events
 */
export function useMarketplaceTracking() {
  const trackJobView = useCallback((jobId: string, jobTitle: string) => {
    trackEvent({
      action: 'job_view',
      category: 'Job',
      label: jobTitle,
      job_id: jobId,
    });
  }, []);

  const trackJobApply = useCallback((jobId: string, jobTitle: string) => {
    trackJobApplication(jobId, jobTitle);
  }, []);

  const trackServiceView = useCallback(
    (serviceId: string, serviceName: string) => {
      trackEvent({
        action: 'service_view',
        category: 'Service',
        label: serviceName,
        service_id: serviceId,
      });
    },
    []
  );

  const trackServicePurchase = useCallback(
    (serviceId: string, serviceName: string, price: number) => {
      trackServiceOrder(serviceId, serviceName, price);
    },
    []
  );

  const trackSearchQuery = useCallback((query: string, resultCount: number) => {
    trackSearch(query, resultCount);
  }, []);

  return {
    trackJobView,
    trackJobApply,
    trackServiceView,
    trackServicePurchase,
    trackSearchQuery,
  };
}

/**
 * Hook to track communication events
 */
export function useCommunicationTracking() {
  const trackMessage = useCallback((conversationId: string) => {
    trackMessageSent(conversationId);
  }, []);

  const trackConversationStart = useCallback((userId: string) => {
    trackEvent({
      action: 'conversation_start',
      category: 'Communication',
      user_id: userId,
    });
  }, []);

  return {
    trackMessage,
    trackConversationStart,
  };
}

/**
 * Hook to track profile and review events
 */
export function useProfileTracking() {
  const trackProfile = useCallback((userId: string, userType: string) => {
    trackProfileView(userId, userType);
  }, []);

  const trackReview = useCallback(
    (targetId: string, targetType: string, rating: number) => {
      trackReviewSubmission(targetId, targetType, rating);
    },
    []
  );

  return {
    trackProfile,
    trackReview,
  };
}

/**
 * Hook to track social sharing
 */
export function useSocialTracking() {
  const trackSocialShare = useCallback(
    (method: string, contentType: string, contentId: string) => {
      trackShare(method, contentType, contentId);
    },
    []
  );

  const trackFollow = useCallback((userId: string) => {
    trackEvent({
      action: 'follow',
      category: 'Social',
      user_id: userId,
    });
  }, []);

  const trackUnfollow = useCallback((userId: string) => {
    trackEvent({
      action: 'unfollow',
      category: 'Social',
      user_id: userId,
    });
  }, []);

  return {
    trackSocialShare,
    trackFollow,
    trackUnfollow,
  };
}

/**
 * Hook to track engagement metrics
 */
export function useEngagementTracking() {
  const trackTimeOnPage = useCallback(() => {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      trackEvent({
        action: 'time_on_page',
        category: 'Engagement',
        value: Math.round(duration / 1000), // Convert to seconds
        page: window.location.pathname,
      });
    };
  }, []);

  const trackScroll = useCallback((percentage: number) => {
    trackEvent({
      action: 'scroll',
      category: 'Engagement',
      value: percentage,
      page: window.location.pathname,
    });
  }, []);

  const trackVideoInteraction = useCallback(
    (videoId: string, action: 'play' | 'pause' | 'complete') => {
      trackEvent({
        action: `video_${action}`,
        category: 'Engagement',
        video_id: videoId,
      });
    },
    []
  );

  return {
    trackTimeOnPage,
    trackScroll,
    trackVideoInteraction,
  };
}

/**
 * Combined hook with all tracking functionality
 */
export function useTracking() {
  const analytics = useAnalytics();
  const auth = useAuthTracking();
  const marketplace = useMarketplaceTracking();
  const communication = useCommunicationTracking();
  const profile = useProfileTracking();
  const social = useSocialTracking();
  const engagement = useEngagementTracking();

  return {
    ...analytics,
    auth,
    marketplace,
    communication,
    profile,
    social,
    engagement,
  };
}
