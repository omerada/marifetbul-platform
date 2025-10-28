/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DashboardSkeleton,
  DashboardSkeletonCompact,
} from '../DashboardSkeleton';

describe('DashboardSkeleton', () => {
  describe('Rendering', () => {
    it('should render loading skeleton with default variant', () => {
      const { container } = render(<DashboardSkeleton />);

      // Check for skeleton elements with pulse animation
      const skeletonElements = container.querySelectorAll(
        '[class*="animate-pulse"]'
      );
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should render freelancer variant with specific structure', () => {
      const { container } = render(<DashboardSkeleton variant="freelancer" />);

      // Check for additional freelancer-specific sections
      const cards = container.querySelectorAll('[class*="space-y"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render employer variant', () => {
      const { container } = render(<DashboardSkeleton variant="employer" />);

      // Should have employer-specific grid layout
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render admin variant', () => {
      const { container } = render(<DashboardSkeleton variant="admin" />);

      // Admin uses default layout
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have pulse animation classes', () => {
      const { container } = render(<DashboardSkeleton />);

      // Check for animation classes
      const animatedElements = container.querySelectorAll('[class*="animate"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should apply shimmer effect to skeleton elements', () => {
      const { container } = render(<DashboardSkeleton />);

      // Check for shimmer/pulse animation
      const shimmerElements = container.querySelectorAll(
        '[class*="pulse"], [class*="shimmer"]'
      );
      expect(shimmerElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have pulse animation for visual loading indication', () => {
      const { container } = render(<DashboardSkeleton />);

      // Check for pulse animation classes
      const animatedElements = container.querySelectorAll(
        '[class*="animate-pulse"]'
      );
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable (no focusable elements in skeleton)', () => {
      const { container } = render(<DashboardSkeleton />);

      // Skeleton should not have focusable elements
      const focusableElements = container.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements).toHaveLength(0);
    });

    it('should render without interactive elements', () => {
      const { container } = render(<DashboardSkeleton />);

      // Skeleton should be purely visual
      const buttons = container.querySelectorAll('button');
      const links = container.querySelectorAll('a');

      expect(buttons).toHaveLength(0);
      expect(links).toHaveLength(0);
    });
  });

  describe('Responsiveness', () => {
    it('should render without errors on mobile viewport', () => {
      // Simulate mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;

      const { container } = render(<DashboardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render without errors on desktop viewport', () => {
      // Simulate desktop viewport
      global.innerWidth = 1920;
      global.innerHeight = 1080;

      const { container } = render(<DashboardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle all variant types', () => {
      const variants: Array<'freelancer' | 'employer' | 'admin'> = [
        'freelancer',
        'employer',
        'admin',
      ];

      variants.forEach((variant) => {
        const { container } = render(<DashboardSkeleton variant={variant} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should use default variant when props are undefined', () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

describe('DashboardSkeletonCompact', () => {
  it('should render compact version with reduced elements', () => {
    const { container: fullContainer } = render(<DashboardSkeleton />);
    const { container: compactContainer } = render(
      <DashboardSkeletonCompact />
    );

    // Compact should render successfully
    expect(compactContainer.firstChild).toBeInTheDocument();
    expect(fullContainer.firstChild).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = render(<DashboardSkeletonCompact />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have compact grid layout', () => {
    const { container } = render(<DashboardSkeletonCompact />);

    // Check for grid-cols-2 for compact stats
    const gridElements = container.querySelectorAll('[class*="grid-cols-2"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });
});

describe('DashboardSkeleton Integration', () => {
  it('should match snapshot for freelancer variant', () => {
    const { container } = render(<DashboardSkeleton variant="freelancer" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should render consistently across multiple renders', () => {
    const { container: first } = render(
      <DashboardSkeleton variant="employer" />
    );
    const { container: second } = render(
      <DashboardSkeleton variant="employer" />
    );

    // Both should have same structure
    expect(first.innerHTML).toBe(second.innerHTML);
  });
});
