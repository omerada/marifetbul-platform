/**
 * ================================================
 * JOB ANALYTICS PAGE - UNIT TESTS
 * ================================================
 * Tests for employer job analytics dashboard
 *
 * Test Coverage:
 * - Analytics calculation logic
 * - Loading states
 * - Empty state
 * - Data visualization
 * - Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-24
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock dependencies BEFORE importing components
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/business/jobs/useJobs', () => ({
  useJobs: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  Briefcase: () => <div>Briefcase</div>,
  Eye: () => <div>Eye</div>,
  Users: () => <div>Users</div>,
  TrendingUp: () => <div>TrendingUp</div>,
  Clock: () => <div>Clock</div>,
  BarChart3: () => <div>BarChart3</div>,
  Plus: () => <div>Plus</div>,
  Info: () => <div>Info</div>,
}));

// Mock Empty/Loading/Error state components to avoid lucide-react issues
jest.mock('@/components/domains/jobs/analytics/EmptyAnalyticsState', () => ({
  EmptyAnalyticsState: () => <div data-testid="empty-state">No jobs yet</div>,
  AnalyticsLoadingState: () => (
    <div data-testid="loading-state">Loading...</div>
  ),
  AnalyticsErrorState: ({ onRetry }: { onRetry?: () => void }) => (
    <div data-testid="error-state">
      Error occurred
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
}));

// NOW import components after mocks are set up
import { useRouter } from 'next/navigation';
import JobAnalyticsPage from '@/app/dashboard/my-jobs/analytics/page';
import { useJobs } from '@/hooks/business/jobs/useJobs';

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockJobs = [
  {
    id: '1',
    title: 'Web Developer',
    status: 'OPEN',
    proposalCount: 5,
    viewCount: 100,
    category: { id: '1', name: 'Web Development', slug: 'web-dev' },
    createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Mobile App',
    status: 'IN_PROGRESS',
    proposalCount: 3,
    viewCount: 50,
    category: { id: '1', name: 'Web Development', slug: 'web-dev' },
    createdAt: '2025-11-10T00:00:00Z',
  },
  {
    id: '3',
    title: 'Logo Design',
    status: 'COMPLETED',
    proposalCount: 8,
    viewCount: 150,
    category: { id: '2', name: 'Graphic Design', slug: 'graphic' },
    createdAt: '2025-11-15T00:00:00Z',
  },
  {
    id: '4',
    title: 'SEO Optimization',
    status: 'OPEN',
    proposalCount: 2,
    viewCount: 30,
    category: { id: '3', name: 'Digital Marketing', slug: 'marketing' },
    createdAt: '2025-11-20T00:00:00Z',
  },
];

describe('JobAnalyticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Loading State', () => {
    it('should render loading skeletons when data is loading', () => {
      (useJobs as jest.Mock).mockReturnValue({
        jobs: [],
        isLoading: true,
        error: null,
        fetchMyJobs: jest.fn(),
      });

      render(<JobAnalyticsPage />);

      // Should show 6 skeleton cards (for stats grid)
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not render analytics content while loading', () => {
      (useJobs as jest.Mock).mockReturnValue({
        jobs: [],
        isLoading: true,
        error: null,
        fetchMyJobs: jest.fn(),
      });

      render(<JobAnalyticsPage />);

      expect(screen.queryByText('İş İlanı Analitiği')).not.toBeInTheDocument();
    });
  });

  describe('Analytics Calculations', () => {
    beforeEach(() => {
      (useJobs as jest.Mock).mockReturnValue({
        jobs: mockJobs,
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });
    });

    it('should calculate total jobs correctly', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument(); // Total jobs
      });
    });

    it('should calculate active jobs correctly', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('2 aktif ilan')).toBeInTheDocument(); // 2 OPEN jobs
      });
    });

    it('should calculate total proposals correctly', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('18')).toBeInTheDocument(); // 5+3+8+2 = 18 total proposals
      });
    });

    it('should calculate average proposals per job correctly', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Ortalama 5 teklif\/ilan/)).toBeInTheDocument(); // 18/4 ≈ 5
      });
    });

    it('should calculate total views correctly', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('330')).toBeInTheDocument(); // 100+50+150+30 = 330
      });
    });

    it('should calculate average views per job correctly', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Ortalama 83 görüntülenme\/ilan/)
        ).toBeInTheDocument(); // 330/4 ≈ 83
      });
    });

    it('should identify top category correctly', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        // Web Development appears 2 times (most common)
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });
    });

    it('should calculate status distribution correctly', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        // Should show counts for each status
        const statusCards = screen.getAllByRole('heading', { level: 3 });
        expect(statusCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty State', () => {
    it('should handle empty jobs array gracefully', async () => {
      (useJobs as jest.Mock).mockReturnValue({
        jobs: [],
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });

      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('İş İlanı Analitiği')).toBeInTheDocument();
      });

      // All counts should be 0
      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    it('should show N/A for top category when no jobs exist', async () => {
      (useJobs as jest.Mock).mockReturnValue({
        jobs: [],
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });

      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (useJobs as jest.Mock).mockReturnValue({
        jobs: mockJobs,
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });
    });

    it('should render back button', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('İşlerime Dön')).toBeInTheDocument();
      });
    });

    it('should navigate back to my jobs page when back button clicked', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        const backButton = screen.getByText('İşlerime Dön');
        backButton.click();
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/my-jobs');
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch jobs on mount', () => {
      const fetchMyJobs = jest.fn();
      (useJobs as jest.Mock).mockReturnValue({
        jobs: [],
        isLoading: false,
        error: null,
        fetchMyJobs,
      });

      render(<JobAnalyticsPage />);

      expect(fetchMyJobs).toHaveBeenCalledWith({ page: 0, size: 100 });
    });

    it('should fetch large dataset for accurate analytics', () => {
      const fetchMyJobs = jest.fn();
      (useJobs as jest.Mock).mockReturnValue({
        jobs: [],
        isLoading: false,
        error: null,
        fetchMyJobs,
      });

      render(<JobAnalyticsPage />);

      // Should fetch 100 items for comprehensive analytics
      expect(fetchMyJobs).toHaveBeenCalledWith(
        expect.objectContaining({ size: 100 })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle jobs without proposal count', async () => {
      const jobsWithoutProposals = [
        {
          id: '1',
          title: 'Test Job',
          status: 'OPEN',
          viewCount: 10,
          category: { id: '1', name: 'Test', slug: 'test' },
        },
      ];

      (useJobs as jest.Mock).mockReturnValue({
        jobs: jobsWithoutProposals,
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });

      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 proposals
      });
    });

    it('should handle jobs without view count', async () => {
      const jobsWithoutViews = [
        {
          id: '1',
          title: 'Test Job',
          status: 'OPEN',
          proposalCount: 5,
          category: { id: '1', name: 'Test', slug: 'test' },
        },
      ];

      (useJobs as jest.Mock).mockReturnValue({
        jobs: jobsWithoutViews,
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });

      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 views
      });
    });

    it('should handle jobs without category', async () => {
      const jobsWithoutCategory = [
        {
          id: '1',
          title: 'Test Job',
          status: 'OPEN',
          proposalCount: 5,
          viewCount: 10,
        },
      ];

      (useJobs as jest.Mock).mockReturnValue({
        jobs: jobsWithoutCategory,
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });

      render(<JobAnalyticsPage />);

      await waitFor(() => {
        // Should show 'Diğer' for undefined category
        expect(screen.getByText('Diğer')).toBeInTheDocument();
      });
    });

    it('should prevent division by zero in averages', async () => {
      (useJobs as jest.Mock).mockReturnValue({
        jobs: [],
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });

      render(<JobAnalyticsPage />);

      await waitFor(() => {
        // Should show 0 averages, not NaN or Infinity
        expect(screen.getByText(/Ortalama 0 teklif\/ilan/)).toBeInTheDocument();
        expect(
          screen.getByText(/Ortalama 0 görüntülenme\/ilan/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useJobs as jest.Mock).mockReturnValue({
        jobs: mockJobs,
        isLoading: false,
        error: null,
        fetchMyJobs: jest.fn(),
      });
    });

    it('should render page title', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('İş İlanı Analitiği')).toBeInTheDocument();
      });
    });

    it('should render descriptive text', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(
          screen.getByText('İş ilanlarınızın performansını görüntüleyin')
        ).toBeInTheDocument();
      });
    });

    it('should have accessible stat labels', async () => {
      render(<JobAnalyticsPage />);

      await waitFor(() => {
        expect(screen.getByText('Toplam İş İlanı')).toBeInTheDocument();
        expect(screen.getByText('Toplam Teklif')).toBeInTheDocument();
        expect(screen.getByText('Toplam Görüntülenme')).toBeInTheDocument();
      });
    });
  });
});
