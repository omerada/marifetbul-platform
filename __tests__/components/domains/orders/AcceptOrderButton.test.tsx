/**
 * ================================================
 * ACCEPT ORDER BUTTON - UNIT TESTS
 * ================================================
 * Test suite for AcceptOrderButton component
 *
 * Sprint 3: Order Delivery & Acceptance Flow - Enhanced Coverage
 * Test Coverage: Component rendering, confirmation flow, API integration,
 *               error handling, loading states
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 3: Enhanced Test Coverage
 * @since 2025-10-30
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { AcceptOrderButton } from '@/components/domains/orders/AcceptOrderButton';
import { orderApi } from '@/lib/api/orders';

// Mock dependencies
jest.mock('sonner');
jest.mock('@/lib/api/orders');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe('AcceptOrderButton', () => {
  const mockProps = {
    orderId: 'test-order-456',
    orderTitle: 'Test Project: Website Development',
    amount: 2500,
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================================================
  // RENDERING TESTS
  // ================================================

  describe('Rendering', () => {
    it('should render the accept button with correct text', () => {
      render(<AcceptOrderButton {...mockProps} />);
      const button = screen.getByRole('button', { name: /teslimi onayla/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('w-full');
    });

    it('should display button icon', () => {
      render(<AcceptOrderButton {...mockProps} />);
      const button = screen.getByRole('button', { name: /teslimi onayla/i });
      // CheckCircle icon should be present
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ================================================
  // MODAL INTERACTION TESTS
  // ================================================

  describe('Modal Interactions', () => {
    it('should open confirmation modal when button is clicked', async () => {
      const user = userEvent.setup();
      render(<AcceptOrderButton {...mockProps} />);

      const triggerButton = screen.getByRole('button', {
        name: /teslimi onayla/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Teslimi Onayla')).toBeInTheDocument();
      });
    });

    it('should display order information in modal', async () => {
      const user = userEvent.setup();
      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));

      await waitFor(() => {
        expect(screen.getByText(mockProps.orderTitle)).toBeInTheDocument();
        expect(screen.getByText(/2.500 ₺/i)).toBeInTheDocument();
      });
    });

    it('should display payment warning message', async () => {
      const user = userEvent.setup();
      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));

      await waitFor(() => {
        expect(screen.getByText(/önemli uyarı/i)).toBeInTheDocument();
        expect(
          screen.getByText(/ödeme freelancer'a aktarılacaktır/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/bu işlem geri alınamaz/i)).toBeInTheDocument();
      });
    });

    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      const cancelButton = screen.getByRole('button', { name: /iptal/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ================================================
  // CONFIRMATION CHECKBOX TESTS
  // ================================================

  describe('Confirmation Checkbox', () => {
    it('should render confirmation checkbox', async () => {
      const user = userEvent.setup();
      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', {
          name: /teslim edilen dosyaları inceledim/i,
        });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
      });
    });

    it('should allow checking the confirmation checkbox', async () => {
      const user = userEvent.setup();
      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      const checkbox = screen.getByRole('checkbox', {
        name: /teslim edilen dosyaları inceledim/i,
      });
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  // ================================================
  // API INTEGRATION TESTS
  // ================================================

  describe('API Integration', () => {
    it('should successfully accept order delivery', async () => {
      const user = userEvent.setup();

      // Mock successful API response
      (orderApi.approveDelivery as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<AcceptOrderButton {...mockProps} />);

      // Open modal
      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      // Click confirm button
      const confirmButton = screen.getByRole('button', {
        name: /onayla ve ödemeyi yap/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(orderApi.approveDelivery).toHaveBeenCalledWith(
          mockProps.orderId
        );
        expect(toast.success).toHaveBeenCalledWith(
          'Sipariş başarıyla tamamlandı!',
          expect.objectContaining({
            description: expect.stringContaining('freelancer'),
          })
        );
        expect(mockProps.onSuccess).toHaveBeenCalled();
      });
    });

    it('should handle API error response', async () => {
      const user = userEvent.setup();

      // Mock error API response
      (orderApi.approveDelivery as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Delivery already approved',
      });

      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      const confirmButton = screen.getByRole('button', {
        name: /onayla ve ödemeyi yap/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'İşlem başarısız',
          expect.objectContaining({
            description: expect.stringContaining('Delivery already approved'),
          })
        );
        expect(mockProps.onSuccess).not.toHaveBeenCalled();
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();

      // Mock network error
      (orderApi.approveDelivery as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      const confirmButton = screen.getByRole('button', {
        name: /onayla ve ödemeyi yap/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'İşlem başarısız',
          expect.objectContaining({
            description: expect.stringContaining('Network error'),
          })
        );
      });
    });
  });

  // ================================================
  // LOADING STATE TESTS
  // ================================================

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      // Mock delayed API response
      (orderApi.approveDelivery as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      const confirmButton = screen.getByRole('button', {
        name: /onayla ve ödemeyi yap/i,
      });
      await user.click(confirmButton);

      // Button should show loading state
      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });
    });

    it('should disable all buttons during submission', async () => {
      const user = userEvent.setup();

      (orderApi.approveDelivery as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      const confirmButton = screen.getByRole('button', {
        name: /onayla ve ödemeyi yap/i,
      });
      await user.click(confirmButton);

      const cancelButton = screen.getByRole('button', { name: /iptal/i });
      const checkbox = screen.getByRole('checkbox');

      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
        expect(checkbox).toBeDisabled();
      });
    });

    it('should close modal after successful submission', async () => {
      const user = userEvent.setup();

      (orderApi.approveDelivery as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<AcceptOrderButton {...mockProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      const confirmButton = screen.getByRole('button', {
        name: /onayla ve ödemeyi yap/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ================================================
  // EDGE CASES
  // ================================================

  describe('Edge Cases', () => {
    it('should handle very large amounts correctly', async () => {
      const user = userEvent.setup();
      const largeAmountProps = { ...mockProps, amount: 999999 };

      render(<AcceptOrderButton {...largeAmountProps} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));

      await waitFor(() => {
        // Should format large amounts with thousands separator
        expect(screen.getByText(/999.999 ₺/i)).toBeInTheDocument();
      });
    });

    it('should handle missing onSuccess callback', async () => {
      const user = userEvent.setup();

      (orderApi.approveDelivery as jest.Mock).mockResolvedValue({
        success: true,
      });

      const propsWithoutCallback = {
        orderId: mockProps.orderId,
        orderTitle: mockProps.orderTitle,
        amount: mockProps.amount,
      };

      render(<AcceptOrderButton {...propsWithoutCallback} />);

      await user.click(screen.getByRole('button', { name: /teslimi onayla/i }));
      await waitFor(() => screen.getByRole('dialog'));

      const confirmButton = screen.getByRole('button', {
        name: /onayla ve ödemeyi yap/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(orderApi.approveDelivery).toHaveBeenCalled();
        // Should not throw error when callback is missing
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });
});
