/**
 * ================================================
 * MILESTONE STATUS BADGE - COMPONENT TESTS
 * ================================================
 * Comprehensive test suite for MilestoneStatusBadge
 * Sprint 1 - Milestone Payment Frontend
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lucide-react before importing component
jest.mock('lucide-react', () => ({
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="clock-icon" {...props} />
  ),
  PlayCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="playcircle-icon" {...props} />
  ),
  Package: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="package-icon" {...props} />
  ),
  CheckCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="checkcircle-icon" {...props} />
  ),
  AlertTriangle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="alerttriangle-icon" {...props} />
  ),
  Ban: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="ban-icon" {...props} />
  ),
  AlertCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="alertcircle-icon" {...props} />
  ),
}));

// Mock StatusBadge
jest.mock('@/components/shared/StatusBadge', () => ({
  StatusBadge: ({
    status,
    showIcon,
    size,
    className,
  }: {
    status: string;
    showIcon?: boolean;
    size?: string;
    className?: string;
  }) => (
    <div
      data-testid="status-badge"
      data-status={status}
      data-size={size}
      className={className}
    >
      {showIcon && <svg data-testid="icon" />}
      {status}
    </div>
  ),
}));

import {
  MilestoneStatusBadge,
  getMilestoneStatusLabel,
  getMilestoneStatusColor,
  getMilestoneStatusDescription,
  isMilestoneCompleted,
  isMilestoneActive,
  isMilestonePending,
  isMilestoneCanceled,
  requiresEmployerAction,
  requiresFreelancerAction,
  getNextStatusTransitions,
  canTransitionStatus,
  type MilestoneStatus,
} from '@/components/domains/milestones/MilestoneStatusBadge';

// ================================================
// COMPONENT TESTS
// ================================================

describe('MilestoneStatusBadge Component', () => {
  describe('Rendering', () => {
    it('renders PENDING status correctly', () => {
      render(<MilestoneStatusBadge status="PENDING" showIcon />);

      expect(screen.getByText('Beklemede')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-gray-100');
    });

    it('renders IN_PROGRESS status correctly', () => {
      render(<MilestoneStatusBadge status="IN_PROGRESS" showIcon />);

      expect(screen.getByText('Devam Ediyor')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-blue-100');
    });

    it('renders DELIVERED status correctly', () => {
      render(<MilestoneStatusBadge status="DELIVERED" showIcon />);

      expect(screen.getByText('Teslim Edildi')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-yellow-100');
    });

    it('renders ACCEPTED status correctly', () => {
      render(<MilestoneStatusBadge status="ACCEPTED" showIcon />);

      expect(screen.getByText('Onaylandı')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-green-100');
    });

    it('renders REVISION_REQUESTED status correctly', () => {
      render(<MilestoneStatusBadge status="REVISION_REQUESTED" showIcon />);

      expect(screen.getByText('Revizyon İstendi')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-purple-100');
    });

    it('renders CANCELED status correctly', () => {
      render(<MilestoneStatusBadge status="CANCELED" showIcon />);

      expect(screen.getByText('İptal Edildi')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-red-100');
    });
  });

  describe('Props', () => {
    it('shows icon when showIcon is true', () => {
      render(<MilestoneStatusBadge status="IN_PROGRESS" showIcon />);

      const badge = screen.getByRole('status');
      const icon = badge.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      render(<MilestoneStatusBadge status="IN_PROGRESS" showIcon={false} />);

      const badge = screen.getByRole('status');
      const icon = badge.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('applies small size classes', () => {
      render(<MilestoneStatusBadge status="PENDING" size="sm" />);

      expect(screen.getByRole('status')).toHaveClass(
        'text-xs',
        'px-2',
        'py-0.5'
      );
    });

    it('applies medium size classes (default)', () => {
      render(<MilestoneStatusBadge status="PENDING" size="md" />);

      expect(screen.getByRole('status')).toHaveClass(
        'text-sm',
        'px-2.5',
        'py-1'
      );
    });

    it('applies large size classes', () => {
      render(<MilestoneStatusBadge status="PENDING" size="lg" />);

      expect(screen.getByRole('status')).toHaveClass(
        'text-base',
        'px-3',
        'py-1.5'
      );
    });

    it('shows tooltip when showTooltip is true', () => {
      render(<MilestoneStatusBadge status="PENDING" showTooltip />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute(
        'title',
        'Milestone henüz başlatılmadı. Freelancer çalışmaya başlayana kadar bekliyor.'
      );
    });

    it('does not show tooltip when showTooltip is false', () => {
      render(<MilestoneStatusBadge status="PENDING" showTooltip={false} />);

      const badge = screen.getByRole('status');
      expect(badge).not.toHaveAttribute('title');
    });

    it('displays sequence number when provided', () => {
      render(<MilestoneStatusBadge status="PENDING" sequenceNumber={1} />);

      expect(screen.getByText(/#1/)).toBeInTheDocument();
      expect(screen.getByText(/Beklemede/)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <MilestoneStatusBadge status="PENDING" className="custom-class" />
      );

      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(<MilestoneStatusBadge status="PENDING" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label without sequence number', () => {
      render(<MilestoneStatusBadge status="IN_PROGRESS" />);

      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Milestone status: Devam Ediyor'
      );
    });

    it('has aria-label with sequence number', () => {
      render(<MilestoneStatusBadge status="DELIVERED" sequenceNumber={2} />);

      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Milestone 2 status: Teslim Edildi'
      );
    });

    it('marks icon as aria-hidden', () => {
      render(<MilestoneStatusBadge status="PENDING" showIcon />);

      const icon = screen.getByRole('status').querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

// ================================================
// HELPER FUNCTION TESTS
// ================================================

describe('Milestone Helper Functions', () => {
  describe('getMilestoneStatusLabel', () => {
    it('returns correct label for PENDING', () => {
      expect(getMilestoneStatusLabel('PENDING')).toBe('Beklemede');
    });

    it('returns correct label for IN_PROGRESS', () => {
      expect(getMilestoneStatusLabel('IN_PROGRESS')).toBe('Devam Ediyor');
    });

    it('returns correct label for DELIVERED', () => {
      expect(getMilestoneStatusLabel('DELIVERED')).toBe('Teslim Edildi');
    });

    it('returns correct label for ACCEPTED', () => {
      expect(getMilestoneStatusLabel('ACCEPTED')).toBe('Onaylandı');
    });

    it('returns correct label for REVISION_REQUESTED', () => {
      expect(getMilestoneStatusLabel('REVISION_REQUESTED')).toBe(
        'Revizyon İstendi'
      );
    });

    it('returns correct label for CANCELED', () => {
      expect(getMilestoneStatusLabel('CANCELED')).toBe('İptal Edildi');
    });
  });

  describe('getMilestoneStatusColor', () => {
    it('returns gray for PENDING', () => {
      expect(getMilestoneStatusColor('PENDING')).toBe('gray');
    });

    it('returns blue for IN_PROGRESS', () => {
      expect(getMilestoneStatusColor('IN_PROGRESS')).toBe('blue');
    });

    it('returns yellow for DELIVERED', () => {
      expect(getMilestoneStatusColor('DELIVERED')).toBe('yellow');
    });

    it('returns green for ACCEPTED', () => {
      expect(getMilestoneStatusColor('ACCEPTED')).toBe('green');
    });

    it('returns purple for REVISION_REQUESTED', () => {
      expect(getMilestoneStatusColor('REVISION_REQUESTED')).toBe('purple');
    });

    it('returns red for CANCELED', () => {
      expect(getMilestoneStatusColor('CANCELED')).toBe('red');
    });
  });

  describe('getMilestoneStatusDescription', () => {
    it('returns description for PENDING', () => {
      expect(getMilestoneStatusDescription('PENDING')).toContain(
        'henüz başlatılmadı'
      );
    });

    it('returns description for IN_PROGRESS', () => {
      expect(getMilestoneStatusDescription('IN_PROGRESS')).toContain(
        'aktif olarak çalışıyor'
      );
    });

    it('returns description for DELIVERED', () => {
      expect(getMilestoneStatusDescription('DELIVERED')).toContain(
        'teslim etti'
      );
    });

    it('returns description for ACCEPTED', () => {
      expect(getMilestoneStatusDescription('ACCEPTED')).toContain('onayladı');
    });
  });

  describe('isMilestoneCompleted', () => {
    it('returns true for ACCEPTED', () => {
      expect(isMilestoneCompleted('ACCEPTED')).toBe(true);
    });

    it('returns false for PENDING', () => {
      expect(isMilestoneCompleted('PENDING')).toBe(false);
    });

    it('returns false for IN_PROGRESS', () => {
      expect(isMilestoneCompleted('IN_PROGRESS')).toBe(false);
    });

    it('returns false for DELIVERED', () => {
      expect(isMilestoneCompleted('DELIVERED')).toBe(false);
    });
  });

  describe('isMilestoneActive', () => {
    it('returns true for IN_PROGRESS', () => {
      expect(isMilestoneActive('IN_PROGRESS')).toBe(true);
    });

    it('returns true for DELIVERED', () => {
      expect(isMilestoneActive('DELIVERED')).toBe(true);
    });

    it('returns true for REVISION_REQUESTED', () => {
      expect(isMilestoneActive('REVISION_REQUESTED')).toBe(true);
    });

    it('returns false for PENDING', () => {
      expect(isMilestoneActive('PENDING')).toBe(false);
    });

    it('returns false for ACCEPTED', () => {
      expect(isMilestoneActive('ACCEPTED')).toBe(false);
    });
  });

  describe('isMilestonePending', () => {
    it('returns true for PENDING', () => {
      expect(isMilestonePending('PENDING')).toBe(true);
    });

    it('returns false for IN_PROGRESS', () => {
      expect(isMilestonePending('IN_PROGRESS')).toBe(false);
    });
  });

  describe('isMilestoneCanceled', () => {
    it('returns true for CANCELED', () => {
      expect(isMilestoneCanceled('CANCELED')).toBe(true);
    });

    it('returns false for ACCEPTED', () => {
      expect(isMilestoneCanceled('ACCEPTED')).toBe(false);
    });
  });

  describe('requiresEmployerAction', () => {
    it('returns true for DELIVERED', () => {
      expect(requiresEmployerAction('DELIVERED')).toBe(true);
    });

    it('returns false for PENDING', () => {
      expect(requiresEmployerAction('PENDING')).toBe(false);
    });

    it('returns false for IN_PROGRESS', () => {
      expect(requiresEmployerAction('IN_PROGRESS')).toBe(false);
    });
  });

  describe('requiresFreelancerAction', () => {
    it('returns true for PENDING', () => {
      expect(requiresFreelancerAction('PENDING')).toBe(true);
    });

    it('returns true for REVISION_REQUESTED', () => {
      expect(requiresFreelancerAction('REVISION_REQUESTED')).toBe(true);
    });

    it('returns false for DELIVERED', () => {
      expect(requiresFreelancerAction('DELIVERED')).toBe(false);
    });

    it('returns false for ACCEPTED', () => {
      expect(requiresFreelancerAction('ACCEPTED')).toBe(false);
    });
  });

  describe('getNextStatusTransitions', () => {
    it('returns correct transitions for FREELANCER from PENDING', () => {
      const transitions = getNextStatusTransitions('PENDING', 'FREELANCER');
      expect(transitions).toEqual(['IN_PROGRESS']);
    });

    it('returns correct transitions for FREELANCER from IN_PROGRESS', () => {
      const transitions = getNextStatusTransitions('IN_PROGRESS', 'FREELANCER');
      expect(transitions).toEqual(['DELIVERED']);
    });

    it('returns correct transitions for FREELANCER from REVISION_REQUESTED', () => {
      const transitions = getNextStatusTransitions(
        'REVISION_REQUESTED',
        'FREELANCER'
      );
      expect(transitions).toEqual(['DELIVERED']);
    });

    it('returns empty array for FREELANCER from ACCEPTED', () => {
      const transitions = getNextStatusTransitions('ACCEPTED', 'FREELANCER');
      expect(transitions).toEqual([]);
    });

    it('returns correct transitions for EMPLOYER from DELIVERED', () => {
      const transitions = getNextStatusTransitions('DELIVERED', 'EMPLOYER');
      expect(transitions).toEqual(['ACCEPTED', 'REVISION_REQUESTED']);
    });

    it('returns empty array for EMPLOYER from PENDING', () => {
      const transitions = getNextStatusTransitions('PENDING', 'EMPLOYER');
      expect(transitions).toEqual([]);
    });

    it('returns empty array for EMPLOYER from IN_PROGRESS', () => {
      const transitions = getNextStatusTransitions('IN_PROGRESS', 'EMPLOYER');
      expect(transitions).toEqual([]);
    });
  });

  describe('canTransitionStatus', () => {
    it('allows FREELANCER to transition PENDING -> IN_PROGRESS', () => {
      expect(canTransitionStatus('PENDING', 'IN_PROGRESS', 'FREELANCER')).toBe(
        true
      );
    });

    it('allows FREELANCER to transition IN_PROGRESS -> DELIVERED', () => {
      expect(
        canTransitionStatus('IN_PROGRESS', 'DELIVERED', 'FREELANCER')
      ).toBe(true);
    });

    it('allows EMPLOYER to transition DELIVERED -> ACCEPTED', () => {
      expect(canTransitionStatus('DELIVERED', 'ACCEPTED', 'EMPLOYER')).toBe(
        true
      );
    });

    it('allows EMPLOYER to transition DELIVERED -> REVISION_REQUESTED', () => {
      expect(
        canTransitionStatus('DELIVERED', 'REVISION_REQUESTED', 'EMPLOYER')
      ).toBe(true);
    });

    it('prevents FREELANCER from transitioning PENDING -> ACCEPTED', () => {
      expect(canTransitionStatus('PENDING', 'ACCEPTED', 'FREELANCER')).toBe(
        false
      );
    });

    it('prevents EMPLOYER from transitioning PENDING -> IN_PROGRESS', () => {
      expect(canTransitionStatus('PENDING', 'IN_PROGRESS', 'EMPLOYER')).toBe(
        false
      );
    });

    it('prevents FREELANCER from transitioning DELIVERED -> ACCEPTED', () => {
      expect(canTransitionStatus('DELIVERED', 'ACCEPTED', 'FREELANCER')).toBe(
        false
      );
    });
  });
});

// ================================================
// SNAPSHOT TESTS
// ================================================

describe('MilestoneStatusBadge Snapshots', () => {
  it('matches snapshot for all statuses', () => {
    const statuses: MilestoneStatus[] = [
      'PENDING',
      'IN_PROGRESS',
      'DELIVERED',
      'ACCEPTED',
      'REVISION_REQUESTED',
      'CANCELED',
    ];

    statuses.forEach((status) => {
      const { container } = render(
        <MilestoneStatusBadge status={status} showIcon />
      );
      expect(container.firstChild).toMatchSnapshot(`status-${status}`);
    });
  });

  it('matches snapshot with sequence number', () => {
    const { container } = render(
      <MilestoneStatusBadge status="IN_PROGRESS" sequenceNumber={1} showIcon />
    );
    expect(container.firstChild).toMatchSnapshot('with-sequence-number');
  });

  it('matches snapshot for all sizes', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      const { container } = render(
        <MilestoneStatusBadge status="IN_PROGRESS" size={size} showIcon />
      );
      expect(container.firstChild).toMatchSnapshot(`size-${size}`);
    });
  });
});
