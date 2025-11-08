/**
 * ================================================
 * FIREBASE CONFIGURATION
 * ================================================
 * Production-ready Firebase configuration with validation
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 * - NEXT_PUBLIC_FIREBASE_VAPID_KEY (for push notifications)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Production Ready
 */

import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface FirebaseConfigValidation {
  isValid: boolean;
  missingKeys: string[];
  warnings: string[];
}

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const FIREBASE_MESSAGING_SENDER_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// ============================================================================
// FIREBASE CONFIG OBJECT
// ============================================================================

export const firebaseConfig: FirebaseConfig = {
  apiKey: FIREBASE_API_KEY || '',
  authDomain: FIREBASE_AUTH_DOMAIN || '',
  projectId: FIREBASE_PROJECT_ID || '',
  storageBucket: FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || '',
  appId: FIREBASE_APP_ID || '',
  measurementId: FIREBASE_MEASUREMENT_ID,
};

export const vapidKey: string = FIREBASE_VAPID_KEY || '';

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate Firebase configuration
 * Returns validation result with missing keys and warnings
 */
export function validateFirebaseConfig(): FirebaseConfigValidation {
  const missingKeys: string[] = [];
  const warnings: string[] = [];

  // Check required keys
  const requiredKeys = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
  };

  for (const [key, value] of Object.entries(requiredKeys)) {
    if (!value) {
      const envKey = `NEXT_PUBLIC_FIREBASE_${key
        .replace(/([A-Z])/g, '_$1')
        .toUpperCase()}`;
      missingKeys.push(envKey);
    }
  }

  // Check VAPID key for push notifications
  if (!FIREBASE_VAPID_KEY) {
    warnings.push(
      'NEXT_PUBLIC_FIREBASE_VAPID_KEY not set - Push notifications will not work'
    );
  }

  // Check measurement ID for analytics
  if (!FIREBASE_MEASUREMENT_ID) {
    warnings.push(
      'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID not set - Analytics will not work'
    );
  }

  const isValid = missingKeys.length === 0;

  return {
    isValid,
    missingKeys,
    warnings,
  };
}

/**
 * Check if Firebase is properly configured
 * Simple boolean check for quick validation
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    FIREBASE_API_KEY &&
    FIREBASE_PROJECT_ID &&
    FIREBASE_MESSAGING_SENDER_ID &&
    FIREBASE_APP_ID
  );
}

/**
 * Check if push notifications can be enabled
 */
export function isPushNotificationsConfigured(): boolean {
  return isFirebaseConfigured() && !!FIREBASE_VAPID_KEY;
}

/**
 * Get configuration status for debugging
 */
export function getConfigurationStatus(): {
  firebase: {
    configured: boolean;
    hasApiKey: boolean;
    hasProjectId: boolean;
    hasMessagingSenderId: boolean;
    hasAppId: boolean;
  };
  pushNotifications: {
    configured: boolean;
    hasVapidKey: boolean;
  };
  analytics: {
    configured: boolean;
    hasMeasurementId: boolean;
  };
} {
  return {
    firebase: {
      configured: isFirebaseConfigured(),
      hasApiKey: !!FIREBASE_API_KEY,
      hasProjectId: !!FIREBASE_PROJECT_ID,
      hasMessagingSenderId: !!FIREBASE_MESSAGING_SENDER_ID,
      hasAppId: !!FIREBASE_APP_ID,
    },
    pushNotifications: {
      configured: isPushNotificationsConfigured(),
      hasVapidKey: !!FIREBASE_VAPID_KEY,
    },
    analytics: {
      configured: !!FIREBASE_MEASUREMENT_ID,
      hasMeasurementId: !!FIREBASE_MEASUREMENT_ID,
    },
  };
}

// ============================================================================
// INITIALIZATION VALIDATION
// ============================================================================

/**
 * Validate configuration on module load (development only)
 */
if (process.env.NODE_ENV === 'development') {
  const validation = validateFirebaseConfig();

  if (!validation.isValid) {
    logger.warn('Firebase configuration incomplete', {
      missingKeys: validation.missingKeys,
    });

    console.warn(
      '⚠️ Firebase Configuration Warning:\n' +
        'Missing environment variables:\n' +
        validation.missingKeys.map((key) => `  - ${key}`).join('\n')
    );
  }

  if (validation.warnings.length > 0) {
    logger.info('Firebase configuration warnings', {
      warnings: validation.warnings,
    });
  }

  if (validation.isValid && validation.warnings.length === 0) {
    logger.info('Firebase configuration valid');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const firebaseConfigModule = {
  firebaseConfig,
  vapidKey,
  isFirebaseConfigured,
  isPushNotificationsConfigured,
  validateFirebaseConfig,
  getConfigurationStatus,
};

export default firebaseConfigModule;
