/**
 * CircularProgress Component Tests
 * Sprint 2 - Story 2.1: Testing Suite
 *
 * Unit tests for CircularProgress component
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  CircularProgress,
  MultiColorCircularProgress,
} from '@/components/shared/CircularProgress';

describe('CircularProgress Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<CircularProgress progress={50} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should display percentage text by default', () => {
      render(<CircularProgress progress={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should hide percentage text when showPercentage is false', () => {
      render(<CircularProgress progress={75} showPercentage={false} />);
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('should render custom content when provided', () => {
      render(
        <CircularProgress progress={50}>
          <div>Custom Content</div>
        </CircularProgress>
      );
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
  });

  describe('Progress Values', () => {
    it('should handle 0% progress', () => {
      render(<CircularProgress progress={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle 100% progress', () => {
      render(<CircularProgress progress={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should clamp negative values to 0', () => {
      render(<CircularProgress progress={-10} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should clamp values over 100 to 100', () => {
      render(<CircularProgress progress={150} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should round decimal values', () => {
      render(<CircularProgress progress={66.7} />);
      expect(screen.getByText('67%')).toBeInTheDocument();
    });
  });

  describe('SVG Properties', () => {
    it('should render SVG with correct size', () => {
      const { container } = render(
        <CircularProgress progress={50} size={200} />
      );
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '200');
    });

    it('should render with default size', () => {
      const { container } = render(<CircularProgress progress={50} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('should render two circles (track and progress)', () => {
      const { container } = render(<CircularProgress progress={50} />);
      const circles = container.querySelectorAll('circle');

      expect(circles).toHaveLength(2);
    });

    it('should apply custom colors', () => {
      const { container } = render(
        <CircularProgress
          progress={50}
          progressColor="#FF0000"
          trackColor="#00FF00"
        />
      );
      const circles = container.querySelectorAll('circle');

      expect(circles[0]).toHaveAttribute('stroke', '#00FF00'); // track
      expect(circles[1]).toHaveAttribute('stroke', '#FF0000'); // progress
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <CircularProgress progress={50} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should apply custom stroke width', () => {
      const { container } = render(
        <CircularProgress progress={50} strokeWidth={12} />
      );
      const circles = container.querySelectorAll('circle');

      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '12');
      });
    });
  });

  describe('Animation', () => {
    it('should have animation properties on progress circle', () => {
      const { container } = render(<CircularProgress progress={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];

      expect(progressCircle).toHaveAttribute('stroke-linecap', 'round');
    });

    it('should respect custom animation duration', () => {
      // This test verifies the prop is accepted
      // Actual animation testing would require jest-motion or similar
      render(<CircularProgress progress={50} animationDuration={2} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});

describe('MultiColorCircularProgress Component', () => {
  describe('Color Thresholds', () => {
    it('should use low color for values below medium threshold', () => {
      const { container } = render(
        <MultiColorCircularProgress progress={20} />
      );
      const progressCircle = container.querySelectorAll('circle')[1];

      // Default low color is red (#EF4444)
      expect(progressCircle).toHaveAttribute('stroke', '#EF4444');
    });

    it('should use medium color for values in medium range', () => {
      const { container } = render(
        <MultiColorCircularProgress progress={66} />
      );
      const progressCircle = container.querySelectorAll('circle')[1];

      // Progress 66 >= 66 (medium threshold) but < 100 (high threshold), so uses medium color
      expect(progressCircle).toHaveAttribute('stroke', '#F59E0B');
    });

    it('should use high color for values above high threshold', () => {
      const { container } = render(
        <MultiColorCircularProgress progress={100} />
      );
      const progressCircle = container.querySelectorAll('circle')[1];

      // Default high threshold is 100, so only 100% uses high color (#10B981)
      expect(progressCircle).toHaveAttribute('stroke', '#10B981');
    });

    it('should accept custom color thresholds', () => {
      const customThresholds = {
        low: { threshold: 50, color: '#FF0000' },
        medium: { threshold: 75, color: '#FFFF00' },
        high: { threshold: 100, color: '#00FF00' },
      };

      const { container } = render(
        <MultiColorCircularProgress
          progress={60}
          colorThresholds={customThresholds}
        />
      );
      const progressCircle = container.querySelectorAll('circle')[1];

      // progress 60 >= 50 (low) but < 75 (medium), so it uses low color
      expect(progressCircle).toHaveAttribute('stroke', '#FF0000');
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0% progress', () => {
      const { container } = render(<MultiColorCircularProgress progress={0} />);
      const progressCircle = container.querySelectorAll('circle')[1];

      expect(progressCircle).toHaveAttribute('stroke', '#EF4444'); // low color
    });

    it('should handle 100% progress', () => {
      const { container } = render(
        <MultiColorCircularProgress progress={100} />
      );
      const progressCircle = container.querySelectorAll('circle')[1];

      expect(progressCircle).toHaveAttribute('stroke', '#10B981'); // high color
    });

    it('should handle exact threshold values', () => {
      const { container: container1 } = render(
        <MultiColorCircularProgress progress={66} />
      );
      const progressCircle1 = container1.querySelectorAll('circle')[1];
      // progress 66 >= 66 (medium threshold), so uses medium color
      expect(progressCircle1).toHaveAttribute('stroke', '#F59E0B');

      const { container: container2 } = render(
        <MultiColorCircularProgress progress={33} />
      );
      const progressCircle2 = container2.querySelectorAll('circle')[1];
      // progress 33 >= 33 (low threshold) but < 66, so uses low color
      expect(progressCircle2).toHaveAttribute('stroke', '#EF4444');
    });
  });

  describe('Inherited Props', () => {
    it('should pass through CircularProgress props', () => {
      render(
        <MultiColorCircularProgress
          progress={50}
          size={200}
          showPercentage={true}
        />
      );

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should support custom children', () => {
      render(
        <MultiColorCircularProgress progress={50}>
          <div>Custom</div>
        </MultiColorCircularProgress>
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });
});
