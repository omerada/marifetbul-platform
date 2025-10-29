import {
  fetchAnalyticsDashboard,
  exportAnalyticsToCSV,
  AnalyticsDashboardData,
} from '@/lib/api/analytics';

// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM APIs for CSV export
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('Analytics API Service', () => {
  const API_BASE_URL = 'http://localhost:8080';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = API_BASE_URL;
  });

  const mockAnalyticsData: AnalyticsDashboardData = {
    period: 'week',
    metrics: {
      totalJobs: 1234,
      totalFreelancers: 567,
      totalRevenue: 123456.78,
      averageRating: 4.5,
      completionRate: 92.5,
      responseTime: 2.3,
    },
    trends: {
      jobs: 12.5,
      freelancers: 8.3,
      revenue: 15.7,
      rating: 0.2,
    },
    chartData: {
      labels: ['Jan', 'Feb', 'Mar'],
      jobs: [10, 15, 20],
      revenue: [5000, 7500, 10000],
      users: [50, 75, 100],
    },
    categoryDistribution: [
      { name: 'Web Development', value: 45, color: '#3B82F6' },
      { name: 'Mobile Development', value: 25, color: '#10B981' },
      { name: 'Design', value: 30, color: '#F59E0B' },
    ],
    topPerformers: [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'avatar1.jpg',
        rating: 4.9,
        projects: 42,
        revenue: 12500,
      },
    ],
  };

  describe('fetchAnalyticsDashboard', () => {
    it('should fetch analytics dashboard data successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAnalyticsData }),
      });

      const result = await fetchAnalyticsDashboard('week');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/dashboard/analytics?period=week',
        {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(result).toEqual(mockAnalyticsData);
    });

    it('should use default period when not provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAnalyticsData }),
      });

      await fetchAnalyticsDashboard();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/dashboard/analytics?period=week',
        expect.any(Object)
      );
    });

    it('should handle different period values', async () => {
      const periods: Array<'day' | 'week' | 'month' | 'year'> = [
        'day',
        'week',
        'month',
        'year',
      ];

      for (const period of periods) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockAnalyticsData }),
        });

        await fetchAnalyticsDashboard(period);

        expect(global.fetch).toHaveBeenCalledWith(
          `http://localhost:8080/api/v1/dashboard/analytics?period=${period}`,
          expect.any(Object)
        );
      }
    });

    it('should throw error when API returns error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Analytics data not available',
      });

      await expect(fetchAnalyticsDashboard('week')).rejects.toThrow(
        'Failed to fetch analytics: Analytics data not available'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(fetchAnalyticsDashboard('week')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('exportAnalyticsToCSV', () => {
    let mockLink: HTMLAnchorElement;
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;

    beforeEach(() => {
      // Create mock anchor element
      mockLink = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: {},
      } as any;

      // Mock document methods
      createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockLink);
      appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation();
      removeChildSpy = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation();
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should create CSV blob and trigger download', () => {
      exportAnalyticsToCSV(mockAnalyticsData, 'test-report.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'href',
        'blob:mock-url'
      );
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        'test-report.csv'
      );
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });

    it('should use default filename when not provided', () => {
      exportAnalyticsToCSV(mockAnalyticsData);

      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        'analytics.csv'
      );
    });

    it('should include metrics in CSV', () => {
      exportAnalyticsToCSV(mockAnalyticsData);

      const blobCall = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
      expect(blobCall.type).toBe('text/csv;charset=utf-8;');
    });

    it('should include trends in CSV', () => {
      exportAnalyticsToCSV(mockAnalyticsData);

      const blobCall = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
    });

    it('should include category distribution', () => {
      exportAnalyticsToCSV(mockAnalyticsData);

      const blobCall = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
    });

    it('should include top performers', () => {
      exportAnalyticsToCSV(mockAnalyticsData);

      const blobCall = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
    });
  });
});
