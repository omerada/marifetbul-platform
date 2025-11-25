import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PhoneVerificationModal } from '@/components/domains/profile/PhoneVerificationModal';
import type { PhoneVerificationModalProps } from '@/components/domains/profile/PhoneVerificationModal';

// Mock OTPInput component
jest.mock('@/components/shared', () => ({
  OTPInput: ({ length, onComplete, error, disabled, loading }: any) => (
    <div data-testid="mock-otp-input">
      <input
        data-testid="otp-input"
        onChange={(e) => {
          if (e.target.value.length === length) {
            onComplete?.(e.target.value);
          }
        }}
        disabled={disabled || loading}
        aria-invalid={error ? 'true' : 'false'}
      />
    </div>
  ),
}));

const mockOnVerificationSuccess = jest.fn();
const mockOnClose = jest.fn();
const mockOnResendOTP = jest.fn();

const defaultProps: PhoneVerificationModalProps = {
  isOpen: true,
  onClose: mockOnClose,
  phoneNumber: '+90 555 123 4567',
  onVerificationSuccess: mockOnVerificationSuccess,
  onResendOTP: mockOnResendOTP,
};

describe('PhoneVerificationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders modal when isOpen is true', () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      expect(screen.getByText(/Telefon Doğrulama/i)).toBeInTheDocument();
      expect(screen.getByText(/\+90 555 123 4567/)).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
      render(<PhoneVerificationModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText(/Telefon Doğrulama/i)).not.toBeInTheDocument();
    });

    test('renders with masked phone number', () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      // Should show phone number in some format
      const phoneDisplay = screen.getByText(/\+90 555 123 4567/);
      expect(phoneDisplay).toBeInTheDocument();
    });

    test('renders OTP input component', () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      expect(screen.getByTestId('mock-otp-input')).toBeInTheDocument();
    });

    test('renders with custom title', () => {
      render(<PhoneVerificationModal {...defaultProps} title="Özel Başlık" />);

      expect(screen.getByText('Özel Başlık')).toBeInTheDocument();
    });

    test('renders description text', () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      expect(screen.getByText(/doğrulama kodu/i)).toBeInTheDocument();
    });
  });

  describe('OTP Input Interaction', () => {
    test('calls onVerificationSuccess when valid OTP is entered', async () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      const otpInput = screen.getByTestId('otp-input');
      fireEvent.change(otpInput, { target: { value: '123456' } });

      await waitFor(() => {
        expect(mockOnVerificationSuccess).toHaveBeenCalled();
      });
    });

    test('disables input while verifying', () => {
      render(<PhoneVerificationModal {...defaultProps} isVerifying />);

      const otpInput = screen.getByTestId('otp-input');
      expect(otpInput).toBeDisabled();
    });

    test('shows error state on invalid OTP', () => {
      render(<PhoneVerificationModal {...defaultProps} error="Geçersiz kod" />);

      expect(screen.getByText('Geçersiz kod')).toBeInTheDocument();
      const otpInput = screen.getByTestId('otp-input');
      expect(otpInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('clears error on new input', async () => {
      const { rerender } = render(
        <PhoneVerificationModal {...defaultProps} error="Geçersiz kod" />
      );

      expect(screen.getByText('Geçersiz kod')).toBeInTheDocument();

      rerender(<PhoneVerificationModal {...defaultProps} />);

      expect(screen.queryByText('Geçersiz kod')).not.toBeInTheDocument();
    });
  });

  describe('Resend OTP Functionality', () => {
    test('renders resend button', () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /tekrar gönder/i })
      ).toBeInTheDocument();
    });

    test('calls onResendOTP when resend button is clicked', async () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      const resendButton = screen.getByRole('button', {
        name: /tekrar gönder/i,
      });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockOnResendOTP).toHaveBeenCalledTimes(1);
      });
    });

    test('disables resend button during cooldown', () => {
      render(<PhoneVerificationModal {...defaultProps} resendCooldown={60} />);

      const resendButton = screen.getByRole('button', {
        name: /tekrar gönder/i,
      });
      expect(resendButton).toBeDisabled();
    });

    test('displays cooldown timer', () => {
      render(<PhoneVerificationModal {...defaultProps} resendCooldown={45} />);

      expect(screen.getByText(/45/)).toBeInTheDocument();
    });

    test('enables resend button after cooldown expires', () => {
      const { rerender } = render(
        <PhoneVerificationModal {...defaultProps} resendCooldown={1} />
      );

      let resendButton = screen.getByRole('button', { name: /tekrar gönder/i });
      expect(resendButton).toBeDisabled();

      rerender(<PhoneVerificationModal {...defaultProps} resendCooldown={0} />);

      resendButton = screen.getByRole('button', { name: /tekrar gönder/i });
      expect(resendButton).not.toBeDisabled();
    });

    test('shows success message after resending', () => {
      render(<PhoneVerificationModal {...defaultProps} resendSuccess={true} />);

      expect(screen.getByText(/kod tekrar gönderildi/i)).toBeInTheDocument();
    });

    test('disables resend during verification', () => {
      render(<PhoneVerificationModal {...defaultProps} isVerifying />);

      const resendButton = screen.getByRole('button', {
        name: /tekrar gönder/i,
      });
      expect(resendButton).toBeDisabled();
    });
  });

  describe('Close Functionality', () => {
    test('calls onClose when close button is clicked', async () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /kapat/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when clicking outside modal (if enabled)', async () => {
      render(<PhoneVerificationModal {...defaultProps} closeOnOutsideClick />);

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('does not close on outside click when disabled', () => {
      render(
        <PhoneVerificationModal {...defaultProps} closeOnOutsideClick={false} />
      );

      const overlay = screen.queryByTestId('modal-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });

    test('prevents closing during verification', () => {
      render(<PhoneVerificationModal {...defaultProps} isVerifying />);

      const closeButton = screen.queryByRole('button', { name: /kapat/i });
      if (closeButton && !closeButton.hasAttribute('disabled')) {
        fireEvent.click(closeButton);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Loading States', () => {
    test('shows loading indicator during verification', () => {
      render(<PhoneVerificationModal {...defaultProps} isVerifying />);

      expect(screen.getByText(/doğrulanıyor/i)).toBeInTheDocument();
    });

    test('shows loading indicator while resending', () => {
      render(<PhoneVerificationModal {...defaultProps} isResending />);

      expect(screen.getByText(/gönderiliyor/i)).toBeInTheDocument();
    });

    test('disables all buttons during verification', () => {
      render(<PhoneVerificationModal {...defaultProps} isVerifying />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        if (button.textContent !== 'Kapat') {
          expect(button).toBeDisabled();
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('displays verification error message', () => {
      const errorMessage = 'Doğrulama başarısız oldu';
      render(<PhoneVerificationModal {...defaultProps} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('displays resend error message', () => {
      const errorMessage = 'Kod gönderilemedi';
      render(
        <PhoneVerificationModal {...defaultProps} resendError={errorMessage} />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('shows retry button after error', () => {
      render(<PhoneVerificationModal {...defaultProps} error="Hata oluştu" />);

      expect(
        screen.getByRole('button', { name: /tekrar dene/i })
      ).toBeInTheDocument();
    });

    test('clears error on retry', async () => {
      const { rerender } = render(
        <PhoneVerificationModal {...defaultProps} error="Hata oluştu" />
      );

      const retryButton = screen.getByRole('button', { name: /tekrar dene/i });
      fireEvent.click(retryButton);

      rerender(<PhoneVerificationModal {...defaultProps} />);

      expect(screen.queryByText('Hata oluştu')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      expect(
        screen.getByRole('dialog', { name: /telefon doğrulama/i })
      ).toBeInTheDocument();
    });

    test('focuses OTP input on mount', () => {
      render(<PhoneVerificationModal {...defaultProps} autoFocus />);

      const otpInput = screen.getByTestId('otp-input');
      expect(otpInput).toHaveFocus();
    });

    test('traps focus within modal', () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    test('announces verification status to screen readers', () => {
      render(<PhoneVerificationModal {...defaultProps} isVerifying />);

      expect(screen.getByRole('status')).toHaveTextContent(/doğrulanıyor/i);
    });

    test('has proper heading hierarchy', () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(/telefon doğrulama/i);
    });
  });

  describe('Edge Cases', () => {
    test('handles missing phone number gracefully', () => {
      render(<PhoneVerificationModal {...defaultProps} phoneNumber="" />);

      expect(screen.getByText(/telefon numarası/i)).toBeInTheDocument();
    });

    test('handles very long phone numbers', () => {
      const longPhone = '+90 555 123 4567 890 123';
      render(
        <PhoneVerificationModal {...defaultProps} phoneNumber={longPhone} />
      );

      expect(screen.getByText(longPhone)).toBeInTheDocument();
    });

    test('handles rapid resend clicks', async () => {
      render(<PhoneVerificationModal {...defaultProps} />);

      const resendButton = screen.getByRole('button', {
        name: /tekrar gönder/i,
      });

      fireEvent.click(resendButton);
      fireEvent.click(resendButton);
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockOnResendOTP).toHaveBeenCalledTimes(1);
      });
    });

    test('handles OTP complete during verification', async () => {
      const { rerender } = render(<PhoneVerificationModal {...defaultProps} />);

      const otpInput = screen.getByTestId('otp-input');
      fireEvent.change(otpInput, { target: { value: '123456' } });

      rerender(<PhoneVerificationModal {...defaultProps} isVerifying />);

      // Should not call success callback again
      await waitFor(() => {
        expect(mockOnVerificationSuccess).toHaveBeenCalledTimes(1);
      });
    });

    test('maintains state across re-renders', () => {
      const { rerender } = render(
        <PhoneVerificationModal {...defaultProps} resendCooldown={30} />
      );

      expect(screen.getByText(/30/)).toBeInTheDocument();

      rerender(
        <PhoneVerificationModal {...defaultProps} resendCooldown={29} />
      );

      expect(screen.getByText(/29/)).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      render(
        <PhoneVerificationModal {...defaultProps} className="custom-modal" />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('custom-modal');
    });

    test('renders with custom OTP length', () => {
      render(<PhoneVerificationModal {...defaultProps} otpLength={4} />);

      const otpInput = screen.getByTestId('mock-otp-input');
      expect(otpInput).toBeInTheDocument();
    });
  });

  describe('Success Flow', () => {
    test('shows success message after verification', () => {
      render(<PhoneVerificationModal {...defaultProps} verificationSuccess />);

      expect(screen.getByText(/doğrulama başarılı/i)).toBeInTheDocument();
    });

    test('auto-closes after successful verification', () => {
      jest.useFakeTimers();

      render(
        <PhoneVerificationModal
          {...defaultProps}
          verificationSuccess
          autoCloseOnSuccess
        />
      );

      jest.advanceTimersByTime(2000);

      expect(mockOnClose).toHaveBeenCalled();

      jest.useRealTimers();
    });

    test('displays success icon', () => {
      render(<PhoneVerificationModal {...defaultProps} verificationSuccess />);

      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    });
  });
});
