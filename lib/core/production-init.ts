/**
 * Production Deployment Integration
 * Initialize production optimizations in the main application
 */

import { logger } from '@/lib/shared/utils/logger';

/**
 * Initialize production optimizations when app starts
 * This should be called in your main app component or _app.tsx
 */
export async function initializeProductionApp() {
  if (typeof window === 'undefined') return;

  try {
    // Perform health check and get deployment readiness
    const healthResponse = await fetch('/api/health', {
      method: 'GET',
      cache: 'no-store',
    });

    const deploymentResult = healthResponse.ok
      ? await healthResponse.json()
      : {
          readyForDeployment: false,
          report: { overallScore: 0 },
          nextSteps: ['Fix health check issues'],
        };

    // In development, show optimization status
    if (process.env.NODE_ENV === 'development') {
      logger.debug('🔧 Production Optimization Status:', {
        deploymentReady: deploymentResult.readyForDeployment,
        optimizationScore: deploymentResult.report.overallScore,
        nextSteps: deploymentResult.nextSteps.slice(0, 3),
      });
    }

    return deploymentResult;
  } catch (error) {
    logger.error(
      'Failed to initialize production optimizations',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Wait for DOM to be ready, then initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProductionApp);
  } else {
    // DOM already loaded
    setTimeout(initializeProductionApp, 1000);
  }
}
