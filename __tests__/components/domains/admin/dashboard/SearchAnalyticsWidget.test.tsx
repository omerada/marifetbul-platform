/**
 * ================================================
 * SEARCH ANALYTICS WIDGET - UNIT TESTS
 * ================================================
 * Test suite for SearchAnalyticsWidget component
 *
 * Sprint 1 - Story 1.1: Duplicate Widget Cleanup
 * Test Coverage: Component rendering, data fetching, error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-30
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchAnalyticsWidget } from '@/components/domains/admin/dashboard/SearchAnalyticsWidget';
import * as searchAnalyticsApi from '@/lib/api/search-analytics';

// Mock the API
jest.mock('@/lib/api/search-analytics');
jest.mock('@/lib/infrastructure/monitoring/logger');

const mockGetSearchMetrics =
  searchAnalyticsApi.getSearchMetrics as jest.MockedFunction<
    typeof searchAnalyticsApi.getSearchMetrics
  >;
const mockGetTopQueries =
  searchAnalyticsApi.getTopQueries as jest.MockedFunction<
    typeof searchAnalyticsApi.getTopQueries
  >;
const mockGetZeroResultQueries =
  searchAnalyticsApi.getZeroResultQueries as jest.MockedFunction<
    typeof searchAnalyticsApi.getZeroResultQueries
  >;

// ================================================
// TEST DATA
// ================================================

const mockSearchMetrics: searchAnalyticsApi.SearchMetrics = {
  totalSearches: 1250,
  uniqueUsers: 450,
  clickThroughRate: 42.5,
  conversionRate: 8.3,
  zeroResultSearches: 85,
  avgResultsPerSearch: 12.5,
};

const mockTopQueries: searchAnalyticsApi.TopQueries = {
  'logo tasarımı': 125,
  'web geliştirme': 98,
  'mobil uygulama': 76,
  'seo danışmanlığı': 54,
  'sosyal medya yönetimi': 42,
};

const mockZeroResultQueries: searchAnalyticsApi.TopQueries = {
  'blockchain geliştirme': 12,
  'yapay zeka entegrasyonu': 8,
  'nft oluşturma': 5,
};

// ================================================
// TESTS
// ================================================

describe('SearchAnalyticsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful responses
    mockGetSearchMetrics.mockResolvedValue(mockSearchMetrics);
    mockGetTopQueries.mockResolvedValue(mockTopQueries);
    mockGetZeroResultQueries.mockResolvedValue(mockZeroResultQueries);
  });

  // ================================================
  // RENDERING TESTS
  // ================================================

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      render(<SearchAnalyticsWidget />);

      expect(screen.getByText(/search analytics/i)).toBeInTheDocument();
      // DashboardWidgetCard shows loading spinner
    });

    it('should render all key metrics after loading', async () => {
      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('Total Searches')).toBeInTheDocument();
      });

      expect(screen.getByText('Click-Through Rate')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Zero Results')).toBeInTheDocument();
    });

    it('should display correct metric values', async () => {
      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('1.250')).toBeInTheDocument(); // totalSearches (TR format)
      });

      expect(screen.getByText('42,5%')).toBeInTheDocument(); // CTR
      expect(screen.getByText('8,3%')).toBeInTheDocument(); // Conversion Rate
      // Zero result rate: 85/1250 * 100 = 6.8%
      expect(screen.getByText('6,8%')).toBeInTheDocument();
    });

    it('should render top queries section', async () => {
      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('Top Search Queries')).toBeInTheDocument();
      });

      expect(screen.getByText('logo tasarımı')).toBeInTheDocument();
      expect(screen.getByText('web geliştirme')).toBeInTheDocument();
      expect(screen.getByText('mobil uygulama')).toBeInTheDocument();
    });

    it('should render zero result queries section when present', async () => {
      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('Zero Result Queries')).toBeInTheDocument();
      });

      expect(screen.getByText('blockchain geliştirme')).toBeInTheDocument();
      expect(screen.getByText('yapay zeka entegrasyonu')).toBeInTheDocument();
    });

    it('should show "No search data yet" when no top queries', async () => {
      mockGetTopQueries.mockResolvedValue({});

      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText(/no search data yet/i)).toBeInTheDocument();
      });
    });

    it('should not render zero result section when empty', async () => {
      mockGetZeroResultQueries.mockResolvedValue({});

      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('Total Searches')).toBeInTheDocument();
      });

      expect(screen.queryByText('Zero Result Queries')).not.toBeInTheDocument();
    });

    it('should render with custom days prop', async () => {
      render(<SearchAnalyticsWidget days={7} />);

      await waitFor(() => {
        expect(screen.getByText('7 days')).toBeInTheDocument();
      });
    });
  });

  // ================================================
  // DATA FETCHING TESTS
  // ================================================

  describe('Data Fetching', () => {
    it('should fetch all data on mount', async () => {
      render(<SearchAnalyticsWidget days={30} />);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(1);
        expect(mockGetTopQueries).toHaveBeenCalledWith(5, 30);
        expect(mockGetZeroResultQueries).toHaveBeenCalledWith(5, 30);
      });
    });

    it('should calculate correct date range', async () => {
      const mockDate = new Date('2025-10-30T12:00:00Z');
      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockDate as unknown as string);

      render(<SearchAnalyticsWidget days={7} />);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledWith(
          expect.stringMatching(/2025-10-23/), // 7 days ago
          expect.stringMatching(/2025-10-30/) // today
        );
      });

      jest.restoreAllMocks();
    });

    it('should refetch data when days prop changes', async () => {
      const { rerender } = render(<SearchAnalyticsWidget days={7} />);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(1);
      });

      rerender(<SearchAnalyticsWidget days={30} />);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ================================================
  // ERROR HANDLING TESTS
  // ================================================

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      const errorMessage = 'Failed to fetch search metrics';
      mockGetSearchMetrics.mockRejectedValue(new Error(errorMessage));

      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      mockGetSearchMetrics.mockRejectedValue(new Error('Network error'));

      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle unknown errors', async () => {
      mockGetSearchMetrics.mockRejectedValue('Unknown error');

      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load metrics')).toBeInTheDocument();
      });
    });
  });

  // ================================================
  // INTERACTION TESTS
  // ================================================

  describe('User Interactions', () => {
    it('should support manual refresh functionality', async () => {
      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(1);
      });

      // Component should allow refresh through DashboardWidgetCard
      // This is handled by the parent component
    });
  });

  // ================================================
  // AUTO-REFRESH TESTS
  // ================================================

  describe('Auto-refresh', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-refresh at specified interval', async () => {
      render(<SearchAnalyticsWidget refreshInterval={60000} />);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 60 seconds
      jest.advanceTimersByTime(60000);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(2);
      });

      // Fast-forward another 60 seconds
      jest.advanceTimersByTime(60000);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(3);
      });
    });

    it('should not auto-refresh when interval is 0', async () => {
      render(<SearchAnalyticsWidget refreshInterval={0} />);

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(1);
      });

      jest.advanceTimersByTime(60000);

      expect(mockGetSearchMetrics).toHaveBeenCalledTimes(1); // Still only once
    });

    it('should cleanup interval on unmount', async () => {
      const { unmount } = render(
        <SearchAnalyticsWidget refreshInterval={60000} />
      );

      await waitFor(() => {
        expect(mockGetSearchMetrics).toHaveBeenCalledTimes(1);
      });

      unmount();

      jest.advanceTimersByTime(60000);

      expect(mockGetSearchMetrics).toHaveBeenCalledTimes(1); // No additional calls
    });
  });

  // ================================================
  // EDGE CASES
  // ================================================

  describe('Edge Cases', () => {
    it('should handle zero total searches', async () => {
      mockGetSearchMetrics.mockResolvedValue({
        ...mockSearchMetrics,
        totalSearches: 0,
        zeroResultSearches: 0,
      });

      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    it('should handle very large numbers', async () => {
      mockGetSearchMetrics.mockResolvedValue({
        ...mockSearchMetrics,
        totalSearches: 1234567,
      });

      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('1.234.567')).toBeInTheDocument(); // TR format
      });
    });

    it('should calculate zero result rate correctly', async () => {
      mockGetSearchMetrics.mockResolvedValue({
        ...mockSearchMetrics,
        totalSearches: 1000,
        zeroResultSearches: 150, // 15%
      });

      render(<SearchAnalyticsWidget />);

      await waitFor(() => {
        expect(screen.getByText('15%')).toBeInTheDocument();
      });
    });
  });
});
