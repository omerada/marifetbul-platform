/**
 * Production Optimization Configuration
 * Central configuration for production readiness and optimization
 */

import {
  ProductionReadinessChecker,
  BundleAnalyzer,
  TreeShakingAnalyzer,
} from './production-optimization';
import type {
  BundleReport,
  TreeShakingReport,
  ReadinessReport,
  ProductionReport,
  ActionItem,
  LayoutShiftEntry,
  GlobalWithDevTools,
} from './production-types';

// ================================================
// PRODUCTION OPTIMIZATION MANAGER
// ================================================

export class ProductionOptimizationManager {
  private bundleAnalyzer: BundleAnalyzer;
  private treeShakingAnalyzer: TreeShakingAnalyzer;
  private readinessChecker: ProductionReadinessChecker;

  constructor() {
    this.bundleAnalyzer = new BundleAnalyzer();
    this.treeShakingAnalyzer = new TreeShakingAnalyzer();
    this.readinessChecker = new ProductionReadinessChecker();
  }

  /**
   * Initialize all production optimizations
   */
  async initialize() {
    if (typeof window === 'undefined') return;

    // Initialize bundle analyzer
    this.bundleAnalyzer.init();

    // Track component usage for tree shaking
    this.initializeUsageTracking();

    // Setup performance monitoring
    this.setupPerformanceMonitoring();

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Production optimization monitoring initialized');
    }
  }

  /**
   * Run comprehensive production readiness check
   */
  async runProductionCheck(): Promise<ProductionReport> {
    const [bundleReport, treeShakingReport, readinessReport] =
      await Promise.all([
        this.bundleAnalyzer.getReport(),
        this.treeShakingAnalyzer.generateOptimizationReport(),
        this.readinessChecker.runAllChecks(),
      ]);

    const overallScore = this.calculateOverallScore(
      bundleReport,
      treeShakingReport,
      readinessReport
    );

    const report: ProductionReport = {
      overallScore,
      readyForProduction: overallScore >= 80,
      bundle: bundleReport,
      treeShaking: treeShakingReport,
      readiness: readinessReport,
      recommendations: this.generateOverallRecommendations(
        bundleReport,
        treeShakingReport,
        readinessReport
      ),
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Production Readiness Report:', report);
    }

    return report;
  }

  /**
   * Initialize usage tracking for tree shaking analysis
   */
  private initializeUsageTracking() {
    // Track ES6 import usage in development
    if (process.env.NODE_ENV === 'development') {
      this.trackES6Imports();
    }
  }

  /**
   * Track ES6 import patterns
   */
  private trackES6Imports() {
    // This would typically be implemented at build time
    // For runtime tracking, we can monitor component registrations

    // In development, we can track component registrations
    if (process.env.NODE_ENV === 'development') {
      this.treeShakingAnalyzer.trackUsage('components', 'development-tracking');
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    // Monitor largest contentful paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry && process.env.NODE_ENV === 'development') {
        console.log(
          `🎯 Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`
        );
      }
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor cumulative layout shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as LayoutShiftEntry;
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📐 Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
      }
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Calculate overall optimization score
   */
  private calculateOverallScore(
    bundleReport: BundleReport,
    treeShakingReport: TreeShakingReport,
    readinessReport: ReadinessReport
  ): number {
    const bundleScore = this.calculateBundleScore(bundleReport);
    const treeShakingScore =
      (1 - treeShakingReport.optimizationPotential) * 100;
    const readinessScore = readinessReport.score;

    return Math.round((bundleScore + treeShakingScore + readinessScore) / 3);
  }

  /**
   * Calculate bundle performance score
   */
  private calculateBundleScore(bundleReport: BundleReport): number {
    let score = 100;

    // Penalize large bundle size
    if (bundleReport.totalSize > 5000000)
      score -= 30; // 5MB
    else if (bundleReport.totalSize > 2000000)
      score -= 15; // 2MB
    else if (bundleReport.totalSize > 1000000) score -= 5; // 1MB

    // Penalize too many chunks
    if (bundleReport.chunkCount > 20) score -= 20;
    else if (bundleReport.chunkCount > 10) score -= 10;

    // Consider load times
    const avgLoadTime =
      Object.values(bundleReport.loadTimes).reduce(
        (sum: number, time: number) => sum + time,
        0
      ) / Object.keys(bundleReport.loadTimes).length;
    if (avgLoadTime > 3000)
      score -= 25; // 3 seconds
    else if (avgLoadTime > 1000) score -= 10; // 1 second

    return Math.max(0, score);
  }

  /**
   * Generate comprehensive recommendations
   */
  private generateOverallRecommendations(
    bundleReport: BundleReport,
    treeShakingReport: TreeShakingReport,
    readinessReport: ReadinessReport
  ): string[] {
    const recommendations: string[] = [];

    // Bundle recommendations
    recommendations.push(...bundleReport.recommendations);

    // Tree shaking recommendations
    recommendations.push(...treeShakingReport.recommendations);

    // Readiness recommendations
    recommendations.push(...readinessReport.recommendations);

    // Additional overall recommendations
    if (bundleReport.totalSize > 2000000) {
      recommendations.push('Implement aggressive code splitting strategy');
      recommendations.push(
        'Consider micro-frontend architecture for large applications'
      );
    }

    if (treeShakingReport.optimizationPotential > 0.3) {
      recommendations.push('Significant tree-shaking opportunities detected');
      recommendations.push('Audit dependencies for unused code');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Generate optimization action plan
   */
  generateActionPlan(report: ProductionReport): ActionItem[] {
    const actions: ActionItem[] = [];

    // High priority actions
    if (report.bundle.totalSize > 5000000) {
      actions.push({
        priority: 'high',
        action: 'Implement code splitting for main bundles',
        impact: 'Reduce initial load time by 40-60%',
      });
    }

    if (report.readiness.score < 60) {
      actions.push({
        priority: 'high',
        action: 'Address critical production readiness issues',
        impact: 'Ensure application stability in production',
      });
    }

    // Medium priority actions
    if (report.treeShaking.optimizationPotential > 0.2) {
      actions.push({
        priority: 'medium',
        action: 'Remove unused imports and dependencies',
        impact: 'Reduce bundle size by 10-30%',
      });
    }

    if (report.bundle.chunkCount > 15) {
      actions.push({
        priority: 'medium',
        action: 'Optimize chunk splitting strategy',
        impact: 'Improve caching and load performance',
      });
    }

    // Low priority actions
    actions.push({
      priority: 'low',
      action: 'Implement advanced performance monitoring',
      impact: 'Better visibility into production performance',
    });

    return actions;
  }
}

// ================================================
// PRODUCTION UTILITIES
// ================================================

/**
 * Quick production check utility
 */
export async function quickProductionCheck(): Promise<ProductionReport> {
  const manager = new ProductionOptimizationManager();
  await manager.initialize();
  return manager.runProductionCheck();
}

/**
 * Initialize production optimizations
 */
export async function initializeProductionOptimizations(): Promise<
  ProductionOptimizationManager | undefined
> {
  if (typeof window === 'undefined') return;

  const manager = new ProductionOptimizationManager();
  await manager.initialize();

  // Run initial check in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(async () => {
      const report = await manager.runProductionCheck();
      if (report.overallScore < 80) {
        console.warn(
          '⚠️ Production readiness score below 80%:',
          report.overallScore
        );
        console.table(report.recommendations);
      }
    }, 5000); // Wait 5 seconds for app to initialize
  }

  return manager;
}

// ================================================
// EXPORTS
// ================================================

export {
  ProductionReadinessChecker,
  BundleAnalyzer,
  TreeShakingAnalyzer,
} from './production-optimization';

const ProductionUtils = {
  ProductionOptimizationManager,
  quickProductionCheck,
  initializeProductionOptimizations,
};

export default ProductionUtils;
