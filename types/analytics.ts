/**
 * Analytics Types - Sprint 1
 * Type definitions for admin analytics features
 */

// ==================== Revenue Analytics ====================

export interface RevenueBreakdown {
  startDate: string;
  endDate: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  grossRevenue: number;
  netRevenue: number;
  platformFee: number;
  sellerEarnings: number;

  paymentMethods: {
    creditCardRevenue: number;
    creditCardPercentage: number;
    creditCardCount: number;
    walletRevenue: number;
    walletPercentage: number;
    walletCount: number;
    totalRevenue: number;
    totalCount: number;
  };

  refunds: {
    refundAmount: number;
    refundCount: number;
    refundRate: number;
    netAfterRefunds: number;
  };

  orders: {
    totalOrders: number;
    successfulOrders: number;
    refundedOrders: number;
    averageOrderValue: number;
    medianOrderValue: number;
  };

  growth: {
    previousPeriodRevenue: number;
    revenueChange: number;
    growthRate: number;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  };

  platformFees: {
    totalFees: number;
    feePercentage: number;
    creditCardFees: number;
    walletFees: number;
    averageFeeRate: number;
  };

  sellerStats: {
    activeSellers: number;
    topSellersCount: number;
    topSellersRevenue: number;
    topSellersPercentage: number;
    averageRevenuePerSeller: number;
  };

  categoryStats: {
    activeCategories: number;
    topCategory: string;
    topCategoryRevenue: number;
    topCategoryPercentage: number;
    averageRevenuePerCategory: number;
  };

  health: {
    isHealthy: boolean;
    refundRateHealth: number;
    growthHealth: number;
    diversificationHealth: number;
    overallStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  };
}

export interface RevenueForecast {
  forecastStartDate: string;
  forecastEndDate: string;
  forecastDays: number;
  model: 'LINEAR' | 'EXPONENTIAL' | 'MOVING_AVERAGE';

  historical: {
    historicalStartDate: string;
    historicalEndDate: string;
    historicalDays: number;
    totalRevenue: number;
    averageDailyRevenue: number;
    medianDailyRevenue: number;
    volatility: number;
  };

  summary: {
    predictedRevenue: number;
    lowerBound: number;
    upperBound: number;
    confidenceLevel: number;
    expectedGrowth: number;
    expectedGrowthRate: number;
  };

  dailyForecasts: Array<{
    date: string;
    predictedRevenue: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  }>;

  trend: {
    direction: 'UPWARD' | 'DOWNWARD' | 'STABLE';
    slope: number;
    strength: number;
    seasonality: 'NONE' | 'WEEKLY' | 'MONTHLY';
    patterns: string[];
  };

  risk: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    volatilityScore: number;
    uncertaintyScore: number;
    riskFactors: string[];
    opportunities: string[];
  };

  scenarios: {
    optimistic: Scenario;
    realistic: Scenario;
    pessimistic: Scenario;
  };

  recommendations: {
    actionItems: string[];
    warnings: string[];
    opportunities: string[];
    strategy: string;
  };

  accuracy: {
    rSquared: number;
    mae: number;
    rmse: number;
    mape: number;
    reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

interface Scenario {
  name: string;
  predictedRevenue: number;
  probability: number;
  assumptions: string;
  expectedOrders: number;
  expectedAOV: number;
}

export interface RevenueComparison {
  type:
    | 'DAY_OVER_DAY'
    | 'WEEK_OVER_WEEK'
    | 'MONTH_OVER_MONTH'
    | 'QUARTER_OVER_QUARTER'
    | 'YEAR_OVER_YEAR'
    | 'CUSTOM_PERIOD';
  description: string;

  currentPeriod: PeriodMetrics;
  previousPeriod: PeriodMetrics;

  comparison: {
    revenueChange: number;
    revenueGrowthRate: number;
    revenueDirection: 'UP' | 'DOWN' | 'STABLE';
    orderChange: number;
    orderGrowthRate: number;
    orderDirection: 'UP' | 'DOWN' | 'STABLE';
    buyerChange: number;
    buyerGrowthRate: number;
    buyerDirection: 'UP' | 'DOWN' | 'STABLE';
    aovChange: number;
    aovGrowthRate: number;
    aovDirection: 'UP' | 'DOWN' | 'STABLE';
    refundChange: number;
    refundRateChange: number;
    refundDirection: 'UP' | 'DOWN' | 'STABLE';
  };

  performance: {
    overallPerformance: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    performanceScore: number;
    improvements: string[];
    declines: string[];
    momentum: 'ACCELERATING' | 'DECELERATING' | 'STABLE';
    momentumScore: number;
  };

  insights: {
    keyFindings: string[];
    positiveIndicators: string[];
    concerningIndicators: string[];
    recommendations: string[];
    summary: string;
  };
}

interface PeriodMetrics {
  startDate: string;
  endDate: string;
  days: number;
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  platformFee: number;
  orderCount: number;
  buyerCount: number;
  averageOrderValue: number;
  refundAmount: number;
  refundCount: number;
  refundRate: number;
}

// ==================== Category Analytics ====================

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalOrders: number;
  totalRevenue: number;
  activePackages: number;
  averageOrderValue: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  period: string;
  metrics: {
    orderCount: number;
    revenue: number;
    packageCount: number;
    avgOrderValue: number;
    conversionRate: number;
    growthRate: number;
  };
  trends: {
    orderTrend: 'UP' | 'DOWN' | 'STABLE';
    revenueTrend: 'UP' | 'DOWN' | 'STABLE';
    performanceScore: number;
  };
}

export interface CategoryRevenue {
  categoryId: string;
  categoryName: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  revenuePercentage: number;
}

// ==================== Package Analytics ====================

export interface PackagePerformance {
  packageId: string;
  packageTitle: string;
  sellerId: string;
  categoryId: string;

  metrics: {
    viewCount: number;
    uniqueViewCount: number;
    clickCount: number;
    orderCount: number;
    revenue: number;
    favoriteCount: number;
    shareCount: number;
  };

  rates: {
    conversionRate: number;
    clickThroughRate: number;
    favoriteRate: number;
    shareRate: number;
  };

  search: {
    impressions: number;
    clicks: number;
    searchCTR: number;
    avgPosition: number;
  };

  performance: {
    performanceScore: number;
    ranking: number;
    percentile: number;
  };

  growth: {
    viewGrowth: number;
    orderGrowth: number;
    revenueGrowth: number;
  };
}

export interface PackageTrend {
  date: string;
  views: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  searchImpressions: number;
  searchClicks: number;
  favorites: number;
  shares: number;
  movingAvgViews: number;
  movingAvgOrders: number;
  movingAvgRevenue: number;
}

export interface PackageComparison {
  comparisonType: 'CATEGORY' | 'SELLER' | 'PLATFORM';

  package: {
    id: string;
    title: string;
    metrics: PackageMetrics;
  };

  benchmark: {
    name: string;
    metrics: PackageMetrics;
  };

  differences: {
    viewsDiff: number;
    ordersDiff: number;
    revenueDiff: number;
    conversionDiff: number;
    ctrDiff: number;
  };

  percentiles: {
    viewPercentile: number;
    orderPercentile: number;
    revenuePercentile: number;
    overallPercentile: number;
  };

  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

interface PackageMetrics {
  views: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  clickThroughRate: number;
  averageOrderValue: number;
}
