/**
 * ============================================================================
 * PayoutDashboard Component Tests
 * ============================================================================
 * Sprint 1 Story 1.1: Test coverage for improved PayoutDashboard
 *
 * Test Coverage:
 * - Loading states with skeleton
 * - Error states with retry
 * - Empty states (no payouts, insufficient balance)
 * - Stats calculation
 * - Responsive design (mobile/desktop)
 * - User interactions
 *
 * Created: 2025-11-24
 * ============================================================================
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PayoutDashboard } from '@/components/domains/wallet/PayoutDashboard';
import { PayoutStatus } from '@/types/business/features/wallet';
import type {
  Payout,
  PayoutLimits,
  PayoutEligibility,
} from '@/types/business/features/wallet';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockLimits: PayoutLimits = {
  minAmount: 100,
  maxAmount: 10000,
  dailyLimit: 5000,
  monthlyLimit: 50000,
  currency: 'TRY',
};

const mockEligibility: PayoutEligibility = {
  canRequestPayout: true,
  reason: null,
  minimumBalance: 50,
  pendingPayouts: 0,
  nextEligibleDate: null,
};

const mockPayout: Payout = {
  id: '1',
  userId: 'user1',
  amount: 500,
  currency: 'TRY',
  status: PayoutStatus.COMPLETED,
  method: 'BANK_TRANSFER',
  description: 'Test payout',
  requestedAt: new Date().toISOString(),
};

const mockRecentPayouts: Payout[] = [
  mockPayout,
  {
    ...mockPayout,
    id: '2',
    status: PayoutStatus.PENDING,
    amount: 300,
  },
  {
    ...mockPayout,
    id: '3',
    status: PayoutStatus.PROCESSING,
    amount: 700,
  },
];

// ============================================================================
// TESTS: Loading State
// ============================================================================

describe('PayoutDashboard - Loading State', () => {
  it('should render skeleton when loading', () => {
    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
        isLoading={true}
      />
    );

    // Should show multiple skeletons
    const skeletons = screen.getAllByTestId(/skeleton/i);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should not render content when loading', () => {
    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={mockRecentPayouts}
        allPayouts={mockRecentPayouts}
        isLoading={true}
      />
    );

    // Should not show actual data
    expect(screen.queryByText('₺1.000,00')).not.toBeInTheDocument();
  });
});

// ============================================================================
// TESTS: Error State
// ============================================================================

describe('PayoutDashboard - Error State', () => {
  it('should render error state when error provided', () => {
    const error = new Error('Failed to load payouts');
    const onRetry = jest.fn();

    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
        error={error}
        onRetry={onRetry}
      />
    );

    expect(
      screen.getByText(/Veri Yüklenirken Hata Oluştu/i)
    ).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const error = new Error('Test error');
    const onRetry = jest.fn();

    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
        error={error}
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not show retry button when onRetry not provided', () => {
    const error = new Error('Test error');

    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
        error={error}
      />
    );

    expect(
      screen.queryByRole('button', { name: /Tekrar Dene/i })
    ).not.toBeInTheDocument();
  });
});

// ============================================================================
// TESTS: Empty State
// ============================================================================

describe('PayoutDashboard - Empty State', () => {
  it('should render empty state when no payouts', () => {
    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
      />
    );

    expect(screen.getByText(/Henüz çekim talebiniz yok/i)).toBeInTheDocument();
  });

  it('should show insufficient balance message when balance < min', () => {
    render(
      <PayoutDashboard
        availableBalance={50} // Less than minAmount (100)
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
      />
    );

    expect(
      screen.getByText(/minimum.*bakiyeye ihtiyacınız var/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/₺50,00/i)).toBeInTheDocument();
  });

  it('should disable payout button when balance insufficient', () => {
    render(
      <PayoutDashboard
        availableBalance={50}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
        onRequestPayout={jest.fn()}
      />
    );

    const button = screen.queryByRole('button', {
      name: /İlk Çekim Talebini Oluştur/i,
    });
    expect(button).toBeDisabled();
  });
});

// ============================================================================
// TESTS: Stats Calculation
// ============================================================================

describe('PayoutDashboard - Stats Calculation', () => {
  it('should calculate stats correctly', async () => {
    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={mockRecentPayouts}
        allPayouts={mockRecentPayouts}
      />
    );

    await waitFor(() => {
      // Pending count: 1
      expect(screen.getByText('1')).toBeInTheDocument();

      // Total amounts should be displayed
      expect(screen.getAllByText(/₺/).length).toBeGreaterThan(0);
    });
  });

  it('should show correct status badges', () => {
    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={mockRecentPayouts}
        allPayouts={mockRecentPayouts}
      />
    );

    expect(screen.getByText('Beklemede')).toBeInTheDocument();
    expect(screen.getByText('İşleniyor')).toBeInTheDocument();
    expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
  });
});

// ============================================================================
// TESTS: User Interactions
// ============================================================================

describe('PayoutDashboard - User Interactions', () => {
  it('should call onRequestPayout when button clicked', async () => {
    const user = userEvent.setup();
    const onRequestPayout = jest.fn();

    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
        onRequestPayout={onRequestPayout}
      />
    );

    const button = screen.getByRole('button', {
      name: /İlk Çekim Talebini Oluştur/i,
    });
    await user.click(button);

    expect(onRequestPayout).toHaveBeenCalledTimes(1);
  });

  it('should call onViewAllPayouts when view all clicked', async () => {
    const user = userEvent.setup();
    const onViewAllPayouts = jest.fn();

    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={mockRecentPayouts}
        allPayouts={mockRecentPayouts}
        onViewAllPayouts={onViewAllPayouts}
      />
    );

    const button = screen.getByRole('button', { name: /Tümünü Gör/i });
    await user.click(button);

    expect(onViewAllPayouts).toHaveBeenCalledTimes(1);
  });

  it('should disable payout button when not eligible', () => {
    const ineligibleStatus: PayoutEligibility = {
      ...mockEligibility,
      canRequestPayout: false,
      reason: 'Account verification pending',
    };

    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={ineligibleStatus}
        recentPayouts={[]}
        allPayouts={[]}
        onRequestPayout={jest.fn()}
      />
    );

    const button = screen.getByRole('button', {
      name: /Çekim Talebi Oluştur/i,
    });
    expect(button).toBeDisabled();
  });
});

// ============================================================================
// TESTS: Eligibility Banner
// ============================================================================

describe('PayoutDashboard - Eligibility Banner', () => {
  it('should show warning banner when not eligible', () => {
    const ineligibleStatus: PayoutEligibility = {
      ...mockEligibility,
      canRequestPayout: false,
      reason: 'Minimum balance requirement not met',
    };

    render(
      <PayoutDashboard
        availableBalance={30}
        limits={mockLimits}
        eligibility={ineligibleStatus}
        recentPayouts={[]}
        allPayouts={[]}
      />
    );

    expect(
      screen.getByText(/Çekim Talebinde Bulunamazsınız/i)
    ).toBeInTheDocument();
    expect(screen.getByText(ineligibleStatus.reason)).toBeInTheDocument();
  });

  it('should not show banner when eligible', () => {
    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
      />
    );

    expect(
      screen.queryByText(/Çekim Talebinde Bulunamazsınız/i)
    ).not.toBeInTheDocument();
  });
});

// ============================================================================
// TESTS: Responsive Design
// ============================================================================

describe('PayoutDashboard - Responsive Design', () => {
  it('should render all stat cards on desktop', () => {
    render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={mockRecentPayouts}
        allPayouts={mockRecentPayouts}
      />
    );

    expect(screen.getByText('Kullanılabilir Bakiye')).toBeInTheDocument();
    expect(screen.getByText('Bekleyen Çekimler')).toBeInTheDocument();
    expect(screen.getByText('Tamamlanan Çekimler')).toBeInTheDocument();
    expect(screen.getByText('Bu Ay Toplam')).toBeInTheDocument();
  });

  it('should show limit progress bars', () => {
    const { container } = render(
      <PayoutDashboard
        availableBalance={1000}
        limits={mockLimits}
        eligibility={mockEligibility}
        recentPayouts={[]}
        allPayouts={[]}
      />
    );

    // Progress bars should exist
    const progressBars = container.querySelectorAll(
      '.h-2.overflow-hidden.rounded-full'
    );
    expect(progressBars.length).toBeGreaterThanOrEqual(2);
  });
});
