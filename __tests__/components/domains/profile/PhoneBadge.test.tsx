/**
 * PhoneBadge Component Tests
 * Sprint 2 - Story 2.1: Testing Suite
 *
 * Unit tests for PhoneBadge component and variants
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PhoneBadge,
  InlinePhoneStatus,
  PhoneSecurityBadge,
} from '@/components/domains/profile/PhoneBadge';

describe('PhoneBadge Component', () => {
  describe('Rendering', () => {
    it('should render with verified status', () => {
      render(<PhoneBadge status="verified" />);
      expect(screen.getByText('Doğrulandı')).toBeInTheDocument();
    });

    it('should render with pending status', () => {
      render(<PhoneBadge status="pending" />);
      expect(screen.getByText('Beklemede')).toBeInTheDocument();
    });

    it('should render with unverified status', () => {
      render(<PhoneBadge status="unverified" />);
      expect(screen.getByText('Doğrulanmadı')).toBeInTheDocument();
    });

    it('should show phone number when provided', () => {
      render(
        <PhoneBadge status="verified" phoneNumber="05321234567" showPhone />
      );
      expect(screen.getByText(/0532 \*\*\* \*\* 67/)).toBeInTheDocument();
    });

    it('should mask phone number correctly', () => {
      render(
        <PhoneBadge status="verified" phoneNumber="05321234567" showPhone />
      );
      const maskedNumber = screen.getByText(/0532 \*\*\* \*\* 67/);
      expect(maskedNumber).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(<PhoneBadge status="verified" size="sm" />);
      expect(container.querySelector('.text-xs')).toBeInTheDocument();
    });

    it('should render medium size', () => {
      const { container } = render(<PhoneBadge status="verified" size="md" />);
      expect(container.querySelector('.text-sm')).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = render(<PhoneBadge status="verified" size="lg" />);
      expect(container.querySelector('.text-base')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should hide label in compact mode', () => {
      render(<PhoneBadge status="verified" compact />);
      expect(screen.queryByText('Doğrulandı')).not.toBeInTheDocument();
    });

    it('should show icon in compact mode', () => {
      const { container } = render(<PhoneBadge status="verified" compact />);
      // Icon should be present (SVG element)
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should be clickable when onClick provided', () => {
      const handleClick = jest.fn();
      render(<PhoneBadge status="verified" onClick={handleClick} />);

      const badge = screen.getByRole('button');
      fireEvent.click(badge);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard Enter key', () => {
      const handleClick = jest.fn();
      render(<PhoneBadge status="verified" onClick={handleClick} />);

      const badge = screen.getByRole('button');
      fireEvent.keyDown(badge, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard Space key', () => {
      const handleClick = jest.fn();
      render(<PhoneBadge status="verified" onClick={handleClick} />);

      const badge = screen.getByRole('button');
      fireEvent.keyDown(badge, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable without onClick', () => {
      render(<PhoneBadge status="verified" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('should apply green colors for verified', () => {
      const { container } = render(<PhoneBadge status="verified" />);
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
      expect(container.querySelector('.border-green-200')).toBeInTheDocument();
      expect(container.querySelector('.text-green-700')).toBeInTheDocument();
    });

    it('should apply yellow colors for pending', () => {
      const { container } = render(<PhoneBadge status="pending" />);
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
      expect(container.querySelector('.border-yellow-200')).toBeInTheDocument();
      expect(container.querySelector('.text-yellow-700')).toBeInTheDocument();
    });

    it('should apply gray colors for unverified', () => {
      const { container } = render(<PhoneBadge status="unverified" />);
      expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
      expect(container.querySelector('.border-gray-200')).toBeInTheDocument();
      expect(container.querySelector('.text-gray-700')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PhoneBadge status="verified" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('InlinePhoneStatus Component', () => {
  describe('Rendering', () => {
    it('should render status with phone number', () => {
      render(<InlinePhoneStatus status="verified" phoneNumber="05321234567" />);
      expect(screen.getByText(/0532 \*\*\* \*\* 67/)).toBeInTheDocument();
      expect(screen.getByText('Doğrulandı')).toBeInTheDocument();
    });

    it('should show fallback when no phone number', () => {
      render(<InlinePhoneStatus status="unverified" />);
      expect(screen.getByText('Telefon eklenmedi')).toBeInTheDocument();
    });

    it('should show action button for unverified status', () => {
      const onAction = jest.fn();
      render(
        <InlinePhoneStatus status="unverified" showAction onAction={onAction} />
      );
      expect(screen.getByText('Doğrula')).toBeInTheDocument();
    });

    it('should show "Devam Et" for pending status', () => {
      const onAction = jest.fn();
      render(
        <InlinePhoneStatus status="pending" showAction onAction={onAction} />
      );
      expect(screen.getByText('Devam Et')).toBeInTheDocument();
    });

    it('should not show action button for verified status', () => {
      render(
        <InlinePhoneStatus status="verified" showAction onAction={jest.fn()} />
      );
      expect(screen.queryByText('Doğrula')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onAction when button clicked', () => {
      const onAction = jest.fn();
      render(
        <InlinePhoneStatus status="unverified" showAction onAction={onAction} />
      );

      fireEvent.click(screen.getByText('Doğrula'));
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });
});

describe('PhoneSecurityBadge Component', () => {
  describe('Rendering', () => {
    it('should render with verified status', () => {
      render(
        <PhoneSecurityBadge status="verified" phoneNumber="05321234567" />
      );
      expect(screen.getByText('Telefon Güvenliği')).toBeInTheDocument();
      expect(screen.getByText(/0532 \*\*\* \*\* 67/)).toBeInTheDocument();
    });

    it('should show appropriate message for each status', () => {
      const { rerender } = render(<PhoneSecurityBadge status="verified" />);
      expect(screen.getByText(/Telefonunuz doğrulandı/)).toBeInTheDocument();

      rerender(<PhoneSecurityBadge status="pending" />);
      expect(screen.getByText(/Doğrulama kodu gönderildi/)).toBeInTheDocument();

      rerender(<PhoneSecurityBadge status="unverified" />);
      expect(
        screen.getByText(/Hesabınızı güvence altına almak/)
      ).toBeInTheDocument();
    });

    it('should show verification button for unverified', () => {
      const onVerify = jest.fn();
      render(
        <PhoneSecurityBadge
          status="unverified"
          showButton
          onVerify={onVerify}
        />
      );
      expect(screen.getByText('Doğrula')).toBeInTheDocument();
    });

    it('should show continue button for pending', () => {
      const onVerify = jest.fn();
      render(
        <PhoneSecurityBadge status="pending" showButton onVerify={onVerify} />
      );
      expect(screen.getByText('Devam Et')).toBeInTheDocument();
    });

    it('should not show button for verified', () => {
      render(
        <PhoneSecurityBadge status="verified" showButton onVerify={jest.fn()} />
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('should apply green styling for verified', () => {
      const { container } = render(<PhoneSecurityBadge status="verified" />);
      expect(container.querySelector('.border-green-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('should apply yellow styling for pending', () => {
      const { container } = render(<PhoneSecurityBadge status="pending" />);
      expect(container.querySelector('.border-yellow-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    });

    it('should apply gray styling for unverified', () => {
      const { container } = render(<PhoneSecurityBadge status="unverified" />);
      expect(container.querySelector('.border-gray-200')).toBeInTheDocument();
      expect(container.querySelector('.bg-gray-50')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onVerify when button clicked', () => {
      const onVerify = jest.fn();
      render(
        <PhoneSecurityBadge
          status="unverified"
          showButton
          onVerify={onVerify}
        />
      );

      fireEvent.click(screen.getByText('Doğrula'));
      expect(onVerify).toHaveBeenCalledTimes(1);
    });
  });
});
