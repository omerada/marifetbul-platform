/**
 * ================================================
 * CHECKOUT PAGE INTEGRATION TESTS
 * ================================================
 * Tests for checkout flow with payment mode selection
 *
 * Coverage:
 * - Payment mode selection UI
 * - Order creation with payment mode
 * - Conditional payment flow (Escrow vs IBAN)
 * - CheckoutSession state management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Epic 1 Story 1.2
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from '@/app/checkout/[packageId]/page';
import { apiClient } from '@/lib/infrastructure/api/client';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ packageId: 'test-package-123' })),
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    push: jest.fn(),
  })),
}));

jest.mock('@/lib/infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@/components/shared/IyzicoProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="iyzico-provider">{children}</div>
  ),
}));

jest.mock('@/components/checkout/IyzicoCheckoutForm', () => ({
  IyzicoCheckoutForm: ({ checkoutSession }: any) => (
    <div data-testid="iyzico-checkout-form">
      Iyzico Form - Order: {checkoutSession.orderId}
    </div>
  ),
}));

jest.mock('@/components/checkout/OrderSummary', () => ({
  OrderSummary: () => <div data-testid="order-summary">Order Summary</div>,
}));

jest.mock('@/components/checkout/RequirementsForm', () => ({
  RequirementsForm: ({
    onSubmit,
  }: {
    onSubmit: (requirements: string, notes?: string) => void;
  }) => (
    <div data-testid="requirements-form">
      <button onClick={() => onSubmit('Test requirements', 'Test notes')}>
        Create Order
      </button>
    </div>
  ),
}));

jest.mock('@/components/domains/payments', () => ({
  PaymentModeSelector: ({
    selectedMode,
    onModeChange,
  }: {
    selectedMode: string;
    onModeChange: (mode: string) => void;
  }) => (
    <div data-testid="payment-mode-selector">
      <button onClick={() => onModeChange('ESCROW_PROTECTED')}>
        Escrow Mode
      </button>
      <button onClick={() => onModeChange('MANUAL_IBAN')}>IBAN Mode</button>
      <div>Selected: {selectedMode}</div>
    </div>
  ),
}));

const mockPackageData = {
  id: 'test-package-123',
  title: 'Test Package',
  price: 1000,
  deliveryTime: 7,
  description: 'Test description',
  seller: {
    id: 'seller-123',
    name: 'Test Seller',
  },
};

describe('CheckoutPage - Payment Mode Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.get as jest.Mock).mockResolvedValue(mockPackageData);
  });

  describe('Initial State', () => {
    it('loads package data on mount', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled();
      });

      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });

    it('displays payment mode selector before checkout session', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-mode-selector')).toBeInTheDocument();
      });

      expect(screen.getByText(/Ödeme Yöntemi Seçin/i)).toBeInTheDocument();
    });

    it('defaults to ESCROW_PROTECTED payment mode', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        const selector = screen.getByTestId('payment-mode-selector');
        expect(within(selector).getByText(/Selected: ESCROW_PROTECTED/i)).toBeInTheDocument();
      });
    });

    it('displays requirements form before checkout session', async () => {
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('requirements-form')).toBeInTheDocument();
      });
    });
  });

  describe('Payment Mode Selection', () => {
    it('allows user to change payment mode to IBAN', async () => {
      const user = userEvent.setup();
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-mode-selector')).toBeInTheDocument();
      });

      const ibanButton = screen.getByText('IBAN Mode');
      await user.click(ibanButton);

      expect(screen.getByText(/Selected: MANUAL_IBAN/i)).toBeInTheDocument();
    });

    it('allows user to switch back to Escrow mode', async () => {
      const user = userEvent.setup();
      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-mode-selector')).toBeInTheDocument();
      });

      // Switch to IBAN
      await user.click(screen.getByText('IBAN Mode'));
      expect(screen.getByText(/Selected: MANUAL_IBAN/i)).toBeInTheDocument();

      // Switch back to Escrow
      await user.click(screen.getByText('Escrow Mode'));
      expect(screen.getByText(/Selected: ESCROW_PROTECTED/i)).toBeInTheDocument();
    });
  });

  describe('Order Creation with Payment Mode', () => {
    it('includes payment mode in order creation request (Escrow)', async () => {
      const user = userEvent.setup();
      const mockOrderResponse = { id: 'order-123' };
      (apiClient.post as jest.Mock).mockResolvedValue(mockOrderResponse);

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('requirements-form')).toBeInTheDocument();
      });

      // Create order with default Escrow mode
      await user.click(screen.getByText('Create Order'));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            paymentMode: 'ESCROW_PROTECTED',
            requirements: 'Test requirements',
            notes: 'Test notes',
          })
        );
      });
    });

    it('includes payment mode in order creation request (IBAN)', async () => {
      const user = userEvent.setup();
      const mockOrderResponse = { id: 'order-456' };
      (apiClient.post as jest.Mock).mockResolvedValue(mockOrderResponse);

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-mode-selector')).toBeInTheDocument();
      });

      // Switch to IBAN mode
      await user.click(screen.getByText('IBAN Mode'));

      // Create order
      await user.click(screen.getByText('Create Order'));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            paymentMode: 'MANUAL_IBAN',
            requirements: 'Test requirements',
          })
        );
      });
    });
  });

  describe('Conditional Payment Flow', () => {
    it('shows Iyzico checkout form for ESCROW_PROTECTED mode', async () => {
      const user = userEvent.setup();
      const mockOrderResponse = { id: 'order-escrow-123' };
      (apiClient.post as jest.Mock).mockResolvedValue(mockOrderResponse);

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('requirements-form')).toBeInTheDocument();
      });

      // Create order with Escrow mode
      await user.click(screen.getByText('Create Order'));

      await waitFor(() => {
        expect(screen.getByTestId('iyzico-provider')).toBeInTheDocument();
        expect(screen.getByTestId('iyzico-checkout-form')).toBeInTheDocument();
      });

      // Payment mode selector should be hidden after checkout session
      expect(screen.queryByTestId('payment-mode-selector')).not.toBeInTheDocument();
    });

    it('shows IBAN payment instructions for MANUAL_IBAN mode', async () => {
      const user = userEvent.setup();
      const mockOrderResponse = { id: 'order-iban-456' };
      (apiClient.post as jest.Mock).mockResolvedValue(mockOrderResponse);

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-mode-selector')).toBeInTheDocument();
      });

      // Switch to IBAN mode
      await user.click(screen.getByText('IBAN Mode'));

      // Create order
      await user.click(screen.getByText('Create Order'));

      await waitFor(() => {
        expect(screen.getByText(/Banka Havalesi ile Ödeme/i)).toBeInTheDocument();
        expect(
          screen.getByText(/IBAN bilgileri ve ödeme kanıtı/i)
        ).toBeInTheDocument();
      });

      // Iyzico form should NOT be shown
      expect(screen.queryByTestId('iyzico-checkout-form')).not.toBeInTheDocument();
    });
  });

  describe('CheckoutSession State', () => {
    it('creates checkout session with payment mode', async () => {
      const user = userEvent.setup();
      const mockOrderResponse = { id: 'order-session-789' };
      (apiClient.post as jest.Mock).mockResolvedValue(mockOrderResponse);

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-mode-selector')).toBeInTheDocument();
      });

      // Switch to IBAN
      await user.click(screen.getByText('IBAN Mode'));

      // Create order
      await user.click(screen.getByText('Create Order'));

      await waitFor(() => {
        // Verify checkout session is created (payment UI is shown)
        expect(screen.getByText(/Banka Havalesi ile Ödeme/i)).toBeInTheDocument();
      });
    });

    it('hides payment mode selector after checkout session creation', async () => {
      const user = userEvent.setup();
      const mockOrderResponse = { id: 'order-hide-selector' };
      (apiClient.post as jest.Mock).mockResolvedValue(mockOrderResponse);

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('payment-mode-selector')).toBeInTheDocument();
      });

      // Create order
      await user.click(screen.getByText('Create Order'));

      await waitFor(() => {
        // Payment mode selector should disappear
        expect(screen.queryByTestId('payment-mode-selector')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles order creation errors gracefully', async () => {
      const user = userEvent.setup();
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByTestId('requirements-form')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create Order'));

      // Should not crash, error handling in component
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalled();
      });
    });
  });
});
