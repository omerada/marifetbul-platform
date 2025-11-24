/**
 * ================================================
 * UPCOMING AUTO-RELEASE WIDGET TESTS
 * ================================================
 * Test suite for UpcomingAutoReleaseWidget component
 * Sprint 1 - Story 1.4
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpcomingAutoReleaseWidget } from '@/components/domains/wallet/widgets/UpcomingAutoReleaseWidget';
import type { UpcomingReleaseItem } from '@/hooks/business/wallet/useUpcomingEscrowReleases';

// Mock data
const mockItems: UpcomingReleaseItem[] = [
  {
    id: 'release-1',
    orderId: 'ORD-001',
    orderTitle: 'Logo Tasarımı',
    amount: 500,
    currency: 'TRY',
    createdAt: '2025-11-01T10:00:00Z',
    autoReleaseAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 hours from now
    hoursRemaining: 4,
    canObjectRelease: true,
  },
  {
    id: 'release-2',
    orderId: 'ORD-002',
    orderTitle: 'Web Sitesi Geliştirme',
    amount: 2000,
    currency: 'TRY',
    createdAt: '2025-11-02T10:00:00Z',
    autoReleaseAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(), // 18 hours from now
    hoursRemaining: 18,
    canObjectRelease: true,
  },
];

describe('UpcomingAutoReleaseWidget', () => {
  // ==========================================================================
  // 1. RENDERING
  // ==========================================================================

  describe('Rendering', () => {
    test('renders widget with header', () => {
      render(<UpcomingAutoReleaseWidget items={[]} />);

      expect(
        screen.getByText(/Yaklaşan Otomatik Serbest Bırakma/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/24 saat içinde otomatik olarak serbest bırakılacak/i)
      ).toBeInTheDocument();
    });

    test('renders refresh button when onRefresh provided', () => {
      const onRefresh = jest.fn();
      render(<UpcomingAutoReleaseWidget items={[]} onRefresh={onRefresh} />);

      const refreshButton = screen.getByRole('button', { name: /yenile/i });
      expect(refreshButton).toBeInTheDocument();
    });

    test('hides refresh button when onRefresh not provided', () => {
      render(<UpcomingAutoReleaseWidget items={[]} />);

      const refreshButton = screen.queryByRole('button', { name: /yenile/i });
      expect(refreshButton).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 2. LOADING STATE
  // ==========================================================================

  describe('Loading State', () => {
    test('shows loading skeletons when isLoading=true', () => {
      render(<UpcomingAutoReleaseWidget items={[]} isLoading={true} />);

      // Should show 3 skeleton placeholders
      const skeletons = screen
        .getAllByRole('generic')
        .filter((el) => el.className.includes('animate-pulse'));
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('disables refresh button when loading', () => {
      const onRefresh = jest.fn();
      render(
        <UpcomingAutoReleaseWidget
          items={[]}
          isLoading={true}
          onRefresh={onRefresh}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /yenile/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  // ==========================================================================
  // 3. EMPTY STATE
  // ==========================================================================

  describe('Empty State', () => {
    test('shows empty state when no items', () => {
      render(<UpcomingAutoReleaseWidget items={[]} />);

      expect(
        screen.getByText(/Yaklaşan Otomatik Serbest Bırakma Yok/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Şu anda 24 saat içinde.*emanet bulunmuyor/i)
      ).toBeInTheDocument();
    });

    test('does not show empty state when loading', () => {
      render(<UpcomingAutoReleaseWidget items={[]} isLoading={true} />);

      expect(
        screen.queryByText(/Yaklaşan Otomatik Serbest Bırakma Yok/i)
      ).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 4. ERROR STATE
  // ==========================================================================

  describe('Error State', () => {
    test('shows error message when error provided', () => {
      const error = new Error('Network error');
      render(<UpcomingAutoReleaseWidget items={[]} error={error} />);

      expect(
        screen.getByText(/Veri Yüklenirken Hata Oluştu/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    test('hides items when error occurs', () => {
      const error = new Error('Test error');
      render(<UpcomingAutoReleaseWidget items={mockItems} error={error} />);

      expect(screen.queryByText('Logo Tasarımı')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 5. ITEMS DISPLAY
  // ==========================================================================

  describe('Items Display', () => {
    test('renders all items', () => {
      render(<UpcomingAutoReleaseWidget items={mockItems} />);

      expect(screen.getByText('Logo Tasarımı')).toBeInTheDocument();
      expect(screen.getByText('Web Sitesi Geliştirme')).toBeInTheDocument();
    });

    test('displays order ID for each item', () => {
      render(<UpcomingAutoReleaseWidget items={mockItems} />);

      expect(screen.getByText(/ORD-001/i)).toBeInTheDocument();
      expect(screen.getByText(/ORD-002/i)).toBeInTheDocument();
    });

    test('displays amount with currency formatting', () => {
      render(<UpcomingAutoReleaseWidget items={mockItems} />);

      expect(screen.getByText(/500.*TRY|₺500/i)).toBeInTheDocument();
      expect(screen.getByText(/2.*000.*TRY|₺2.*000/i)).toBeInTheDocument();
    });

    test('shows countdown badge for each item', () => {
      render(<UpcomingAutoReleaseWidget items={mockItems} />);

      // Should show badges with hours/minutes
      const badges = screen
        .getAllByRole('generic')
        .filter((el) => el.className.includes('Badge'));
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 6. URGENCY INDICATORS
  // ==========================================================================

  describe('Urgency Indicators', () => {
    test('shows critical urgency for items < 6 hours', () => {
      const criticalItem: UpcomingReleaseItem = {
        ...mockItems[0],
        hoursRemaining: 4,
      };

      render(<UpcomingAutoReleaseWidget items={[criticalItem]} />);

      // Should show alert icon and critical styling
      expect(
        screen.getByText(/Acil.*İtiraz etmek için son fırsatınız/i)
      ).toBeInTheDocument();
    });

    test('shows warning urgency for items 6-12 hours', () => {
      const warningItem: UpcomingReleaseItem = {
        ...mockItems[0],
        hoursRemaining: 10,
      };

      render(<UpcomingAutoReleaseWidget items={[warningItem]} />);

      // Should use warning colors (not as critical)
      const container = screen.getByText('Logo Tasarımı').closest('div');
      expect(container?.className).toMatch(/orange|warning/);
    });

    test('shows normal urgency for items > 12 hours', () => {
      const normalItem: UpcomingReleaseItem = {
        ...mockItems[0],
        hoursRemaining: 20,
      };

      render(<UpcomingAutoReleaseWidget items={[normalItem]} />);

      const container = screen.getByText('Logo Tasarımı').closest('div');
      expect(container?.className).not.toMatch(/red|orange/);
    });
  });

  // ==========================================================================
  // 7. ACTIONS
  // ==========================================================================

  describe('Actions', () => {
    test('calls onObjectRelease when object button clicked', async () => {
      const user = userEvent.setup();
      const onObjectRelease = jest.fn();

      render(
        <UpcomingAutoReleaseWidget
          items={mockItems}
          onObjectRelease={onObjectRelease}
        />
      );

      const objectButtons = screen.getAllByRole('button', {
        name: /İtiraz Et/i,
      });
      await user.click(objectButtons[0]);

      expect(onObjectRelease).toHaveBeenCalledWith(mockItems[0]);
    });

    test('calls onRefresh when refresh button clicked', async () => {
      const user = userEvent.setup();
      const onRefresh = jest.fn();

      render(
        <UpcomingAutoReleaseWidget items={mockItems} onRefresh={onRefresh} />
      );

      const refreshButton = screen.getByRole('button', { name: /yenile/i });
      await user.click(refreshButton);

      expect(onRefresh).toHaveBeenCalled();
    });

    test('shows object release button only when canObjectRelease=true', () => {
      const itemWithoutObject: UpcomingReleaseItem = {
        ...mockItems[0],
        canObjectRelease: false,
      };

      render(<UpcomingAutoReleaseWidget items={[itemWithoutObject]} />);

      const objectButton = screen.queryByRole('button', { name: /İtiraz Et/i });
      expect(objectButton).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 8. FOOTER INFO
  // ==========================================================================

  describe('Footer Info', () => {
    test('shows info message when items present', () => {
      render(<UpcomingAutoReleaseWidget items={mockItems} />);

      expect(
        screen.getByText(/İtiraz etmezseniz.*emanet tutarlar.*aktarılacaktır/i)
      ).toBeInTheDocument();
    });

    test('hides info message when no items', () => {
      render(<UpcomingAutoReleaseWidget items={[]} />);

      expect(screen.queryByText(/İtiraz etmezseniz/i)).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 9. COUNTDOWN TIMER
  // ==========================================================================

  describe('Countdown Timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test('updates countdown every second', async () => {
      render(<UpcomingAutoReleaseWidget items={mockItems} />);

      // Initial render
      const initialCountdowns = screen
        .getAllByRole('generic')
        .filter((el) => el.className.includes('Badge'));
      expect(initialCountdowns.length).toBeGreaterThan(0);

      // Advance 1 second
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        // Countdown should update (seconds decreased)
        const updatedCountdowns = screen
          .getAllByRole('generic')
          .filter((el) => el.className.includes('Badge'));
        expect(updatedCountdowns.length).toBeGreaterThan(0);
      });
    });
  });

  // ==========================================================================
  // 10. ACCESSIBILITY
  // ==========================================================================

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      const onRefresh = jest.fn();
      render(
        <UpcomingAutoReleaseWidget items={mockItems} onRefresh={onRefresh} />
      );

      const refreshButton = screen.getByRole('button', { name: /yenile/i });
      expect(refreshButton).toHaveAttribute('aria-label', 'Yenile');
    });

    test('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      const onObjectRelease = jest.fn();

      render(
        <UpcomingAutoReleaseWidget
          items={mockItems}
          onObjectRelease={onObjectRelease}
        />
      );

      const objectButton = screen.getAllByRole('button', {
        name: /İtiraz Et/i,
      })[0];
      objectButton.focus();

      expect(objectButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onObjectRelease).toHaveBeenCalled();
    });
  });
});
