import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  EmailVerificationBadge,
  InlineVerificationStatus,
} from '@/components/domains/profile/EmailVerificationBadge';
import type {
  EmailVerificationBadgeProps,
  InlineVerificationStatusProps,
  VerificationStatus,
} from '@/components/domains/profile/EmailVerificationBadge';

const mockOnVerifyClick = jest.fn();
const mockOnResendClick = jest.fn();

const defaultBadgeProps: EmailVerificationBadgeProps = {
  email: 'test@example.com',
  status: 'unverified' as VerificationStatus,
  onVerifyClick: mockOnVerifyClick,
  onResendClick: mockOnResendClick,
};

describe('EmailVerificationBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Unverified Status', () => {
    test('renders unverified badge with email', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText(/doğrulanmadı/i)).toBeInTheDocument();
    });

    test('shows verify button for unverified status', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      expect(
        screen.getByRole('button', { name: /doğrula/i })
      ).toBeInTheDocument();
    });

    test('calls onVerifyClick when verify button is clicked', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      const verifyButton = screen.getByRole('button', { name: /doğrula/i });
      fireEvent.click(verifyButton);

      expect(mockOnVerifyClick).toHaveBeenCalledTimes(1);
    });

    test('applies warning color for unverified status', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      const badge = screen.getByTestId('email-verification-badge');
      expect(badge).toHaveClass('bg-warning');
    });
  });

  describe('Rendering - Verified Status', () => {
    test('renders verified badge', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} status="verified" />
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText(/doğrulandı/i)).toBeInTheDocument();
    });

    test('shows checkmark icon for verified status', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} status="verified" />
      );

      expect(screen.getByTestId('verified-icon')).toBeInTheDocument();
    });

    test('does not show verify button for verified status', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} status="verified" />
      );

      expect(
        screen.queryByRole('button', { name: /doğrula/i })
      ).not.toBeInTheDocument();
    });

    test('applies success color for verified status', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} status="verified" />
      );

      const badge = screen.getByTestId('email-verification-badge');
      expect(badge).toHaveClass('bg-success');
    });
  });

  describe('Rendering - Pending Status', () => {
    test('renders pending badge', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} status="pending" />
      );

      expect(screen.getByText(/bekleniyor/i)).toBeInTheDocument();
    });

    test('shows resend button for pending status', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} status="pending" />
      );

      expect(
        screen.getByRole('button', { name: /tekrar gönder/i })
      ).toBeInTheDocument();
    });

    test('calls onResendClick when resend button is clicked', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} status="pending" />
      );

      const resendButton = screen.getByRole('button', {
        name: /tekrar gönder/i,
      });
      fireEvent.click(resendButton);

      expect(mockOnResendClick).toHaveBeenCalledTimes(1);
    });

    test('applies info color for pending status', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} status="pending" />
      );

      const badge = screen.getByTestId('email-verification-badge');
      expect(badge).toHaveClass('bg-info');
    });

    test('shows loading spinner when loading', () => {
      render(
        <EmailVerificationBadge
          {...defaultBadgeProps}
          status="pending"
          loading
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    test('renders small size badge', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} size="sm" />);

      const badge = screen.getByTestId('email-verification-badge');
      expect(badge).toHaveClass('text-sm');
    });

    test('renders medium size badge (default)', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      const badge = screen.getByTestId('email-verification-badge');
      expect(badge).toHaveClass('text-base');
    });

    test('renders large size badge', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} size="lg" />);

      const badge = screen.getByTestId('email-verification-badge');
      expect(badge).toHaveClass('text-lg');
    });
  });

  describe('Compact Mode', () => {
    test('hides email in compact mode', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} compact />);

      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });

    test('shows only status in compact mode', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} compact />);

      expect(screen.getByText(/doğrulanmadı/i)).toBeInTheDocument();
    });

    test('maintains functionality in compact mode', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} compact />);

      const verifyButton = screen.getByRole('button', { name: /doğrula/i });
      fireEvent.click(verifyButton);

      expect(mockOnVerifyClick).toHaveBeenCalled();
    });
  });

  describe('Email Masking', () => {
    test('masks email when showFullEmail is false', () => {
      render(
        <EmailVerificationBadge {...defaultBadgeProps} showFullEmail={false} />
      );

      expect(screen.getByText(/t\*\*\*@example\.com/)).toBeInTheDocument();
    });

    test('shows full email by default', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    test('handles long email addresses', () => {
      render(
        <EmailVerificationBadge
          {...defaultBadgeProps}
          email="verylongemailaddress@example.com"
        />
      );

      expect(
        screen.getByText('verylongemailaddress@example.com')
      ).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      render(
        <EmailVerificationBadge
          {...defaultBadgeProps}
          className="custom-badge"
        />
      );

      const badge = screen.getByTestId('email-verification-badge');
      expect(badge).toHaveClass('custom-badge');
    });

    test('allows custom colors via props', () => {
      render(
        <EmailVerificationBadge
          {...defaultBadgeProps}
          bgColor="bg-purple-500"
        />
      );

      const badge = screen.getByTestId('email-verification-badge');
      expect(badge).toHaveClass('bg-purple-500');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      expect(
        screen.getByLabelText(/email doğrulama durumu/i)
      ).toBeInTheDocument();
    });

    test('buttons have accessible names', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      const button = screen.getByRole('button', { name: /doğrula/i });
      expect(button).toBeInTheDocument();
    });

    test('status is announced to screen readers', () => {
      render(<EmailVerificationBadge {...defaultBadgeProps} />);

      expect(screen.getByRole('status')).toHaveTextContent(/doğrulanmadı/i);
    });
  });
});

describe('InlineVerificationStatus', () => {
  const defaultInlineProps: InlineVerificationStatusProps = {
    status: 'verified' as VerificationStatus,
  };

  describe('Rendering', () => {
    test('renders verified status inline', () => {
      render(<InlineVerificationStatus {...defaultInlineProps} />);

      expect(screen.getByText(/doğrulandı/i)).toBeInTheDocument();
    });

    test('renders unverified status inline', () => {
      render(
        <InlineVerificationStatus {...defaultInlineProps} status="unverified" />
      );

      expect(screen.getByText(/doğrulanmadı/i)).toBeInTheDocument();
    });

    test('renders pending status inline', () => {
      render(
        <InlineVerificationStatus {...defaultInlineProps} status="pending" />
      );

      expect(screen.getByText(/bekleniyor/i)).toBeInTheDocument();
    });

    test('shows icon for verified status', () => {
      render(<InlineVerificationStatus {...defaultInlineProps} />);

      expect(screen.getByTestId('verified-icon')).toBeInTheDocument();
    });

    test('shows warning icon for unverified status', () => {
      render(
        <InlineVerificationStatus {...defaultInlineProps} status="unverified" />
      );

      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });
  });

  describe('Custom Text', () => {
    test('renders custom text', () => {
      render(
        <InlineVerificationStatus
          {...defaultInlineProps}
          customText="Özel Durum"
        />
      );

      expect(screen.getByText('Özel Durum')).toBeInTheDocument();
    });

    test('uses default text when custom text not provided', () => {
      render(<InlineVerificationStatus {...defaultInlineProps} />);

      expect(screen.getByText(/doğrulandı/i)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    test('applies success color for verified', () => {
      render(<InlineVerificationStatus {...defaultInlineProps} />);

      const status = screen.getByTestId('inline-verification-status');
      expect(status).toHaveClass('text-success');
    });

    test('applies warning color for unverified', () => {
      render(
        <InlineVerificationStatus {...defaultInlineProps} status="unverified" />
      );

      const status = screen.getByTestId('inline-verification-status');
      expect(status).toHaveClass('text-warning');
    });

    test('applies info color for pending', () => {
      render(
        <InlineVerificationStatus {...defaultInlineProps} status="pending" />
      );

      const status = screen.getByTestId('inline-verification-status');
      expect(status).toHaveClass('text-info');
    });

    test('applies custom className', () => {
      render(
        <InlineVerificationStatus
          {...defaultInlineProps}
          className="custom-inline"
        />
      );

      const status = screen.getByTestId('inline-verification-status');
      expect(status).toHaveClass('custom-inline');
    });
  });

  describe('Hide Icon', () => {
    test('hides icon when hideIcon is true', () => {
      render(<InlineVerificationStatus {...defaultInlineProps} hideIcon />);

      expect(screen.queryByTestId('verified-icon')).not.toBeInTheDocument();
    });

    test('shows icon by default', () => {
      render(<InlineVerificationStatus {...defaultInlineProps} />);

      expect(screen.getByTestId('verified-icon')).toBeInTheDocument();
    });
  });
});
