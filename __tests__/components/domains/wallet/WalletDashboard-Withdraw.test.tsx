/**
 * WalletDashboard Withdraw Flow Tests
 * Tests withdraw modal integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WalletDashboard } from '@/components/domains/wallet/WalletDashboard';
import { useWalletData } from '@/hooks/business/wallet/useWalletData';
import { useWebSocketWallet } from '@/hooks/business/wallet/useWebSocketWallet';
import { toast } from 'sonner';

// Mock hooks
jest.mock('@/hooks/business/wallet/useWalletData');
jest.mock('@/hooks/business/wallet/useWebSocketWallet');
jest.mock('sonner');

// Mock PayoutRequestFlow (replacement for deprecated PayoutRequestModal)
jest.mock('@/components/domains/wallet/PayoutRequestFlow', () => ({
  PayoutRequestFlow: ({ isOpen, onClose, onSubmit }: any) =>
    isOpen ? (
      <div data-testid="payout-request-flow">
        <button onClick={onClose}>Close</button>
        <button
          onClick={() => onSubmit({ amount: 100, method: 'BANK_TRANSFER' })}
        >
          Submit
        </button>
      </div>
    ) : null,
}));

const mockWalletData = {
  wallet: null,
  balance: null,
  transactions: [],
  isLoading: false,
  error: null,
  refresh: jest.fn(),
  isRefreshing: false,
  availableBalance: 1000,
  pendingBalance: 200,
  totalEarnings: 5000,
  totalPayouts: 1500,
};

const mockWebSocketData = {
  isConnected: true,
  balanceData: null,
  latestTransaction: null,
};

describe('WalletDashboard - Withdraw Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWalletData as jest.Mock).mockReturnValue(mockWalletData);
    (useWebSocketWallet as jest.Mock).mockReturnValue(mockWebSocketData);
  });

  describe('Withdraw Modal Integration', () => {
    it('should not show modal by default', () => {
      render(<WalletDashboard />);
      expect(screen.queryByTestId('payout-modal')).not.toBeInTheDocument();
    });

    it('should open modal when withdraw button clicked', async () => {
      render(<WalletDashboard />);

      // Find and click withdraw button
      const withdrawButton = screen.getByText(/Para Çek/i);
      fireEvent.click(withdrawButton);

      await waitFor(() => {
        expect(screen.getByTestId('payout-modal')).toBeInTheDocument();
      });
    });

    it('should close modal when close button clicked', async () => {
      render(<WalletDashboard />);

      // Open modal
      const withdrawButton = screen.getByText(/Para Çek/i);
      fireEvent.click(withdrawButton);

      await waitFor(() => {
        expect(screen.getByTestId('payout-modal')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('payout-modal')).not.toBeInTheDocument();
      });
    });

    it('should show success toast and refresh on successful payout', async () => {
      render(<WalletDashboard />);

      // Open modal
      const withdrawButton = screen.getByText(/Para Çek/i);
      fireEvent.click(withdrawButton);

      await waitFor(() => {
        expect(screen.getByTestId('payout-modal')).toBeInTheDocument();
      });

      // Submit payout
      const submitButton = screen.getByText('Submit Payout');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Para çekme talebi oluşturuldu',
          expect.objectContaining({
            description: expect.stringContaining('1-3 iş günü'),
          })
        );
        expect(mockWalletData.refresh).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading', () => {
      (useWalletData as jest.Mock).mockReturnValue({
        ...mockWalletData,
        isLoading: true,
      });

      render(<WalletDashboard />);
      expect(screen.getByText(/Cüzdanım/i)).toBeInTheDocument();
      // Loading skeleton should be visible
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      (useWalletData as jest.Mock).mockReturnValue({
        ...mockWalletData,
        error: { message: 'Failed to load wallet' },
      });

      render(<WalletDashboard />);
      expect(
        screen.getByText(/Cüzdan bilgileri yüklenirken hata oluştu/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Failed to load wallet')).toBeInTheDocument();
    });
  });

  describe('WebSocket Integration', () => {
    it('should show connection status when websocket enabled', () => {
      render(<WalletDashboard enableWebSocket />);
      expect(screen.getByText('Canlı')).toBeInTheDocument();
    });

    it('should show disconnected status when websocket not connected', () => {
      (useWebSocketWallet as jest.Mock).mockReturnValue({
        ...mockWebSocketData,
        isConnected: false,
      });

      render(<WalletDashboard enableWebSocket />);
      expect(screen.getByText('Bağlantı Yok')).toBeInTheDocument();
    });
  });
});
