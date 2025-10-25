/**
 * Analytics API Service
 * Handles analytics dashboard data fetching
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types matching backend AnalyticsDashboardController response
export interface AnalyticsMetrics {
  totalJobs: number;
  totalFreelancers: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  responseTime: number;
}

export interface AnalyticsTrends {
  jobs: number;
  freelancers: number;
  revenue: number;
  rating: number;
}

export interface AnalyticsChartData {
  labels: string[];
  jobs: number[];
  revenue: number[];
  users: number[];
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  projects: number;
  revenue: number;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';

export interface AnalyticsDashboardData {
  period: AnalyticsPeriod;
  metrics: AnalyticsMetrics;
  trends: AnalyticsTrends;
  chartData: AnalyticsChartData;
  categoryDistribution: CategoryDistribution[];
  topPerformers: TopPerformer[];
}

/**
 * Fetch analytics dashboard data
 * @param period - Time period: day, week, month, or year
 * @returns Analytics dashboard data
 */
export async function fetchAnalyticsDashboard(
  period: AnalyticsPeriod = 'week'
): Promise<AnalyticsDashboardData> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/analytics/dashboard?period=${period}`,
    {
      credentials: 'include', // Include httpOnly cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Export analytics data to CSV
 * @param data - Analytics data to export
 * @param filename - Output filename
 */
export function exportAnalyticsToCSV(
  data: AnalyticsDashboardData,
  filename: string = 'analytics.csv'
): void {
  // Create CSV content
  const csvRows: string[] = [];

  // Header
  csvRows.push('Analytics Report');
  csvRows.push(`Period: ${data.period}`);
  csvRows.push('');

  // Metrics
  csvRows.push('Metrics');
  csvRows.push('Metric,Value');
  csvRows.push(`Total Jobs,${data.metrics.totalJobs}`);
  csvRows.push(`Total Freelancers,${data.metrics.totalFreelancers}`);
  csvRows.push(`Total Revenue,${data.metrics.totalRevenue}`);
  csvRows.push(`Average Rating,${data.metrics.averageRating}`);
  csvRows.push(`Completion Rate,${data.metrics.completionRate}%`);
  csvRows.push(`Response Time,${data.metrics.responseTime}h`);
  csvRows.push('');

  // Trends
  csvRows.push('Trends');
  csvRows.push('Category,Growth Rate');
  csvRows.push(`Jobs,${data.trends.jobs}%`);
  csvRows.push(`Freelancers,${data.trends.freelancers}%`);
  csvRows.push(`Revenue,${data.trends.revenue}%`);
  csvRows.push(`Rating,${data.trends.rating}%`);
  csvRows.push('');

  // Chart Data
  csvRows.push('Time Series Data');
  csvRows.push(`Label,${data.chartData.labels.join(',')}`);
  csvRows.push(`Jobs,${data.chartData.jobs.join(',')}`);
  csvRows.push(`Revenue,${data.chartData.revenue.join(',')}`);
  csvRows.push(`Users,${data.chartData.users.join(',')}`);
  csvRows.push('');

  // Category Distribution
  csvRows.push('Category Distribution');
  csvRows.push('Category,Value');
  data.categoryDistribution.forEach((cat) => {
    csvRows.push(`${cat.name},${cat.value}`);
  });
  csvRows.push('');

  // Top Performers
  csvRows.push('Top Performers');
  csvRows.push('Name,Rating,Projects,Revenue');
  data.topPerformers.forEach((performer) => {
    csvRows.push(
      `${performer.name},${performer.rating},${performer.projects},${performer.revenue}`
    );
  });

  // Create blob and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
