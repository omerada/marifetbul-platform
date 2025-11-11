/**
 * Production Monitoring Infrastructure
 *
 * Bu modül production ortamında izleme ve gözlemleme altyapısı sağlar:
 * - Application Performance Monitoring (APM)
 * - Real User Monitoring (RUM)
 * - Error tracking ve alerting
 * - Business metrics collection
 */

import logger from '@/lib/infrastructure/monitoring/logger';

// Monitoring Configuration
export interface MonitoringConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  apiUrl?: string;
  apiKey?: string;
  projectId?: string;
  sampling?: {
    performance: number; // 0-1
    errors: number; // 0-1
    traces: number; // 0-1
  };
  filters?: {
    excludeUrls?: RegExp[];
    excludeErrors?: string[];
  };
}

// Metrics Types
export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  unit?: 'count' | 'gauge' | 'histogram' | 'timer';
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'navigation' | 'form_submit' | 'search';
  element?: string;
  page: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface BusinessEvent {
  event: string;
  category: 'user_action' | 'system_event' | 'business_goal';
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

// Monitoring Manager
export class MonitoringManager {
  private static instance: MonitoringManager;
  private config: MonitoringConfig;
  private sessionId: string;
  private userId?: string;
  private buffer: {
    metrics: Metric[];
    interactions: UserInteraction[];
    events: BusinessEvent[];
  } = {
    metrics: [],
    interactions: [],
    events: [],
  };
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor(config: MonitoringConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  static getInstance(config?: MonitoringConfig): MonitoringManager {
    if (!MonitoringManager.instance) {
      if (!config) {
        throw new Error('MonitoringManager must be initialized with config');
      }
      MonitoringManager.instance = new MonitoringManager(config);
    }
    return MonitoringManager.instance;
  }

  private initialize() {
    if (!this.config.enabled || typeof window === 'undefined') {
      return;
    }

    // Auto-flush buffer every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Monitor performance
    this.setupPerformanceMonitoring();

    // Monitor user interactions
    this.setupInteractionMonitoring();

    // Monitor errors
    this.setupErrorMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Metrics Collection
  recordMetric(metric: Omit<Metric, 'timestamp'>) {
    if (!this.config.enabled) return;

    this.buffer.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    // Auto-flush if buffer is full
    if (this.buffer.metrics.length >= 100) {
      this.flush();
    }
  }

  // User Interaction Tracking
  recordInteraction(
    interaction: Omit<UserInteraction, 'timestamp' | 'sessionId'>
  ) {
    if (!this.config.enabled) return;

    this.buffer.interactions.push({
      ...interaction,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    });
  }

  // Business Event Tracking
  recordEvent(event: Omit<BusinessEvent, 'timestamp' | 'sessionId'>) {
    if (!this.config.enabled) return;

    this.buffer.events.push({
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || event.userId,
    });
  }

  // Performance Monitoring
  private setupPerformanceMonitoring() {
    // Web Vitals tracking
    if ('web-vitals' in window) {
      // This would be imported from web-vitals library
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.recordMetric({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            unit: 'timer',
            tags: {
              page: window.location.pathname,
            },
          });

          this.recordMetric({
            name: 'dom_content_loaded',
            value:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            unit: 'timer',
            tags: {
              page: window.location.pathname,
            },
          });
        }
      }, 0);
    });

    // Resource timing
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;

          this.recordMetric({
            name: 'resource_load_time',
            value: resource.responseEnd - resource.requestStart,
            unit: 'timer',
            tags: {
              resource_type: resource.initiatorType,
              resource_name: resource.name.split('/').pop() || 'unknown',
            },
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  // User Interaction Monitoring
  private setupInteractionMonitoring() {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;

      this.recordInteraction({
        type: 'click',
        element: `${tagName}${id ? `#${id}` : ''}${className ? `.${className.replace(/\s+/g, '.')}` : ''}`,
        page: window.location.pathname,
      });
    });

    // Scroll tracking (throttled)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
            100
        );

        this.recordInteraction({
          type: 'scroll',
          page: window.location.pathname,
          metadata: {
            scrollPercent,
            scrollY: window.scrollY,
          },
        });
      }, 500);
    });

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'unknown';

      this.recordInteraction({
        type: 'form_submit',
        element: `form#${formId}`,
        page: window.location.pathname,
      });
    });
  }

  // Error Monitoring
  private setupErrorMonitoring() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordEvent({
        event: 'javascript_error',
        category: 'system_event',
        properties: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack,
        },
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordEvent({
        event: 'unhandled_promise_rejection',
        category: 'system_event',
        properties: {
          reason: event.reason,
          promise: event.promise,
        },
      });
    });
  }

  // Data Flushing
  private async flush() {
    if (!this.config.enabled || !this.config.apiUrl) {
      return;
    }

    const data = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      environment: this.config.environment,
      projectId: this.config.projectId,
      metrics: [...this.buffer.metrics],
      interactions: [...this.buffer.interactions],
      events: [...this.buffer.events],
    };

    // Clear buffer
    this.buffer.metrics = [];
    this.buffer.interactions = [];
    this.buffer.events = [];

    try {
      await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && {
            Authorization: `Bearer ${this.config.apiKey}`,
          }),
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      logger.error(
        'Failed to send monitoring data',
        error
      );
      // Restore data to buffer on failure
      this.buffer.metrics.push(...data.metrics);
      this.buffer.interactions.push(...data.interactions);
      this.buffer.events.push(...data.events);
    }
  }

  // Cleanup
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Business Metrics Helpers
export class BusinessMetrics {
  private static monitoring = MonitoringManager.getInstance();

  // User engagement metrics
  static trackUserRegistration(
    userId: string,
    method: 'email' | 'social' | 'phone'
  ) {
    BusinessMetrics.monitoring.recordEvent({
      event: 'user_registration',
      category: 'business_goal',
      properties: {
        userId,
        registrationMethod: method,
      },
    });
  }

  static trackUserLogin(userId: string, method: 'email' | 'social') {
    BusinessMetrics.monitoring.recordEvent({
      event: 'user_login',
      category: 'user_action',
      properties: {
        userId,
        loginMethod: method,
      },
    });
  }

  static trackJobPosting(jobId: string, employerId: string, category: string) {
    BusinessMetrics.monitoring.recordEvent({
      event: 'job_posted',
      category: 'business_goal',
      properties: {
        jobId,
        employerId,
        category,
      },
    });
  }

  static trackJobApplication(jobId: string, freelancerId: string) {
    BusinessMetrics.monitoring.recordEvent({
      event: 'job_application',
      category: 'business_goal',
      properties: {
        jobId,
        freelancerId,
      },
    });
  }

  static trackTransaction(
    transactionId: string,
    amount: number,
    currency: string
  ) {
    BusinessMetrics.monitoring.recordEvent({
      event: 'transaction_completed',
      category: 'business_goal',
      properties: {
        transactionId,
        amount,
        currency,
      },
    });

    BusinessMetrics.monitoring.recordMetric({
      name: 'revenue',
      value: amount,
      unit: 'gauge',
      tags: {
        currency,
      },
    });
  }

  // Feature usage metrics
  static trackFeatureUsage(
    feature: string,
    action: string,
    metadata?: Record<string, unknown>
  ) {
    BusinessMetrics.monitoring.recordEvent({
      event: 'feature_usage',
      category: 'user_action',
      properties: {
        feature,
        action,
        ...metadata,
      },
    });
  }

  static trackSearchQuery(
    query: string,
    resultsCount: number,
    category?: string
  ) {
    BusinessMetrics.monitoring.recordEvent({
      event: 'search_performed',
      category: 'user_action',
      properties: {
        query,
        resultsCount,
        category,
      },
    });
  }
}

// Performance Metrics Helpers
export class PerformanceMetrics {
  private static monitoring = MonitoringManager.getInstance();

  static trackAPICall(
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ) {
    PerformanceMetrics.monitoring.recordMetric({
      name: 'api_call_duration',
      value: duration,
      unit: 'timer',
      tags: {
        endpoint,
        method,
        status: status.toString(),
      },
    });
  }

  static trackComponentRender(componentName: string, renderTime: number) {
    PerformanceMetrics.monitoring.recordMetric({
      name: 'component_render_time',
      value: renderTime,
      unit: 'timer',
      tags: {
        component: componentName,
      },
    });
  }

  static trackBundleSize(bundleName: string, size: number) {
    PerformanceMetrics.monitoring.recordMetric({
      name: 'bundle_size',
      value: size,
      unit: 'gauge',
      tags: {
        bundle: bundleName,
      },
    });
  }
}

// Default configuration
export const defaultMonitoringConfig: MonitoringConfig = {
  enabled: process.env.NODE_ENV === 'production',
  environment:
    (process.env.NODE_ENV as 'development' | 'staging' | 'production') ||
    'development',
  sampling: {
    performance: 1.0,
    errors: 1.0,
    traces: 0.1,
  },
  filters: {
    excludeUrls: [
      /\/api\/health/,
      /\/api\/metrics/,
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/,
    ],
    excludeErrors: ['Network request failed', 'Load failed', 'Script error'],
  },
};

// Initialize monitoring
let monitoringInstance: MonitoringManager | null = null;

export function initializeMonitoring(config?: Partial<MonitoringConfig>) {
  const finalConfig = {
    ...defaultMonitoringConfig,
    ...config,
  };

  monitoringInstance = MonitoringManager.getInstance(finalConfig);
  return monitoringInstance;
}

export function getMonitoring(): MonitoringManager | null {
  return monitoringInstance;
}
