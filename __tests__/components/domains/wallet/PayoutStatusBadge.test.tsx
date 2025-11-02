/**
 * PayoutStatusBadge Component Tests
 * Tests status badge rendering and functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PayoutStatusBadge } from '@/components/domains/wallet/PayoutStatusBadge';
import { PayoutStatus } from '@/types/business/features/wallet';

describe('PayoutStatusBadge', () => {
  describe('Status Rendering', () => {
    it('should render PENDING status correctly', () => {
      render(<PayoutStatusBadge status={PayoutStatus.PENDING} />);
      expect(screen.getByText('Beklemede')).toBeInTheDocument();
    });

    it('should render PROCESSING status correctly', () => {
      render(<PayoutStatusBadge status={PayoutStatus.PROCESSING} />);
      expect(screen.getByText('İşleniyor')).toBeInTheDocument();
    });

    it('should render COMPLETED status correctly', () => {
      render(<PayoutStatusBadge status={PayoutStatus.COMPLETED} />);
      expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
    });

    it('should render FAILED status correctly', () => {
      render(<PayoutStatusBadge status={PayoutStatus.FAILED} />);
      expect(screen.getByText('Başarısız')).toBeInTheDocument();
    });

    it('should render CANCELLED status correctly', () => {
      render(<PayoutStatusBadge status={PayoutStatus.CANCELLED} />);
      expect(screen.getByText('İptal Edildi')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should show icon by default', () => {
      const { container } = render(
        <PayoutStatusBadge status={PayoutStatus.COMPLETED} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      const { container } = render(
        <PayoutStatusBadge status={PayoutStatus.COMPLETED} showIcon={false} />
      );
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should animate PROCESSING icon', () => {
      const { container } = render(
        <PayoutStatusBadge status={PayoutStatus.PROCESSING} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });
  });

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      const { container } = render(
        <PayoutStatusBadge status={PayoutStatus.PENDING} size="sm" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-xs');
    });

    it('should apply medium size class by default', () => {
      const { container } = render(
        <PayoutStatusBadge status={PayoutStatus.PENDING} />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-sm');
    });

    it('should apply large size class', () => {
      const { container } = render(
        <PayoutStatusBadge status={PayoutStatus.PENDING} size="lg" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('Accessibility', () => {
    it('should have title attribute with description', () => {
      const { container } = render(
        <PayoutStatusBadge status={PayoutStatus.PENDING} />
      );
      const badge = container.firstChild;
      expect(badge).toHaveAttribute('title', 'Talep admin onayı bekliyor');
    });

    it('should have correct status description for COMPLETED', () => {
      const { container } = render(
        <PayoutStatusBadge status={PayoutStatus.COMPLETED} />
      );
      const badge = container.firstChild;
      expect(badge).toHaveAttribute('title', 'Para hesabınıza ulaştı');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PayoutStatusBadge
          status={PayoutStatus.PENDING}
          className="custom-class"
        />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('custom-class');
    });
  });
});
