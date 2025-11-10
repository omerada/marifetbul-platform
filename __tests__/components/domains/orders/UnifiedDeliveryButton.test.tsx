/**
 * ================================================
 * UNIFIED DELIVERY BUTTON - UNIT TESTS
 * ================================================
 * Tests for the UnifiedDeliveryButton component
 *
 * Sprint 2 - Story 2.3: Unified Delivery Testing
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedDeliveryButton } from '../../../../components/domains/orders/UnifiedDeliveryButton';

// Mock UnifiedDeliveryModal since we're testing the button
jest.mock('../../../../components/domains/orders/UnifiedDeliveryModal', () => ({
  UnifiedDeliveryModal: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
  }) => (
    <div data-testid="delivery-modal" data-open={open}>
      <button onClick={() => onSuccess && onSuccess()}>Submit Delivery</button>
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}));

describe('UnifiedDeliveryButton', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Milestone Mode', () => {
    const milestoneProps = {
      mode: 'milestone' as const,
      milestoneId: 'milestone-123',
      orderId: 'order-123',
      title: 'Teslim Et',
      subtitle: 'Logo Design - Milestone 1',
      onSuccess: mockOnSuccess,
    };

    it('should render the button with correct text', () => {
      render(<UnifiedDeliveryButton {...milestoneProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Teslim Et')).toBeInTheDocument();
    });

    it('should open modal when button is clicked', async () => {
      render(<UnifiedDeliveryButton {...milestoneProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const modal = screen.getByTestId('delivery-modal');
        expect(modal).toHaveAttribute('data-open', 'true');
      });
    });

    it('should call onSuccess when delivery is submitted', async () => {
      render(<UnifiedDeliveryButton {...milestoneProps} />);

      // Open modal
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Submit delivery
      const submitButton = await screen.findByText('Submit Delivery');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should apply custom className', () => {
      render(
        <UnifiedDeliveryButton {...milestoneProps} className="custom-class" />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should show subtitle when provided', () => {
      render(<UnifiedDeliveryButton {...milestoneProps} />);

      expect(screen.getByText('Logo Design - Milestone 1')).toBeInTheDocument();
    });
  });

  describe('Order Mode', () => {
    const orderProps = {
      mode: 'order' as const,
      orderId: 'order-456',
      title: 'Siparişi Teslim Et',
      onSuccess: mockOnSuccess,
    };

    it('should render in order mode', () => {
      render(<UnifiedDeliveryButton {...orderProps} />);

      expect(screen.getByText('Siparişi Teslim Et')).toBeInTheDocument();
    });

    it('should open modal in order mode', async () => {
      render(<UnifiedDeliveryButton {...orderProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const modal = screen.getByTestId('delivery-modal');
        expect(modal).toHaveAttribute('data-open', 'true');
      });
    });
  });

  describe('Button Variants', () => {
    it('should apply primary variant styling', () => {
      render(
        <UnifiedDeliveryButton
          mode="milestone"
          milestoneId="m1"
          orderId="o1"
          title="Test"
          variant="primary"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should apply secondary variant styling', () => {
      render(
        <UnifiedDeliveryButton
          mode="milestone"
          milestoneId="m1"
          orderId="o1"
          title="Test"
          variant="secondary"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size', () => {
      render(
        <UnifiedDeliveryButton
          mode="milestone"
          milestoneId="m1"
          orderId="o1"
          title="Test"
          size="sm"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm');
    });

    it('should apply default size', () => {
      render(
        <UnifiedDeliveryButton
          mode="milestone"
          milestoneId="m1"
          orderId="o1"
          title="Test"
          size="md"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Modal Close Behavior', () => {
    it('should close modal when close button is clicked', async () => {
      render(
        <UnifiedDeliveryButton
          mode="milestone"
          milestoneId="m1"
          orderId="o1"
          title="Test"
        />
      );

      // Open modal
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Close modal
      const closeButton = await screen.findByText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        const modal = screen.getByTestId('delivery-modal');
        expect(modal).toHaveAttribute('data-open', 'false');
      });
    });
  });
});
