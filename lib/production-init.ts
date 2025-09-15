/**
 * Production Deployment Integration
 * Initialize production optimizations in the main application
 */

import { initializeDeploymentCheck } from '../lib/utils/production-deployment';

/**
 * Initialize production optimizations when app starts
 * This should be called in your main app component or _app.tsx
 */
export async function initializeProductionApp() {
  if (typeof window === 'undefined') return;

  try {
    // Initialize deployment checks
    const deploymentResult = await initializeDeploymentCheck();

    // In development, show optimization status
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Production Optimization Status:', {
        deploymentReady: deploymentResult.readyForDeployment,
        optimizationScore: deploymentResult.report.overallScore,
        nextSteps: deploymentResult.nextSteps.slice(0, 3),
      });
    }

    return deploymentResult;
  } catch (error) {
    console.error('Failed to initialize production optimizations:', error);
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
