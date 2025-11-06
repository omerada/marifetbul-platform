/**
 * Google Analytics 4 (GA4) Integration
 *
 * Features:
 * - Page view tracking
 * - Event tracking
 * - E-commerce tracking
 * - User properties
 * - Custom dimensions
 * - Conversion tracking
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4
 */

import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

interface GAPageView {
  page_path: string;
  page_title: string;
  page_location?: string;
}

interface GAEcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}

interface GAEcommerceEvent {
  transaction_id?: string;
  value?: number;
  currency?: string;
  items: GAEcommerceItem[];
}

// Extend Window interface for gtag
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
const GA_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' && !!GA_TRACKING_ID;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Initialize Google Analytics
 */
export function initGA(): void {
  if (!GA_ENABLED || typeof window === 'undefined') return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID!, {
    send_page_view: false, // We'll send manually
    anonymize_ip: true, // GDPR compliance
    cookie_flags: 'SameSite=None;Secure',
  });

  logger.info('✅ Google Analytics initialized');
}

/**
 * Track page view
 */
export function trackPageView(page: GAPageView): void {
  if (!GA_ENABLED || typeof window === 'undefined') return;

  window.gtag?.('event', 'page_view', {
    page_path: page.page_path,
    page_title: page.page_title,
    page_location: page.page_location || window.location.href,
  });
}

/**
 * Track custom event
 */
export function trackEvent(event: GAEvent): void {
  if (!GA_ENABLED || typeof window === 'undefined') return;

  const { action, category, label, value, ...customParams } = event;

  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParams,
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!GA_ENABLED || typeof window === 'undefined') return;

  window.gtag?.('set', 'user_properties', properties);
}

/**
 * Set user ID
 */
export function setUserId(userId: string): void {
  if (!GA_ENABLED || typeof window === 'undefined') return;

  window.gtag?.('config', GA_TRACKING_ID!, {
    user_id: userId,
  });
}

// ============================================================================
// E-COMMERCE TRACKING
// ============================================================================

/**
 * Track product view
 */
export function trackProductView(item: GAEcommerceItem): void {
  trackEvent({
    action: 'view_item',
    items: [item],
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(item: GAEcommerceItem): void {
  trackEvent({
    action: 'add_to_cart',
    items: [item],
  });
}

/**
 * Track purchase
 */
export function trackPurchase(event: GAEcommerceEvent): void {
  trackEvent({
    action: 'purchase',
    transaction_id: event.transaction_id,
    value: event.value,
    currency: event.currency || 'TRY',
    items: event.items,
  });
}

/**
 * Track begin checkout
 */
export function trackBeginCheckout(event: GAEcommerceEvent): void {
  trackEvent({
    action: 'begin_checkout',
    value: event.value,
    currency: event.currency || 'TRY',
    items: event.items,
  });
}

// ============================================================================
// CUSTOM BUSINESS EVENTS
// ============================================================================

/**
 * Track job application
 */
export function trackJobApplication(jobId: string, jobTitle: string): void {
  trackEvent({
    action: 'job_application',
    category: 'Job',
    label: jobTitle,
    job_id: jobId,
  });
}

/**
 * Track service order
 */
export function trackServiceOrder(
  serviceId: string,
  serviceName: string,
  price: number
): void {
  trackEvent({
    action: 'service_order',
    category: 'Service',
    label: serviceName,
    value: price,
    service_id: serviceId,
  });
}

/**
 * Track user registration
 */
export function trackUserRegistration(method: string): void {
  trackEvent({
    action: 'sign_up',
    category: 'User',
    method: method, // email, google, facebook, etc.
  });
}

/**
 * Track user login
 */
export function trackUserLogin(method: string): void {
  trackEvent({
    action: 'login',
    category: 'User',
    method: method,
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultCount: number): void {
  trackEvent({
    action: 'search',
    category: 'Search',
    label: searchTerm,
    value: resultCount,
    search_term: searchTerm,
  });
}

/**
 * Track message sent
 */
export function trackMessageSent(conversationId: string): void {
  trackEvent({
    action: 'message_sent',
    category: 'Communication',
    conversation_id: conversationId,
  });
}

/**
 * Track profile view
 */
export function trackProfileView(userId: string, userType: string): void {
  trackEvent({
    action: 'profile_view',
    category: 'User',
    user_id: userId,
    user_type: userType,
  });
}

/**
 * Track review submission
 */
export function trackReviewSubmission(
  targetId: string,
  targetType: string,
  rating: number
): void {
  trackEvent({
    action: 'review_submission',
    category: 'Review',
    target_id: targetId,
    target_type: targetType,
    value: rating,
  });
}

// ============================================================================
// ENGAGEMENT TRACKING
// ============================================================================

/**
 * Track share action
 */
export function trackShare(
  method: string,
  contentType: string,
  contentId: string
): void {
  trackEvent({
    action: 'share',
    category: 'Engagement',
    method: method, // facebook, twitter, email, etc.
    content_type: contentType,
    content_id: contentId,
  });
}

/**
 * Track file download
 */
export function trackDownload(fileName: string, fileType: string): void {
  trackEvent({
    action: 'file_download',
    category: 'Engagement',
    label: fileName,
    file_type: fileType,
  });
}

/**
 * Track video play
 */
export function trackVideoPlay(videoId: string, videoTitle: string): void {
  trackEvent({
    action: 'video_play',
    category: 'Engagement',
    label: videoTitle,
    video_id: videoId,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

/**
 * Track error
 */
export function trackError(
  errorMessage: string,
  errorLocation: string,
  fatal = false
): void {
  trackEvent({
    action: 'exception',
    category: 'Error',
    description: errorMessage,
    location: errorLocation,
    fatal: fatal,
  });
}

// ============================================================================
// TIMING TRACKING
// ============================================================================

/**
 * Track timing
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  trackEvent({
    action: 'timing_complete',
    category: category,
    name: variable,
    value: value,
    label: label,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if GA is enabled
 */
export function isGAEnabled(): boolean {
  return GA_ENABLED;
}

/**
 * Get GA tracking ID
 */
export function getGATrackingId(): string | undefined {
  return GA_TRACKING_ID;
}

const analyticsModule = {
  initGA,
  trackPageView,
  trackEvent,
  setUserProperties,
  setUserId,
  trackProductView,
  trackAddToCart,
  trackPurchase,
  trackBeginCheckout,
  trackJobApplication,
  trackServiceOrder,
  trackUserRegistration,
  trackUserLogin,
  trackSearch,
  trackMessageSent,
  trackProfileView,
  trackReviewSubmission,
  trackShare,
  trackDownload,
  trackVideoPlay,
  trackError,
  trackTiming,
  isGAEnabled,
  getGATrackingId,
};

export default analyticsModule;
