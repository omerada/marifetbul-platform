/**
 * Production Deployment Configuration
 * Final deployment utilities and optimization checklist
 */

import {
  initializeProductionOptimizations,
  quickProductionCheck,
} from './production-config';
import type { ProductionReport } from './production-types';

// ================================================
// DEPLOYMENT CHECKLIST
// ================================================

export interface DeploymentChecklistItem {
  id: string;
  category: 'performance' | 'security' | 'build' | 'configuration';
  description: string;
  required: boolean;
  checked: boolean;
  automatable: boolean;
}

export const PRODUCTION_CHECKLIST: DeploymentChecklistItem[] = [
  // Performance checks
  {
    id: 'bundle-size',
    category: 'performance',
    description: 'Bundle size is under 2MB for initial load',
    required: true,
    checked: false,
    automatable: true,
  },
  {
    id: 'code-splitting',
    category: 'performance',
    description: 'Code splitting implemented for routes and heavy components',
    required: true,
    checked: false,
    automatable: false,
  },
  {
    id: 'lazy-loading',
    category: 'performance',
    description: 'Images and components are lazy loaded',
    required: true,
    checked: false,
    automatable: false,
  },
  {
    id: 'memoization',
    category: 'performance',
    description: 'React.memo and useMemo implemented for expensive operations',
    required: true,
    checked: false,
    automatable: false,
  },

  // Security checks
  {
    id: 'env-variables',
    category: 'security',
    description: 'No sensitive data exposed in client bundle',
    required: true,
    checked: false,
    automatable: true,
  },
  {
    id: 'https-only',
    category: 'security',
    description: 'All external requests use HTTPS',
    required: true,
    checked: false,
    automatable: true,
  },
  {
    id: 'csp-headers',
    category: 'security',
    description: 'Content Security Policy headers configured',
    required: false,
    checked: false,
    automatable: false,
  },

  // Build checks
  {
    id: 'source-maps',
    category: 'build',
    description: 'Source maps excluded from production build',
    required: true,
    checked: false,
    automatable: true,
  },
  {
    id: 'dev-dependencies',
    category: 'build',
    description: 'Development dependencies excluded from production',
    required: true,
    checked: false,
    automatable: true,
  },
  {
    id: 'tree-shaking',
    category: 'build',
    description: 'Unused code eliminated through tree-shaking',
    required: true,
    checked: false,
    automatable: true,
  },

  // Configuration checks
  {
    id: 'production-env',
    category: 'configuration',
    description: 'NODE_ENV set to production',
    required: true,
    checked: false,
    automatable: true,
  },
  {
    id: 'api-endpoints',
    category: 'configuration',
    description: 'API endpoints configured for production environment',
    required: true,
    checked: false,
    automatable: true,
  },
  {
    id: 'error-reporting',
    category: 'configuration',
    description: 'Error reporting and monitoring configured',
    required: false,
    checked: false,
    automatable: false,
  },
];

// ================================================
// DEPLOYMENT MANAGER
// ================================================

export class ProductionDeploymentManager {
  private checklist: DeploymentChecklistItem[] = [...PRODUCTION_CHECKLIST];

  /**
   * Run automated deployment checks
   */
  async runAutomatedChecks() {
    const report = await quickProductionCheck();

    // Update checklist based on automated findings
    this.updateChecklistFromReport(report);

    return {
      report,
      checklist: this.checklist,
      readyForDeployment: this.isReadyForDeployment(),
      nextSteps: this.getNextSteps(),
    };
  }

  /**
   * Update checklist items based on production report
   */
  private updateChecklistFromReport(report: ProductionReport) {
    // Bundle size check
    const bundleSizeItem = this.checklist.find(
      (item) => item.id === 'bundle-size'
    );
    if (bundleSizeItem) {
      bundleSizeItem.checked = report.bundle.totalSize < 2000000; // 2MB
    }

    // Environment check
    const envItem = this.checklist.find((item) => item.id === 'production-env');
    if (envItem) {
      envItem.checked = process.env.NODE_ENV === 'production';
    }

    // Source maps check
    const sourceMapsItem = this.checklist.find(
      (item) => item.id === 'source-maps'
    );
    if (sourceMapsItem) {
      const sourceMapsCheck = report.readiness.checks.find(
        (check) => check.name === 'Source Maps'
      );
      sourceMapsItem.checked = sourceMapsCheck?.passed || false;
    }

    // Tree shaking check
    const treeShakingItem = this.checklist.find(
      (item) => item.id === 'tree-shaking'
    );
    if (treeShakingItem) {
      treeShakingItem.checked = report.treeShaking.optimizationPotential < 0.2;
    }

    // Security checks
    const envVarsItem = this.checklist.find(
      (item) => item.id === 'env-variables'
    );
    if (envVarsItem) {
      const securityCheck = report.readiness.checks.find(
        (check) => check.name === 'Security'
      );
      envVarsItem.checked = securityCheck?.passed || false;
    }
  }

  /**
   * Check if ready for deployment
   */
  private isReadyForDeployment(): boolean {
    const requiredItems = this.checklist.filter((item) => item.required);
    const checkedRequired = requiredItems.filter((item) => item.checked);

    return checkedRequired.length === requiredItems.length;
  }

  /**
   * Get next steps for deployment
   */
  private getNextSteps(): Array<{
    priority: number;
    action: string;
    category: string;
  }> {
    const uncheckedRequired = this.checklist
      .filter((item) => item.required && !item.checked)
      .map((item) => ({
        priority: 1,
        action: item.description,
        category: item.category,
      }));

    const uncheckedOptional = this.checklist
      .filter((item) => !item.required && !item.checked)
      .map((item) => ({
        priority: 2,
        action: item.description,
        category: item.category,
      }));

    return [...uncheckedRequired, ...uncheckedOptional];
  }

  /**
   * Generate deployment report
   */
  generateDeploymentReport() {
    const totalItems = this.checklist.length;
    const checkedItems = this.checklist.filter((item) => item.checked).length;
    const requiredItems = this.checklist.filter((item) => item.required).length;
    const checkedRequired = this.checklist.filter(
      (item) => item.required && item.checked
    ).length;

    const completionPercentage = Math.round((checkedItems / totalItems) * 100);
    const requiredCompletionPercentage = Math.round(
      (checkedRequired / requiredItems) * 100
    );

    return {
      overview: {
        totalItems,
        checkedItems,
        completionPercentage,
        requiredItems,
        checkedRequired,
        requiredCompletionPercentage,
        readyForDeployment: this.isReadyForDeployment(),
      },
      categories: this.getCategoryBreakdown(),
      checklist: this.checklist,
      recommendations: this.getDeploymentRecommendations(),
    };
  }

  /**
   * Get category breakdown
   */
  private getCategoryBreakdown() {
    const categories = [
      'performance',
      'security',
      'build',
      'configuration',
    ] as const;

    return categories.map((category) => {
      const categoryItems = this.checklist.filter(
        (item) => item.category === category
      );
      const checkedCategoryItems = categoryItems.filter((item) => item.checked);

      return {
        category,
        total: categoryItems.length,
        checked: checkedCategoryItems.length,
        percentage: Math.round(
          (checkedCategoryItems.length / categoryItems.length) * 100
        ),
      };
    });
  }

  /**
   * Get deployment recommendations
   */
  private getDeploymentRecommendations(): string[] {
    const recommendations: string[] = [];

    const uncheckedRequired = this.checklist.filter(
      (item) => item.required && !item.checked
    );

    if (uncheckedRequired.length > 0) {
      recommendations.push(
        `Complete ${uncheckedRequired.length} required items before deployment`
      );
    }

    // Category-specific recommendations
    const performanceItems = uncheckedRequired.filter(
      (item) => item.category === 'performance'
    );
    if (performanceItems.length > 0) {
      recommendations.push(
        'Optimize performance: focus on bundle size and loading strategies'
      );
    }

    const securityItems = uncheckedRequired.filter(
      (item) => item.category === 'security'
    );
    if (securityItems.length > 0) {
      recommendations.push(
        'Address security concerns before production deployment'
      );
    }

    const buildItems = uncheckedRequired.filter(
      (item) => item.category === 'build'
    );
    if (buildItems.length > 0) {
      recommendations.push('Optimize build configuration for production');
    }

    // General recommendations
    if (this.isReadyForDeployment()) {
      recommendations.push('✅ Ready for production deployment!');
      recommendations.push(
        'Consider completing optional items for enhanced performance'
      );
    }

    return recommendations;
  }

  /**
   * Manual checklist item update
   */
  updateChecklistItem(id: string, checked: boolean) {
    const item = this.checklist.find((item) => item.id === id);
    if (item) {
      item.checked = checked;
    }
  }

  /**
   * Export checklist for external tracking
   */
  exportChecklist() {
    return {
      timestamp: new Date().toISOString(),
      checklist: this.checklist,
      summary: {
        total: this.checklist.length,
        completed: this.checklist.filter((item) => item.checked).length,
        required: this.checklist.filter((item) => item.required).length,
        requiredCompleted: this.checklist.filter(
          (item) => item.required && item.checked
        ).length,
        readyForDeployment: this.isReadyForDeployment(),
      },
    };
  }
}

// ================================================
// DEPLOYMENT UTILITIES
// ================================================

/**
 * Initialize production deployment check
 */
export async function initializeDeploymentCheck() {
  const manager = new ProductionDeploymentManager();

  // Initialize production optimizations
  await initializeProductionOptimizations();

  // Run automated checks
  const result = await manager.runAutomatedChecks();

  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Production Deployment Check Results:');
    console.table(
      result.checklist.map((item) => ({
        Category: item.category,
        Description: item.description,
        Required: item.required ? '✅' : '⚪',
        Status: item.checked ? '✅' : '❌',
      }))
    );

    if (result.readyForDeployment) {
      console.log('🎉 Ready for production deployment!');
    } else {
      console.warn('⚠️ Production deployment requirements not met');
      console.log('Next steps:', result.nextSteps);
    }
  }

  return result;
}

/**
 * Quick deployment readiness check
 */
export async function quickDeploymentCheck() {
  const manager = new ProductionDeploymentManager();
  const result = await manager.runAutomatedChecks();

  return {
    ready: result.readyForDeployment,
    score: Math.round(
      (result.checklist.filter((item) => item.checked).length /
        result.checklist.length) *
        100
    ),
    requiredItemsRemaining: result.checklist.filter(
      (item) => item.required && !item.checked
    ).length,
    nextSteps: result.nextSteps.slice(0, 3), // Top 3 priority items
  };
}

// ================================================
// EXPORTS
// ================================================

const ProductionDeploymentUtils = {
  ProductionDeploymentManager,
  initializeDeploymentCheck,
  quickDeploymentCheck,
  PRODUCTION_CHECKLIST,
};

export default ProductionDeploymentUtils;
