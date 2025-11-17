import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentRetryButton } from '@/components/domains/payments';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('PaymentRetryButton', () => {
  const mockPaymentId = 'payment-123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Loading State', () => {
    it('should show loading state while fetching retry status', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      expect(screen.getByText(/Kontrol ediliyor/i)).toBeInTheDocument();
    });
  });

  describe('Retry Status Display', () => {
    it('should show "Retry Available" when retry is ready', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canRetry: true,
          retryCount: 1,
          maxRetries: 5,
          status: 'PENDING',
          nextRetryAt: null,
        }),
      });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      await waitFor(() => {
        expect(screen.getByText(/Tekrar Dene/i)).toBeInTheDocument();
      });
    });

    it('should show countdown timer when retry is not ready yet', async () => {
      const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canRetry: false,
          retryCount: 1,
          maxRetries: 5,
          status: 'PENDING',
          nextRetryAt,
        }),
      });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      await waitFor(() => {
        expect(screen.getByText(/\d:\d{2}/)).toBeInTheDocument();
      });
    });

    it('should show "Exhausted" badge when max retries reached', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canRetry: false,
          retryCount: 5,
          maxRetries: 5,
          status: 'EXHAUSTED',
        }),
      });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      await waitFor(() => {
        expect(screen.getByText(/Tükendi/i)).toBeInTheDocument();
      });
    });

    it('should show retry count badge', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canRetry: true,
          retryCount: 2,
          maxRetries: 5,
          status: 'PENDING',
        }),
      });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      await waitFor(() => {
        expect(screen.getByText(/2\/5/)).toBeInTheDocument();
      });
    });
  });

  describe('Manual Retry', () => {
    it('should trigger retry on button click', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            canRetry: true,
            retryCount: 1,
            maxRetries: 5,
            status: 'PENDING',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      const retryButton = await screen.findByRole('button', {
        name: /Tekrar Dene/i,
      });

      await act(async () => {
        await userEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/payments/${mockPaymentId}/retry`),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should show success toast on successful retry', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            canRetry: true,
            retryCount: 1,
            maxRetries: 5,
            status: 'PENDING',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      const retryButton = await screen.findByRole('button', {
        name: /Tekrar Dene/i,
      });

      await act(async () => {
        await userEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Başarılı'),
          expect.any(Object)
        );
      });
    });

    it('should show error toast on failed retry', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            canRetry: true,
            retryCount: 1,
            maxRetries: 5,
            status: 'PENDING',
          }),
        })
        .mockRejectedValueOnce(new Error('Retry failed'));

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      const retryButton = await screen.findByRole('button', {
        name: /Tekrar Dene/i,
      });

      await act(async () => {
        await userEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Hata'),
          expect.any(Object)
        );
      });
    });

    it('should disable button while retry is in progress', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            canRetry: true,
            retryCount: 1,
            maxRetries: 5,
            status: 'PENDING',
          }),
        })
        .mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      const retryButton = await screen.findByRole('button', {
        name: /Tekrar Dene/i,
      });

      await act(async () => {
        await userEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(retryButton).toBeDisabled();
      });
    });
  });

  describe('Countdown Timer', () => {
    it('should update countdown every second', async () => {
      const nextRetryAt = new Date(Date.now() + 10 * 1000).toISOString();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canRetry: false,
          retryCount: 1,
          maxRetries: 5,
          status: 'PENDING',
          nextRetryAt,
        }),
      });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      await waitFor(() => {
        expect(screen.getByText(/0:09/)).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/0:08/)).toBeInTheDocument();
      });
    });

    it('should enable retry button when countdown reaches zero', async () => {
      const nextRetryAt = new Date(Date.now() + 2 * 1000).toISOString();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            canRetry: false,
            retryCount: 1,
            maxRetries: 5,
            status: 'PENDING',
            nextRetryAt,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            canRetry: true,
            retryCount: 1,
            maxRetries: 5,
            status: 'PENDING',
          }),
        });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      const button = await screen.findByRole('button');
      expect(button).toBeDisabled();

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message on fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      await waitFor(() => {
        expect(screen.getByText(/Retry durumu alınamadı/i)).toBeInTheDocument();
      });
    });

    it('should retry loading on refresh', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            canRetry: true,
            retryCount: 1,
            maxRetries: 5,
            status: 'PENDING',
          }),
        });

      const { rerender } = render(
        <PaymentRetryButton paymentId={mockPaymentId} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Retry durumu alınamadı/i)).toBeInTheDocument();
      });

      rerender(<PaymentRetryButton paymentId={mockPaymentId} />);

      await waitFor(() => {
        expect(screen.getByText(/Tekrar Dene/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          canRetry: true,
          retryCount: 1,
          maxRetries: 5,
          status: 'PENDING',
        }),
      });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      const button = await screen.findByRole('button');
      expect(button).toHaveAccessibleName();
    });

    it('should be keyboard navigable', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            canRetry: true,
            retryCount: 1,
            maxRetries: 5,
            status: 'PENDING',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<PaymentRetryButton paymentId={mockPaymentId} />);

      const button = await screen.findByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      await act(async () => {
        await userEvent.keyboard('{Enter}');
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });
});
