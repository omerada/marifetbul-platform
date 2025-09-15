/**
 * Production Optimization Types
 * Type definitions for production optimization utilities
 */

// ================================================
// REPORT TYPES
// ================================================

export interface BundleReport {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  chunkCount: number;
  loadTimes: Record<string, number>;
  recommendations: string[];
}

export interface TreeShakingReport {
  totalModules: number;
  modulesWithUnused: number;
  unusedExports: Array<{ module: string; exports: string[] }>;
  optimizationPotential: number;
  recommendations: string[];
}

export interface ReadinessReport {
  score: number;
  passed: number;
  total: number;
  checks: Array<{ name: string; passed: boolean; message: string }>;
  readyForProduction: boolean;
  recommendations: string[];
}

export interface ProductionReport {
  overallScore: number;
  readyForProduction: boolean;
  bundle: BundleReport;
  treeShaking: TreeShakingReport;
  readiness: ReadinessReport;
  recommendations: string[];
  timestamp: string;
}

// ================================================
// ACTION PLAN TYPES
// ================================================

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
}

export interface ActionPlan {
  items: ActionItem[];
  estimatedTimeToComplete: string;
  expectedImpact: string;
}

// ================================================
// PERFORMANCE TYPES
// ================================================

export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
}

export interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

// ================================================
// GLOBAL TYPES
// ================================================

export interface GlobalWithDevTools extends Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
  __REDUX_DEVTOOLS_EXTENSION__?: unknown;
  __originalRequire?: typeof require;
}

export interface GlobalWithImport extends Window {
  import?: (specifier: string) => Promise<unknown>;
}
