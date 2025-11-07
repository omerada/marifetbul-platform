/**
 * ================================================
 * EMPTY STATE - UNIT TESTS
 * ================================================
 * Test suite for EmptyState widget component
 *
 * Sprint 7: Component Testing Coverage - Dashboard Widgets
 * Test Coverage: Component rendering, props, icon display,
 *               action button, accessibility
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 7: Component Testing
 * @since 2025-11-07
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/domains/dashboard/widgets/EmptyState';
import { Package } from 'lucide-react';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      render(<EmptyState title="No data found" />);

      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should render with title and description', () => {
      render(
        <EmptyState
          title="No packages found"
          description="Create your first package to get started"
        />
      );

      expect(screen.getByText('No packages found')).toBeInTheDocument();
      expect(
        screen.getByText('Create your first package to get started')
      ).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <EmptyState title="Test" className="custom-class" />
      );

      const emptyState = container.firstChild;
      expect(emptyState).toHaveClass('custom-class');
    });

    it('should render default Inbox icon when no icon provided', () => {
      render(<EmptyState title="Empty" />);

      // Check for inbox icon by test id (from our mock)
      expect(screen.getByTestId('inbox-icon')).toBeInTheDocument();
    });

    it('should render custom icon when provided', () => {
      render(<EmptyState title="No packages" icon={Package} />);

      // Check for package icon
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('should not render action button when not provided', () => {
      render(<EmptyState title="Empty" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render action button with label', () => {
      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create New',
            onClick: jest.fn(),
          }}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Create New' })
      ).toBeInTheDocument();
    });

    it('should call onClick when action button clicked', async () => {
      const handleClick = jest.fn();

      render(
        <EmptyState
          title="Empty"
          action={{
            label: 'Add Item',
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByRole('button', { name: 'Add Item' });
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Variations', () => {
    it('should render minimal content (title only)', () => {
      render(<EmptyState title="Minimal" />);

      expect(screen.getByText('Minimal')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render full content (title, description, icon, action)', () => {
      const handleClick = jest.fn();

      render(
        <EmptyState
          icon={Package}
          title="No packages"
          description="You haven't created any packages yet"
          action={{
            label: 'Create Package',
            onClick: handleClick,
          }}
        />
      );

      expect(screen.getByText('No packages')).toBeInTheDocument();
      expect(
        screen.getByText("You haven't created any packages yet")
      ).toBeInTheDocument();
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create Package' })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <EmptyState
          title="Empty State"
          description="No items to display"
          action={{
            label: 'Add Item',
            onClick: jest.fn(),
          }}
        />
      );

      // Title should be in h3
      const title = screen.getByText('Empty State');
      expect(title.tagName).toBe('H3');

      // Description should be in p
      const description = screen.getByText('No items to display');
      expect(description.tagName).toBe('P');

      // Button should be accessible
      const button = screen.getByRole('button', { name: 'Add Item' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply proper CSS classes for layout', () => {
      const { container } = render(<EmptyState title="Test" />);

      const emptyState = container.firstChild as HTMLElement;
      expect(emptyState).toHaveClass('flex');
      expect(emptyState).toHaveClass('flex-col');
      expect(emptyState).toHaveClass('items-center');
      expect(emptyState).toHaveClass('justify-center');
    });

    it('should have border and background', () => {
      const { container } = render(<EmptyState title="Test" />);

      const emptyState = container.firstChild as HTMLElement;
      expect(emptyState).toHaveClass('border');
      expect(emptyState).toHaveClass('border-dashed');
      expect(emptyState).toHaveClass('bg-gray-50/50');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles', () => {
      const longTitle =
        'This is a very long title that might wrap to multiple lines in the UI';

      render(<EmptyState title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDescription =
        'This is a very long description that provides detailed information about why there is no data and what the user should do about it';

      render(<EmptyState title="Empty" description={longDescription} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle empty string description', () => {
      render(<EmptyState title="Test" description="" />);

      // Empty description should not render
      const description = screen.queryByText('');
      expect(description).not.toBeInTheDocument();
    });
  });
});
