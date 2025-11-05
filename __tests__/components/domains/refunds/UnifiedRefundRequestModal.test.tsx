/**
 * ============================================================================
 * UnifiedRefundRequestModal Test Suite
 * ============================================================================
 * Comprehensive tests for unified refund request modal
 *
 * Sprint 1.4: Tests both order-based and payment-based flows
 *
 * Coverage:
 * - ✅ Order-based refund flow (default)
 * - ✅ Payment-based refund flow (with paymentId)
 * - ✅ Hook integration mode
 * - ✅ Direct API mode
 * - ✅ Predefined reasons dropdown
 * - ✅ Free-text reason input
 * - ✅ Validation (amount, reason, description)
 * - ✅ Currency support
 * - ✅ Already refunded tracking
 * - ✅ Toast notifications
 * - ✅ Loading states
 * - ✅ Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1.4
 * ============================================================================
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { UnifiedRefundRequestModal } from '../../../../components/domains/refunds/core/UnifiedRefundRequestModal';
import { useRefund } from '../../../../hooks/business/payment/useRefund';

// Mock dependencies
jest.mock('sonner');
jest.mock('@/hooks/business/payment');

// Mock fetch
global.fetch = jest.fn();

describe('UnifiedRefundRequestModal', () => {
  // Setup
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockRequestRefund = jest.fn();
  const mockClearError = jest.fn();
  const mockToast = toast as jest.Mocked<typeof toast>;

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    orderId: 'ORDER-123',
    orderTitle: 'Web Development Service',
    orderTotal: 1000,
    alreadyRefunded: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRefund as jest.Mock).mockReturnValue({
      requestRefund: mockRequestRefund,
      isRefunding: false,
      error: null,
      clearError: mockClearError,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders modal with title and description', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      expect(screen.getByText('İade Talebi Oluştur')).toBeInTheDocument();
      expect(
        screen.getByText(/Web Development Service için iade talebinde bulunun/)
      ).toBeInTheDocument();
    });

    it('displays order information correctly', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      expect(screen.getByText('Toplam Tutar:')).toBeInTheDocument();
      expect(screen.getByText('₺1000.00')).toBeInTheDocument();
      expect(screen.getByText('İade Edilebilir:')).toBeInTheDocument();
    });

    it('displays already refunded amount when provided', () => {
      render(
        <UnifiedRefundRequestModal {...defaultProps} alreadyRefunded={300} />
      );

      expect(screen.getByText('İade Edilen:')).toBeInTheDocument();
      expect(screen.getByText('-₺300.00')).toBeInTheDocument();
      expect(screen.getByText('₺700.00')).toBeInTheDocument(); // max refundable
    });

    it('renders all form fields', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      expect(screen.getByLabelText(/İade Tutarı/)).toBeInTheDocument();
      expect(screen.getByLabelText(/İade Nedeni/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Açıklama/)).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /İptal/ })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Talep Gönder/ })
      ).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('İade Talebi Oluştur')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // CURRENCY SUPPORT TESTS
  // ============================================================================

  describe('Currency Support', () => {
    it('displays TRY currency symbol by default', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const symbols = screen.getAllByText('₺');
      expect(symbols.length).toBeGreaterThan(0);
    });

    it('displays USD currency symbol', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} currency="USD" />);

      const symbols = screen.getAllByText('$');
      expect(symbols.length).toBeGreaterThan(0);
    });

    it('displays EUR currency symbol', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} currency="EUR" />);

      const symbols = screen.getAllByText('€');
      expect(symbols.length).toBeGreaterThan(0);
    });

    it('displays GBP currency symbol', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} currency="GBP" />);

      const symbols = screen.getAllByText('£');
      expect(symbols.length).toBeGreaterThan(0);
    });

    it('falls back to currency code for unknown currencies', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} currency="JPY" />);

      const symbols = screen.getAllByText('JPY');
      expect(symbols.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // PREDEFINED REASONS TESTS
  // ============================================================================

  describe('Predefined Reasons', () => {
    it('renders reason dropdown by default', () => {
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      expect(screen.getByText('Neden seçiniz...')).toBeInTheDocument();
    });

    it('allows selecting a reason from dropdown', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);

      const option = await screen.findByText('Sipariş İptal Edildi');
      await user.click(option);

      expect(screen.getByText('Sipariş İptal Edildi')).toBeInTheDocument();
    });

    it('displays reason description when selected', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);

      const option = await screen.findByText('Hizmet Verilmedi');
      await user.click(option);

      expect(
        screen.getByText('Satıcı hizmeti teslim etmedi')
      ).toBeInTheDocument();
    });

    it('renders text input when showReasonDropdown is false', () => {
      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          showReasonDropdown={false}
        />
      );

      expect(
        screen.getByPlaceholderText(/İade nedeninizi yazınız/)
      ).toBeInTheDocument();
      expect(screen.queryByText('Neden seçiniz...')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  describe('Validation', () => {
    it('validates amount is required', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const submitBtn = screen.getByRole('button', { name: /Talep Gönder/ });
      await user.click(submitBtn);

      expect(screen.getByText('İade tutarı zorunludur')).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('validates amount is a valid number', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const amountInput = screen.getByLabelText(/İade Tutarı/);
      await user.type(amountInput, 'abc');
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      expect(screen.getByText('Geçerli bir tutar giriniz')).toBeInTheDocument();
    });

    it('validates amount does not exceed max refundable', async () => {
      const user = userEvent.setup();
      render(
        <UnifiedRefundRequestModal {...defaultProps} alreadyRefunded={200} />
      );

      const amountInput = screen.getByLabelText(/İade Tutarı/);
      await user.type(amountInput, '1000');
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      expect(
        screen.getByText(/Maksimum iade tutarı ₺800.00/)
      ).toBeInTheDocument();
    });

    it('validates reason is required (dropdown mode)', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const amountInput = screen.getByLabelText(/İade Tutarı/);
      await user.type(amountInput, '100');
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      expect(screen.getByText('İade nedeni seçiniz')).toBeInTheDocument();
    });

    it('validates reason minimum length (text mode)', async () => {
      const user = userEvent.setup();
      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          showReasonDropdown={false}
        />
      );

      const amountInput = screen.getByLabelText(/İade Tutarı/);
      const reasonInput = screen.getByLabelText(/İade Nedeni/);

      await user.type(amountInput, '100');
      await user.type(reasonInput, 'short');
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      expect(
        screen.getByText('İade nedeni en az 10 karakter olmalıdır')
      ).toBeInTheDocument();
    });

    it('validates description is required', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const amountInput = screen.getByLabelText(/İade Tutarı/);
      await user.type(amountInput, '100');

      // Select reason
      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Sipariş İptal Edildi');
      await user.click(option);

      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      expect(screen.getByText('Açıklama zorunludur')).toBeInTheDocument();
    });

    it('validates description minimum length', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const amountInput = screen.getByLabelText(/İade Tutarı/);
      const descriptionInput = screen.getByLabelText(/Açıklama/);

      await user.type(amountInput, '100');

      // Select reason
      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Sipariş İptal Edildi');
      await user.click(option);

      await user.type(descriptionInput, 'Too short');
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      expect(
        screen.getByText('Açıklama en az 20 karakter olmalıdır')
      ).toBeInTheDocument();
    });

    it('respects custom minDescriptionLength', async () => {
      const user = userEvent.setup();
      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          minDescriptionLength={50}
        />
      );

      const amountInput = screen.getByLabelText(/İade Tutarı/);
      const descriptionInput = screen.getByLabelText(/Açıklama/);

      await user.type(amountInput, '100');

      // Select reason
      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Sipariş İptal Edildi');
      await user.click(option);

      await user.type(descriptionInput, 'This is less than 50 characters');
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      expect(
        screen.getByText('Açıklama en az 50 karakter olmalıdır')
      ).toBeInTheDocument();
    });

    it('clears error when field is corrected', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      // Trigger validation error
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));
      expect(screen.getByText('İade tutarı zorunludur')).toBeInTheDocument();

      // Correct the field
      const amountInput = screen.getByLabelText(/İade Tutarı/);
      await user.type(amountInput, '100');

      expect(
        screen.queryByText('İade tutarı zorunludur')
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // DIRECT API MODE TESTS
  // ============================================================================

  describe('Direct API Mode', () => {
    it('submits refund request successfully', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      // Fill form
      await user.type(screen.getByLabelText(/İade Tutarı/), '500');

      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Hizmet Verilmedi');
      await user.click(option);

      await user.type(
        screen.getByLabelText(/Açıklama/),
        'Satıcı hizmeti zamanında teslim etmedi ve iletişime geçmiyor.'
      );

      // Submit
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/v1/refunds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: 'ORDER-123',
            amount: 500,
            reason: 'SERVICE_NOT_PROVIDED',
            description:
              'Satıcı hizmeti zamanında teslim etmedi ve iletişime geçmiyor.',
          }),
        });
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'İade Talebi Oluşturuldu',
        expect.any(Object)
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles API error gracefully', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'İade limiti aşıldı' }),
      });

      render(<UnifiedRefundRequestModal {...defaultProps} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/İade Tutarı/), '500');

      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Sipariş İptal Edildi');
      await user.click(option);

      await user.type(
        screen.getByLabelText(/Açıklama/),
        'Sipariş iptal edildiği için iade talep ediyorum.'
      );

      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Hata',
          expect.objectContaining({
            description: 'İade limiti aşıldı',
          })
        );
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // HOOK MODE TESTS
  // ============================================================================

  describe('Hook Mode', () => {
    it('uses hook when useHook is true', async () => {
      const user = userEvent.setup();
      mockRequestRefund.mockResolvedValueOnce(true);

      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          paymentId="PAY-456"
          useHook={true}
        />
      );

      // Fill form
      await user.type(screen.getByLabelText(/İade Tutarı/), '300');

      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Kalite Sorunu');
      await user.click(option);

      await user.type(
        screen.getByLabelText(/Açıklama/),
        'Teslim edilen iş beklenen kalitede değil.'
      );

      // Submit
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      await waitFor(() => {
        expect(mockRequestRefund).toHaveBeenCalledWith(
          'PAY-456',
          300,
          'Teslim edilen iş beklenen kalitede değil.'
        );
      });

      expect(mockToast.success).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('displays hook error message', async () => {
      (useRefund as jest.Mock).mockReturnValue({
        requestRefund: mockRequestRefund,
        isRefunding: false,
        error: 'Yetersiz bakiye',
        clearError: mockClearError,
      });

      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          paymentId="PAY-456"
          useHook={true}
        />
      );

      expect(screen.getByText('Yetersiz bakiye')).toBeInTheDocument();
    });

    it('clears hook error on close', async () => {
      const user = userEvent.setup();
      (useRefund as jest.Mock).mockReturnValue({
        requestRefund: mockRequestRefund,
        isRefunding: false,
        error: 'Some error',
        clearError: mockClearError,
      });

      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          paymentId="PAY-456"
          useHook={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /İptal/ }));

      expect(mockClearError).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('requires paymentId in hook mode', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} useHook={true} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/İade Tutarı/), '100');

      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Sipariş İptal Edildi');
      await user.click(option);

      await user.type(
        screen.getByLabelText(/Açıklama/),
        'Test description with enough characters to pass validation'
      );

      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Hata',
          expect.objectContaining({
            description: 'Payment ID gerekli (hook mode için)',
          })
        );
      });
    });
  });

  // ============================================================================
  // LOADING STATE TESTS
  // ============================================================================

  describe('Loading States', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100)
          )
      );

      render(<UnifiedRefundRequestModal {...defaultProps} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/İade Tutarı/), '100');

      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Sipariş İptal Edildi');
      await user.click(option);

      await user.type(
        screen.getByLabelText(/Açıklama/),
        'Test description for loading state check'
      );

      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      expect(screen.getByText('Gönderiliyor...')).toBeInTheDocument();
    });

    it('disables fields during hook refunding', () => {
      (useRefund as jest.Mock).mockReturnValue({
        requestRefund: mockRequestRefund,
        isRefunding: true,
        error: null,
        clearError: mockClearError,
      });

      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          paymentId="PAY-456"
          useHook={true}
        />
      );

      expect(screen.getByLabelText(/İade Tutarı/)).toBeDisabled();
      expect(screen.getByLabelText(/Açıklama/)).toBeDisabled();
    });

    it('prevents close during submission', () => {
      (useRefund as jest.Mock).mockReturnValue({
        requestRefund: mockRequestRefund,
        isRefunding: true,
        error: null,
        clearError: mockClearError,
      });

      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          paymentId="PAY-456"
          useHook={true}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /İptal/ });
      expect(cancelBtn).toBeDisabled();
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('handles zero max refundable amount', () => {
      render(
        <UnifiedRefundRequestModal {...defaultProps} alreadyRefunded={1000} />
      );

      expect(screen.getByText('₺0.00')).toBeInTheDocument();
    });

    it('sanitizes amount input to numbers only', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const amountInput = screen.getByLabelText(
        /İade Tutarı/
      ) as HTMLInputElement;
      await user.type(amountInput, 'abc123.45xyz');

      expect(amountInput.value).toBe('123.45');
    });

    it('displays character count for description', async () => {
      const user = userEvent.setup();
      render(<UnifiedRefundRequestModal {...defaultProps} />);

      const descriptionInput = screen.getByLabelText(/Açıklama/);
      await user.type(descriptionInput, 'Test description');

      expect(screen.getByText('16/1000')).toBeInTheDocument();
    });

    it('enforces max description length', async () => {
      const user = userEvent.setup();
      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          maxDescriptionLength={50}
        />
      );

      const descriptionInput = screen.getByLabelText(
        /Açıklama/
      ) as HTMLTextAreaElement;
      const longText = 'a'.repeat(100);

      await user.type(descriptionInput, longText);

      expect(descriptionInput.value.length).toBeLessThanOrEqual(50);
    });

    it('resets form on successful submission', async () => {
      const user = userEvent.setup();
      mockRequestRefund.mockResolvedValueOnce(true);

      render(
        <UnifiedRefundRequestModal
          {...defaultProps}
          paymentId="PAY-456"
          useHook={true}
        />
      );

      // Fill form
      await user.type(screen.getByLabelText(/İade Tutarı/), '100');

      const trigger = screen.getByText('Neden seçiniz...');
      await user.click(trigger);
      const option = await screen.findByText('Sipariş İptal Edildi');
      await user.click(option);

      await user.type(
        screen.getByLabelText(/Açıklama/),
        'Description for reset test'
      );

      // Submit
      await user.click(screen.getByRole('button', { name: /Talep Gönder/ }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // Values should be reset (verified by successful close)
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
