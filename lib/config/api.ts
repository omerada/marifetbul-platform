/**
 * Centralized API Configuration
 * Single source of truth for all API URLs and endpoints
 */

/**
 * Get the backend API base URL based on environment
 */
export function getBackendApiUrl(): string {
  // Priority 1: Environment variable (can be set per environment)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Priority 2: Vercel/Production URL
  if (process.env.VERCEL_URL && process.env.NODE_ENV === 'production') {
    return `https://${process.env.VERCEL_URL}/api/v1`;
  }

  // Priority 3: Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080/api/v1';
  }

  // Priority 4: Production fallback (should have env var set)
  return 'https://api.marifetbul.com/api/v1';
}

/**
 * API Configuration constants
 */
export const API_CONFIG = {
  // Base URLs
  BACKEND_URL: getBackendApiUrl(),

  // Timeouts (ms)
  DEFAULT_TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 120000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,

  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

/**
 * WebSocket URL configuration
 */
export function getWebSocketUrl(): string {
  const apiUrl = getBackendApiUrl();

  // Convert HTTP(S) to WS(S)
  return apiUrl
    .replace('https://', 'wss://')
    .replace('http://', 'ws://')
    .replace('/api/v1', '/ws');
}

/**
 * Check if running in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = process.env.NODE_ENV === 'test';

export default API_CONFIG;
