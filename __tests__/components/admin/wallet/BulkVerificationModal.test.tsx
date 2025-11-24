/**
 * ================================================
 * BULK VERIFICATION MODAL - TESTS
 * ================================================
 * Test suite for BulkVerificationModal component
 * Coverage: Sequential processing, progress tracking, error handling
 *
 * Sprint 1 - Story 1.3: Bank Account Verification Flow
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkVerificationModal } from '@/components/admin/wallet/BulkVerificationModal';

// ============================================================================
// TEST SUITE
// ============================================================================

describe('BulkVerificationModal', () => {
  const mockAccountIds = ['acc-1', 'acc-2', 'acc-3'];
  const mockAccountNames = new Map([
    ['acc-1', 'Ahmet Yılmaz'],
    ['acc-2', 'Mehmet Demir'],
    ['acc-3', 'Ayşe Kaya'],
  ]);

  const mockOnVerify = jest.fn(() => Promise.resolve());
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    accountIds: mockAccountIds,
    onVerify: mockOnVerify,
    accountNames: mockAccountNames,
  };

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render modal when open', () => {
      render(<BulkVerificationModal {...defaultProps} />);

      expect(screen.getByText('Toplu Hesap Onaylama')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<BulkVerificationModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText('Toplu Hesap Onaylama')
      ).not.toBeInTheDocument();
    });

    it('should display all account names', () => {
      render(<BulkVerificationModal {...defaultProps} />);

      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
      expect(screen.getByText('Ayşe Kaya')).toBeInTheDocument();
    });

    it('should show correct total count', () => {
      render(<BulkVerificationModal {...defaultProps} />);

      expect(screen.getByText('3')).toBeInTheDocument(); // Total stat
    });

    it('should display warning message before start', () => {
      render(<BulkVerificationModal {...defaultProps} />);

      expect(screen.getByText('Dikkat!')).toBeInTheDocument();
      expect(
        screen.getByText(/3 banka hesabını onaylamak üzeresiniz/)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // PROCESSING TESTS
  // ==========================================================================

  describe('Processing', () => {
    it('should start processing when start button clicked', async () => {
      const user = userEvent.setup();
      render(<BulkVerificationModal {...defaultProps} />);

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalled();
      });
    });

    it('should process accounts sequentially', async () => {
      const user = userEvent.setup();
      const verifyOrder: string[] = [];

      const mockSequentialVerify = jest.fn((id: string) => {
        verifyOrder.push(id);
        return Promise.resolve();
      });

      render(
        <BulkVerificationModal
          {...defaultProps}
          onVerify={mockSequentialVerify}
        />
      );

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(
        () => {
          expect(verifyOrder).toEqual(['acc-1', 'acc-2', 'acc-3']);
        },
        { timeout: 5000 }
      );
    });

    it('should update progress bar during processing', async () => {
      const user = userEvent.setup();

      let resolvers: Array<() => void> = [];
      const mockSlowVerify = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolvers.push(resolve);
          })
      );

      render(
        <BulkVerificationModal {...defaultProps} onVerify={mockSlowVerify} />
      );

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      // Wait for first call
      await waitFor(() => {
        expect(mockSlowVerify).toHaveBeenCalledTimes(1);
      });

      // Should show progress
      expect(screen.getByText(/İşleniyor:/)).toBeInTheDocument();

      // Resolve all
      resolvers.forEach((r) => r());
    });

    it('should show completion message when done', async () => {
      const user = userEvent.setup();
      render(<BulkVerificationModal {...defaultProps} />);

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(
        () => {
          expect(
            screen.getByText('Toplu Onaylama Tamamlandı')
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should update success count during processing', async () => {
      const user = userEvent.setup();
      render(<BulkVerificationModal {...defaultProps} />);

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(
        () => {
          // Should show 3 successful
          const successElements = screen.getAllByText('3');
          expect(successElements.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle verification failures', async () => {
      const user = userEvent.setup();

      const mockFailingVerify = jest.fn((id: string) => {
        if (id === 'acc-2') {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve();
      });

      render(
        <BulkVerificationModal {...defaultProps} onVerify={mockFailingVerify} />
      );

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(
        () => {
          // Should show failure count
          expect(screen.getByText('1')).toBeInTheDocument(); // Failed count
        },
        { timeout: 5000 }
      );
    });

    it('should continue processing after error', async () => {
      const user = userEvent.setup();

      const mockPartialFailVerify = jest.fn((id: string) => {
        if (id === 'acc-1') {
          return Promise.reject(new Error('First failed'));
        }
        return Promise.resolve();
      });

      render(
        <BulkVerificationModal
          {...defaultProps}
          onVerify={mockPartialFailVerify}
        />
      );

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(
        () => {
          // Should have called verify for all accounts
          expect(mockPartialFailVerify).toHaveBeenCalledTimes(3);
        },
        { timeout: 5000 }
      );
    });

    it('should display error messages', async () => {
      const user = userEvent.setup();

      const mockErrorVerify = jest.fn((id: string) => {
        if (id === 'acc-2') {
          return Promise.reject(new Error('Invalid IBAN'));
        }
        return Promise.resolve();
      });

      render(
        <BulkVerificationModal {...defaultProps} onVerify={mockErrorVerify} />
      );

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(
        () => {
          expect(screen.getByText('Invalid IBAN')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  // ==========================================================================
  // CANCEL TESTS
  // ==========================================================================

  describe('Cancel', () => {
    it('should show stop button during processing', async () => {
      const user = userEvent.setup();

      let resolver: () => void;
      const mockHangingVerify = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolver = resolve;
          })
      );

      render(
        <BulkVerificationModal {...defaultProps} onVerify={mockHangingVerify} />
      );

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('İşlemi Durdur')).toBeInTheDocument();
      });

      // Cleanup
      resolver!();
    });

    it('should stop processing when cancelled', async () => {
      const user = userEvent.setup();

      let resolvers: Array<() => void> = [];
      const mockSlowVerify = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolvers.push(resolve);
          })
      );

      render(
        <BulkVerificationModal {...defaultProps} onVerify={mockSlowVerify} />
      );

      // Start
      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      // Wait for first call
      await waitFor(() => {
        expect(mockSlowVerify).toHaveBeenCalledTimes(1);
      });

      // Stop
      const stopButton = screen.getByText('İşlemi Durdur');
      await user.click(stopButton);

      // Resolve first and wait
      resolvers[0]();
      await waitFor(() => {
        expect(screen.getByText('İşlem İptal Edildi')).toBeInTheDocument();
      });

      // Should not have processed all accounts
      expect(mockSlowVerify).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // CLOSE TESTS
  // ==========================================================================

  describe('Close', () => {
    it('should close when cancel button clicked before start', async () => {
      const user = userEvent.setup();
      render(<BulkVerificationModal {...defaultProps} />);

      const cancelButton = screen.getByText('İptal');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close when close button clicked after completion', async () => {
      const user = userEvent.setup();
      render(<BulkVerificationModal {...defaultProps} />);

      // Start and wait for completion
      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(
        () => {
          expect(screen.getByText('Kapat')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const closeButton = screen.getByText('Kapat');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should confirm before closing during processing', async () => {
      const user = userEvent.setup();

      // Mock window.confirm
      global.confirm = jest.fn(() => false);

      let resolver: () => void;
      const mockHangingVerify = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolver = resolve;
          })
      );

      render(
        <BulkVerificationModal {...defaultProps} onVerify={mockHangingVerify} />
      );

      // Start
      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(() => {
        expect(mockHangingVerify).toHaveBeenCalled();
      });

      // Try to close
      const closeButton = screen.getAllByRole('button').find(
        (btn) => btn.querySelector('svg') // X icon
      );
      if (closeButton) {
        await user.click(closeButton);
        expect(global.confirm).toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      }

      // Cleanup
      resolver!();
    });
  });

  // ==========================================================================
  // STATS TESTS
  // ==========================================================================

  describe('Stats', () => {
    it('should show initial stats before processing', () => {
      render(<BulkVerificationModal {...defaultProps} />);

      const statCards = screen.getAllByText('3');
      expect(statCards).toHaveLength(1); // Total count

      expect(screen.getByText('0')).toBeInTheDocument(); // Initial success
    });

    it('should update stats during processing', async () => {
      const user = userEvent.setup();
      render(<BulkVerificationModal {...defaultProps} />);

      const startButton = screen.getByText('Onaylamaya Başla');
      await user.click(startButton);

      await waitFor(
        () => {
          // Should show success count increasing
          const successCount = screen.getByText('Başarılı');
          expect(successCount).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });
});
