/**
 * ================================================
 * OBJECT RELEASE MODAL TESTS
 * ================================================
 * Test suite for ObjectReleaseModal component
 * Sprint 1 - Story 1.4
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObjectReleaseModal } from '@/components/domains/wallet/ObjectReleaseModal';
import { apiClient } from '@/lib/infrastructure/api/client';
import type { UpcomingReleaseItem } from '@/hooks/business/wallet/useUpcomingEscrowReleases';

// Mock dependencies
jest.mock('@/lib/infrastructure/api/client');
jest.mock('@/hooks/core/useToast', () => ({
  useToast: () => ({
    error: jest.fn(),
  }),
}));

// Mock data
const mockItem: UpcomingReleaseItem = {
  id: 'release-1',
  orderId: 'ORD-001',
  orderTitle: 'Logo Tasarımı',
  amount: 500,
  currency: 'TRY',
  createdAt: '2025-11-01T10:00:00Z',
  autoReleaseAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
  hoursRemaining: 4,
  canObjectRelease: true,
};

describe('ObjectReleaseModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. RENDERING
  // ==========================================================================

  describe('Rendering', () => {
    test('renders modal when open', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      expect(
        screen.getByText(/Otomatik Serbest Bırakmaya İtiraz/i)
      ).toBeInTheDocument();
    });

    test('does not render modal when closed', () => {
      render(
        <ObjectReleaseModal
          item={mockItem}
          isOpen={false}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.queryByText(/Otomatik Serbest Bırakmaya İtiraz/i)
      ).not.toBeInTheDocument();
    });

    test('does not render when item is null', () => {
      render(
        <ObjectReleaseModal item={null} isOpen={true} onClose={jest.fn()} />
      );

      expect(
        screen.queryByText(/Otomatik Serbest Bırakmaya İtiraz/i)
      ).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 2. ORDER INFORMATION
  // ==========================================================================

  describe('Order Information', () => {
    test('displays order title', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      expect(screen.getByText('Logo Tasarımı')).toBeInTheDocument();
    });

    test('displays order ID', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      expect(screen.getByText(/ORD-001/i)).toBeInTheDocument();
    });

    test('displays amount with currency', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      expect(screen.getByText(/500.*TRY|₺500/i)).toBeInTheDocument();
    });

    test('displays hours remaining badge', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      expect(screen.getByText(/4 saat kaldı/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 3. WARNING INFORMATION
  // ==========================================================================

  describe('Warning Information', () => {
    test('shows consequences of objection', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      expect(
        screen.getByText(/Otomatik serbest bırakma iptal edilecek/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/otomatik ihtilaf süreci başlayacak/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Emanet tutar.*dondurulacak/i)
      ).toBeInTheDocument();
    });

    test('shows dispute warning', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      expect(screen.getByText(/İtirazın Sonuçları/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 4. REASON INPUT
  // ==========================================================================

  describe('Reason Input', () => {
    test('renders reason textarea', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const textarea = screen.getByPlaceholderText(
        /İtiraz nedeninizi detaylı.*açıklayın/i
      );
      expect(textarea).toBeInTheDocument();
    });

    test('allows typing in textarea', async () => {
      const user = userEvent.setup();
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Test objection reason');

      expect(textarea).toHaveValue('Test objection reason');
    });

    test('shows character count', async () => {
      const user = userEvent.setup();
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Test');

      expect(screen.getByText(/4\/500 karakter/i)).toBeInTheDocument();
    });

    test('enforces 500 character limit', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const textarea = screen.getByPlaceholderText(
        /İtiraz nedeninizi/i
      ) as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(500);
    });
  });

  // ==========================================================================
  // 5. FORM SUBMISSION
  // ==========================================================================

  describe('Form Submission', () => {
    test('submits objection with reason', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      const mockResponse = {
        id: 'obj-1',
        orderId: 'ORD-001',
        disputeOpened: true,
        disputeId: 'disp-1',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(
        <ObjectReleaseModal
          item={mockItem}
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={onSuccess}
        />
      );

      // Type reason
      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Ürün eksik teslim edildi');

      // Click submit
      const submitButton = screen.getByRole('button', {
        name: /İtiraz Et ve İhtilaf Başlat/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/orders/ORD-001/object-release',
          { reason: 'Ürün eksik teslim edildi' }
        );
      });
    });

    test('disables submit button when reason is empty', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const submitButton = screen.getByRole('button', {
        name: /İtiraz Et ve İhtilaf Başlat/i,
      });
      expect(submitButton).toBeDisabled();
    });

    test('shows loading state during submission', async () => {
      const user = userEvent.setup();
      (apiClient.post as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Test reason');

      const submitButton = screen.getByRole('button', {
        name: /İtiraz Et ve İhtilaf Başlat/i,
      });
      await user.click(submitButton);

      expect(screen.getByText(/İtiraz Kaydediliyor/i)).toBeInTheDocument();
    });

    test('shows success state after submission', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      const mockResponse = {
        id: 'obj-1',
        orderId: 'ORD-001',
        disputeOpened: true,
        disputeId: 'disp-1',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(
        <ObjectReleaseModal
          item={mockItem}
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={onSuccess}
        />
      );

      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Test reason');

      const submitButton = screen.getByRole('button', {
        name: /İtiraz Et ve İhtilaf Başlat/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/İtiraz Kaydedildi/i)).toBeInTheDocument();
      });
    });

    test('calls onSuccess after successful submission', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const onSuccess = jest.fn();
      const mockResponse = {
        id: 'obj-1',
        orderId: 'ORD-001',
        disputeOpened: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      render(
        <ObjectReleaseModal
          item={mockItem}
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={onSuccess}
        />
      );

      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Test reason');

      const submitButton = screen.getByRole('button', {
        name: /İtiraz Et ve İhtilaf Başlat/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/İtiraz Kaydedildi/i)).toBeInTheDocument();
      });

      // Advance timers to trigger auto-close
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  // ==========================================================================
  // 6. ERROR HANDLING
  // ==========================================================================

  describe('Error Handling', () => {
    test('handles submission error', async () => {
      const user = userEvent.setup();
      const error = new Error('Network error');

      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Test reason');

      const submitButton = screen.getByRole('button', {
        name: /İtiraz Et ve İhtilaf Başlat/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalled();
      });

      // Button should be re-enabled after error
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  // ==========================================================================
  // 7. MODAL CONTROLS
  // ==========================================================================

  describe('Modal Controls', () => {
    test('calls onClose when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={onClose} />
      );

      const cancelButton = screen.getByRole('button', { name: /İptal/i });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    test('prevents closing during submission', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      (apiClient.post as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={onClose} />
      );

      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Test reason');

      const submitButton = screen.getByRole('button', {
        name: /İtiraz Et ve İhtilaf Başlat/i,
      });
      await user.click(submitButton);

      // Try to close while submitting
      const cancelButton = screen.getByRole('button', { name: /İptal/i });
      await user.click(cancelButton);

      // onClose should NOT be called during submission
      expect(onClose).not.toHaveBeenCalled();
    });

    test('resets form state on close', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();

      const { rerender } = render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={onClose} />
      );

      // Type reason
      const textarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      await user.type(textarea, 'Test reason');

      // Close modal
      const cancelButton = screen.getByRole('button', { name: /İptal/i });
      await user.click(cancelButton);

      // Reopen
      rerender(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={onClose} />
      );

      // Textarea should be empty
      const newTextarea = screen.getByPlaceholderText(/İtiraz nedeninizi/i);
      expect(newTextarea).toHaveValue('');
    });
  });

  // ==========================================================================
  // 8. ACCESSIBILITY
  // ==========================================================================

  describe('Accessibility', () => {
    test('has proper modal dialog role', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    test('textarea is properly labeled', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const textarea = screen.getByLabelText(/İtiraz Nedeni/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('required');
    });

    test('submit button has descriptive text', () => {
      render(
        <ObjectReleaseModal item={mockItem} isOpen={true} onClose={jest.fn()} />
      );

      const submitButton = screen.getByRole('button', {
        name: /İtiraz Et ve İhtilaf Başlat/i,
      });
      expect(submitButton).toBeInTheDocument();
    });
  });
});
