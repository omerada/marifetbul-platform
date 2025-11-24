/**
 * ================================================
 * BANK ACCOUNT VERIFICATION PANEL - TESTS
 * ================================================
 * Test suite for BankAccountVerificationPanel component
 * Coverage: Selection, bulk actions, sorting, filtering
 *
 * Sprint 1 - Story 1.3: Bank Account Verification Flow
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BankAccountVerificationPanel } from '@/components/admin/wallet/BankAccountVerificationPanel';
import type { BankAccountResponse } from '@/lib/api/bank-accounts';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAccounts: BankAccountResponse[] = [
  {
    id: '1',
    userId: 'user-1',
    iban: 'TR330006100519786457841326',
    maskedIban: 'TR33 **** **** **** **** **** 26',
    bankCode: '00061',
    bankName: 'Türkiye İş Bankası',
    accountHolder: 'Ahmet Yılmaz',
    isDefault: false,
    status: 'PENDING',
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2025-11-20T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user-2',
    iban: 'TR330006200519786457841327',
    maskedIban: 'TR33 **** **** **** **** **** 27',
    bankCode: '00062',
    bankName: 'Garanti BBVA',
    accountHolder: 'Mehmet Demir',
    isDefault: false,
    status: 'PENDING',
    createdAt: '2025-11-21T14:30:00Z',
    updatedAt: '2025-11-21T14:30:00Z',
  },
  {
    id: '3',
    userId: 'user-3',
    iban: 'TR330006300519786457841328',
    maskedIban: 'TR33 **** **** **** **** **** 28',
    bankCode: '00063',
    bankName: 'Akbank',
    accountHolder: 'Ayşe Kaya',
    isDefault: false,
    status: 'PENDING',
    createdAt: '2025-11-19T09:15:00Z',
    updatedAt: '2025-11-19T09:15:00Z',
  },
];

// ============================================================================
// TEST SUITE
// ============================================================================

describe('BankAccountVerificationPanel', () => {
  const mockOnVerify = jest.fn(() => Promise.resolve());
  const mockOnReject = jest.fn(() => Promise.resolve());
  const mockOnBulkVerify = jest.fn(() => Promise.resolve());
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    accounts: mockAccounts,
    isLoading: false,
    onVerify: mockOnVerify,
    onReject: mockOnReject,
    onBulkVerify: mockOnBulkVerify,
    onViewDetails: mockOnViewDetails,
  };

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render pending accounts list', () => {
      render(<BankAccountVerificationPanel {...defaultProps} />);

      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
      expect(screen.getByText('Ayşe Kaya')).toBeInTheDocument();
    });

    it('should display stats bar with correct counts', () => {
      render(<BankAccountVerificationPanel {...defaultProps} />);

      expect(screen.getByText('3')).toBeInTheDocument(); // Total count
      expect(screen.getByText('Toplam Bekleyen')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(
        <BankAccountVerificationPanel {...defaultProps} isLoading={true} />
      );

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show empty state when no accounts', () => {
      render(<BankAccountVerificationPanel {...defaultProps} accounts={[]} />);

      expect(screen.getByText('Tüm Hesaplar İncelendi')).toBeInTheDocument();
      expect(
        screen.getByText('Bekleyen banka hesabı bulunmuyor')
      ).toBeInTheDocument();
    });

    it('should render all account details correctly', () => {
      render(<BankAccountVerificationPanel {...defaultProps} />);

      // Bank names
      expect(screen.getByText('Türkiye İş Bankası')).toBeInTheDocument();
      expect(screen.getByText('Garanti BBVA')).toBeInTheDocument();

      // IBANs (masked)
      expect(screen.getByText(/TR33.*26/)).toBeInTheDocument();
      expect(screen.getByText(/TR33.*27/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SELECTION TESTS
  // ==========================================================================

  describe('Selection', () => {
    it('should select individual account', async () => {
      const user = userEvent.setup();
      render(<BankAccountVerificationPanel {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const firstAccountCheckbox = checkboxes[1]; // Skip "select all"

      await user.click(firstAccountCheckbox);

      expect(firstAccountCheckbox).toBeChecked();
      expect(screen.getByText('1')).toBeInTheDocument(); // Selected count
    });

    it('should select all accounts', async () => {
      const user = userEvent.setup();
      render(<BankAccountVerificationPanel {...defaultProps} />);

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      expect(screen.getByText('3')).toBeInTheDocument(); // All 3 selected
    });

    it('should deselect all when clicking select all again', async () => {
      const user = userEvent.setup();
      render(<BankAccountVerificationPanel {...defaultProps} />);

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];

      // Select all
      await user.click(selectAllCheckbox);
      expect(screen.getByText('3')).toBeInTheDocument();

      // Deselect all
      await user.click(selectAllCheckbox);
      expect(screen.queryByText('Seçili')).not.toBeInTheDocument();
    });

    it('should clear selection with clear button', async () => {
      const user = userEvent.setup();
      render(<BankAccountVerificationPanel {...defaultProps} />);

      // Select one account
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);

      // Clear selection
      const clearButton = screen.getByText('Seçimi Temizle');
      await user.click(clearButton);

      expect(screen.queryByText('Seçili')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SINGLE ACTION TESTS
  // ==========================================================================

  describe('Single Actions', () => {
    it('should verify single account', async () => {
      const user = userEvent.setup();
      render(<BankAccountVerificationPanel {...defaultProps} />);

      // Find verify button (green checkmark)
      const verifyButtons = screen.getAllByTitle('Onayla');
      await user.click(verifyButtons[0]);

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalledWith('1');
      });
    });

    it('should reject single account with reason', async () => {
      const user = userEvent.setup();

      // Mock window.prompt
      global.prompt = jest.fn(() => 'Geçersiz IBAN');

      render(<BankAccountVerificationPanel {...defaultProps} />);

      const rejectButtons = screen.getAllByTitle('Reddet');
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(mockOnReject).toHaveBeenCalledWith('1', 'Geçersiz IBAN');
      });
    });

    it('should not reject if no reason provided', async () => {
      const user = userEvent.setup();

      // Mock window.prompt to return empty
      global.prompt = jest.fn(() => '');

      render(<BankAccountVerificationPanel {...defaultProps} />);

      const rejectButtons = screen.getAllByTitle('Reddet');
      await user.click(rejectButtons[0]);

      expect(mockOnReject).not.toHaveBeenCalled();
    });

    it('should view account details', async () => {
      const user = userEvent.setup();
      render(<BankAccountVerificationPanel {...defaultProps} />);

      const detailsButtons = screen.getAllByTitle('Detaylar');
      await user.click(detailsButtons[0]);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockAccounts[0]);
    });
  });

  // ==========================================================================
  // BULK ACTION TESTS
  // ==========================================================================

  describe('Bulk Actions', () => {
    it('should show bulk verify button when accounts selected', async () => {
      const user = userEvent.setup();
      render(<BankAccountVerificationPanel {...defaultProps} />);

      // Select 2 accounts
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      expect(screen.getByText('2 Hesabı Onayla')).toBeInTheDocument();
    });

    it('should perform bulk verification with confirmation', async () => {
      const user = userEvent.setup();

      // Mock window.confirm
      global.confirm = jest.fn(() => true);

      render(<BankAccountVerificationPanel {...defaultProps} />);

      // Select all accounts
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      // Click bulk verify
      const bulkButton = screen.getByText('3 Hesabı Onayla');
      await user.click(bulkButton);

      await waitFor(() => {
        expect(mockOnBulkVerify).toHaveBeenCalledWith(['1', '2', '3']);
      });
    });

    it('should not perform bulk verification if not confirmed', async () => {
      const user = userEvent.setup();

      // Mock window.confirm to return false
      global.confirm = jest.fn(() => false);

      render(<BankAccountVerificationPanel {...defaultProps} />);

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      const bulkButton = screen.getByText('3 Hesabı Onayla');
      await user.click(bulkButton);

      expect(mockOnBulkVerify).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // WAIT TIME INDICATOR TESTS
  // ==========================================================================

  describe('Wait Time Indicators', () => {
    it('should show wait badge for old accounts', () => {
      const oldAccount: BankAccountResponse = {
        ...mockAccounts[0],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      };

      render(
        <BankAccountVerificationPanel
          {...defaultProps}
          accounts={[oldAccount]}
        />
      );

      expect(screen.getByText(/5 gün bekliyor/)).toBeInTheDocument();
    });

    it('should not show wait badge for recent accounts', () => {
      const recentAccount: BankAccountResponse = {
        ...mockAccounts[0],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      };

      render(
        <BankAccountVerificationPanel
          {...defaultProps}
          accounts={[recentAccount]}
        />
      );

      expect(screen.queryByText(/gün bekliyor/)).not.toBeInTheDocument();
    });

    it('should display oldest wait days in stats', () => {
      const accounts = [
        {
          ...mockAccounts[0],
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          ...mockAccounts[1],
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      render(
        <BankAccountVerificationPanel {...defaultProps} accounts={accounts} />
      );

      expect(screen.getByText('En Eski Bekleme')).toBeInTheDocument();
      expect(screen.getByText('5 gün')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle verification error gracefully', async () => {
      const user = userEvent.setup();
      const mockOnVerifyError = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      render(
        <BankAccountVerificationPanel
          {...defaultProps}
          onVerify={mockOnVerifyError}
        />
      );

      const verifyButtons = screen.getAllByTitle('Onayla');
      await user.click(verifyButtons[0]);

      // Should not crash
      await waitFor(() => {
        expect(mockOnVerifyError).toHaveBeenCalled();
      });
    });

    it('should disable actions when processing', async () => {
      const user = userEvent.setup();

      let resolveVerify: () => void;
      const mockSlowVerify = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveVerify = resolve;
          })
      );

      render(
        <BankAccountVerificationPanel
          {...defaultProps}
          onVerify={mockSlowVerify}
        />
      );

      const verifyButtons = screen.getAllByTitle('Onayla');
      await user.click(verifyButtons[0]);

      // Checkbox should be disabled
      const checkbox = screen.getAllByRole('checkbox')[1];
      expect(checkbox).toBeDisabled();

      // Cleanup
      resolveVerify!();
    });
  });

  // ==========================================================================
  // HELP TEXT TEST
  // ==========================================================================

  describe('Help Text', () => {
    it('should render help section with tips', () => {
      render(<BankAccountVerificationPanel {...defaultProps} />);

      expect(screen.getByText('Doğrulama İpuçları:')).toBeInTheDocument();
      expect(
        screen.getByText(/IBAN formatının doğru olduğunu onaylayın/)
      ).toBeInTheDocument();
    });
  });
});
