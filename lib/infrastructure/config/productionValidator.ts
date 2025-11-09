/**
 * ================================================
 * PRODUCTION ENVIRONMENT VALIDATOR
 * ================================================
 *
 * Client-side validation for production environment configuration.
 * Runs during build time to catch configuration errors before deployment.
 *
 * Validates:
 * - Required environment variables
 * - Feature flags
 * - Debug modes disabled
 * - API URLs configured
 * - External service keys present
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Story 1.2: Production Safety
 */

/* eslint-disable no-console */
// Console is intentionally used for build-time validation

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Validate production environment configuration
 */
export function validateProductionEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const env = process.env.NODE_ENV;
  const isProduction = env === 'production';
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;

  // Only run in production builds
  if (!isProduction) {
    return { isValid: true, errors: [], warnings: [] };
  }

  console.log('🔒 Starting Production Environment Validation...');

  // ================================================
  // CRITICAL CHECKS (Must Pass)
  // ================================================

  // 1. Environment Check
  if (appEnv !== 'production') {
    errors.push(
      `NEXT_PUBLIC_APP_ENV is not 'production': ${appEnv || 'not set'}`
    );
  }

  // 2. Debug Flags Check
  if (process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
    errors.push(
      'Debug mode is ENABLED in production (NEXT_PUBLIC_ENABLE_DEBUG=true)'
    );
  }

  if (process.env.NEXT_PUBLIC_WS_DEBUG === 'true') {
    errors.push(
      'WebSocket debug is ENABLED in production (NEXT_PUBLIC_WS_DEBUG=true)'
    );
  }

  // 3. API URL Check
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    errors.push('API URL is not configured (NEXT_PUBLIC_API_URL)');
  } else if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
    errors.push(`API URL points to localhost in production: ${apiUrl}`);
  } else if (!apiUrl.startsWith('https://')) {
    errors.push(`API URL is not HTTPS in production: ${apiUrl}`);
  }

  // 4. WebSocket URL Check
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (!wsUrl) {
    errors.push('WebSocket URL is not configured (NEXT_PUBLIC_WS_URL)');
  } else if (wsUrl.includes('localhost') || wsUrl.includes('127.0.0.1')) {
    errors.push(`WebSocket URL points to localhost in production: ${wsUrl}`);
  } else if (!wsUrl.startsWith('wss://')) {
    errors.push(`WebSocket URL is not WSS (secure) in production: ${wsUrl}`);
  }

  // 5. App URL Check
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    errors.push('App URL is not configured (NEXT_PUBLIC_APP_URL)');
  } else if (!appUrl.startsWith('https://')) {
    errors.push(`App URL is not HTTPS in production: ${appUrl}`);
  }

  // 6. Session Secret Check
  const sessionSecret = process.env.SESSION_SECRET;
  if (
    !sessionSecret ||
    sessionSecret === 'your-super-secret-session-key-min-32-chars'
  ) {
    errors.push(
      'Session secret is not properly configured or using default value'
    );
  } else if (sessionSecret.length < 32) {
    errors.push(
      `Session secret is too short (${sessionSecret.length} chars, minimum 32)`
    );
  }

  // ================================================
  // WARNING CHECKS (Should Fix)
  // ================================================

  // 1. Sentry Configuration
  if (
    !process.env.NEXT_PUBLIC_SENTRY_DSN &&
    process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true'
  ) {
    warnings.push(
      'Sentry is enabled but DSN is not configured - error tracking will not work'
    );
  }

  // 2. Analytics Configuration
  if (
    !process.env.NEXT_PUBLIC_GA_TRACKING_ID &&
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
  ) {
    warnings.push(
      'Analytics is enabled but Google Analytics ID is not configured'
    );
  }

  // 3. CSRF Protection
  if (process.env.NEXT_PUBLIC_CSRF_ENABLED !== 'true') {
    warnings.push('CSRF protection is not explicitly enabled');
  }

  // 4. Cookie Security
  if (process.env.NEXT_PUBLIC_COOKIE_SECURE !== 'true') {
    warnings.push(
      'Cookie secure flag is not enabled - cookies may be sent over HTTP'
    );
  }

  // 5. Sample Rates
  const sentryTraceRate = parseFloat(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0'
  );
  if (sentryTraceRate > 0.2) {
    warnings.push(
      `Sentry trace sample rate is high (${sentryTraceRate}) - may impact performance`
    );
  }

  // ================================================
  // INFO CHECKS (Optional)
  // ================================================

  console.log('');
  console.log('📊 Production Environment Summary:');
  console.log('  Environment:', appEnv || 'not set');
  console.log('  API URL:', apiUrl || 'not set');
  console.log('  WebSocket URL:', wsUrl || 'not set');
  console.log('  App URL:', appUrl || 'not set');
  console.log('  Debug Mode:', process.env.NEXT_PUBLIC_ENABLE_DEBUG || 'false');
  console.log(
    '  Sentry:',
    process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true' ? 'Enabled' : 'Disabled'
  );
  console.log(
    '  Analytics:',
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' ? 'Enabled' : 'Disabled'
  );
  console.log(
    '  CSRF Protection:',
    process.env.NEXT_PUBLIC_CSRF_ENABLED === 'true' ? 'Enabled' : 'Disabled'
  );
  console.log('');

  // ================================================
  // RETURN RESULTS
  // ================================================

  const isValid = errors.length === 0;

  if (errors.length > 0) {
    console.error('❌❌❌ PRODUCTION ENVIRONMENT VALIDATION FAILED ❌❌❌');
    console.error('');
    console.error('The following CRITICAL issues were found:');
    errors.forEach((error) => console.error(`  ❌ ${error}`));
    console.error('');
    console.error('Build CANNOT proceed with these errors.');
    console.error('Please fix the configuration and rebuild.');
    console.error('');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  PRODUCTION ENVIRONMENT WARNINGS');
    console.warn('');
    warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`));
    console.warn('');
    console.warn('Build will proceed, but consider addressing these warnings.');
    console.warn('');
  }

  if (isValid && warnings.length === 0) {
    console.log('✅ Production Environment Validation PASSED');
    console.log('✅ All checks successful');
    console.log('✅ Environment is production-ready');
    console.log('');
  }

  return { isValid, errors, warnings };
}

/**
 * Validate and throw if production build has invalid configuration
 * Call this during build process
 */
export function validateAndThrow(): void {
  const result = validateProductionEnvironment();

  if (!result.isValid) {
    throw new Error(
      `Production environment validation failed with ${result.errors.length} error(s). ` +
        'See console output for details.'
    );
  }
}

// Auto-validate during build
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  // Only run during build (server-side)
  validateAndThrow();
}
