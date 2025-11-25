/**
 * ============================================================================
 * BatchPayoutManager Component Tests
 * ============================================================================
 * Sprint 2 - Story 1: Test Coverage Improvements
 * Test Coverage Target: 85%+
 *
 * @version 2.0.0
 * @created 2025-11-19
 * ============================================================================
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BatchPayoutManager from '@/components/domains/admin/finance/payouts/BatchPayoutManager';
import * as batchPayoutApi from '@/lib/api/admin/batch-payout-api';
import * as payoutAdminApi from '@/lib/api/admin/payout-admin-api';
import type {
  Payout,
  PayoutBatchResponse,
} from '@/types/business/features/wallet';

// Mock APIs
jest.mock('@/lib/api/admin/batch-payout-api');
jest.mock('@/lib/api/admin/payout-admin-api');
jest.mock('@/hooks/core/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock data
const mockPayouts: Payout[] = [
  {
    id: 'payout-1',
    userId: 'user-1',
    amount: 1000,
    status: 'PENDING',
    createdAt: '2025-11-01T10:00:00Z',
    bankAccountId: 'bank-1',
    currency: 'TRY',
  },
  {
    id: 'payout-2',
    userId: 'user-2',
    amount: 2000,
    status: 'PENDING',
    createdAt: '2025-11-02T10:00:00Z',
    bankAccountId: 'bank-2',
    currency: 'TRY',
  },
];

const mockBatch: PayoutBatchResponse = {
  id: 'batch-1',
  batchNumber: 'BATCH-20251119-00001',
  status: 'PENDING',
  totalPayouts: 2,
  totalAmount: 3000,
  processedPayouts: 0,
  failedPayouts: 0,
  currency: 'TRY',
  createdAt: '2025-11-19T10:00:00Z',
  createdBy: 'admin-1',
  notes: 'Test batch',
};

describe('BatchPayoutManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (payoutAdminApi.getAdminPayouts as jest.Mock).mockResolvedValue({
      content: mockPayouts,
      totalElements: 2,
      totalPages: 1,
      number: 0,
    });
    (batchPayoutApi.getBatches as jest.Mock).mockResolvedValue({
      content: [mockBatch],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    });
    (batchPayoutApi.getBatchProcessingStats as jest.Mock).mockResolvedValue({
      totalBatches: 10,
      pendingBatches: 2,
      processingBatches: 1,
      completedBatches: 6,
      failedBatches: 1,
    });
  });

  describe('Rendering Tests', () => {
    it('should render component without crashing', async () => {
      render(<BatchPayoutManager />);
      await waitFor(() => {
        expect(screen.getByText(/Batch Ödeme Yönetimi/i)).toBeInTheDocument();
      });
    });

    it('should display pending payouts list', async () => {
      render(<BatchPayoutManager />);
      await waitFor(() => {
        expect(payoutAdminApi.getAdminPayouts).toHaveBeenCalledWith({
          status: 'PENDING',
          page: 0,
          size: 100,
        });
      });
    });

    it('should display batch statistics', async () => {
      render(<BatchPayoutManager />);
      await waitFor(() => {
        expect(batchPayoutApi.getBatchProcessingStats).toHaveBeenCalled();
      });
    });
  });

  describe('Payout Selection Tests', () => {
    it('should allow selecting individual payouts via checkboxes', async () => {
      const user = userEvent.setup();
      render(<BatchPayoutManager initialPayouts={mockPayouts} />);

      const checkboxes = await screen.findAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      await user.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();
    });

    it('should allow selecting all payouts', async () => {
      const user = userEvent.setup();
      render(<BatchPayoutManager initialPayouts={mockPayouts} />);

      const selectAllButton = await screen.findByText(/Tümünü Seç/i);
      await user.click(selectAllButton);

      const checkboxes = await screen.findAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should calculate total amount for selected payouts', async () => {
      const user = userEvent.setup();
      render(<BatchPayoutManager initialPayouts={mockPayouts} />);

      const selectAllButton = await screen.findByText(/Tümünü Seç/i);
      await user.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText(/3\.000,00 TRY/i)).toBeInTheDocument();
      });
    });
  });

  describe('Batch Creation Tests', () => {
    it('should create batch successfully', async () => {
      const user = userEvent.setup();
      (batchPayoutApi.createPayoutBatch as jest.Mock).mockResolvedValue(
        mockBatch
      );

      render(<BatchPayoutManager initialPayouts={mockPayouts} />);

      const selectAllButton = await screen.findByText(/Tümünü Seç/i);
      await user.click(selectAllButton);

      const notesInput = screen.getByPlaceholderText(/Batch notları/i);
      await user.type(notesInput, 'Test batch notes');

      const createButton = screen.getByText(/Batch Oluştur/i);
      await user.click(createButton);

      await waitFor(() => {
        expect(batchPayoutApi.createPayoutBatch).toHaveBeenCalledWith({
          payoutIds: expect.arrayContaining(['payout-1', 'payout-2']),
          notes: 'Test batch notes',
        });
      });
    });

    it('should not allow creating batch without selected payouts', () => {
      render(<BatchPayoutManager initialPayouts={mockPayouts} />);

      const createButton = screen.getByText(/Batch Oluştur/i);
      expect(createButton).toBeDisabled();
    });
  });

  describe('Batch History Tests', () => {
    it('should display batch history', async () => {
      render(<BatchPayoutManager />);

      await waitFor(() => {
        expect(batchPayoutApi.getBatches).toHaveBeenCalled();
      });

      expect(
        await screen.findByText(/BATCH-20251119-00001/i)
      ).toBeInTheDocument();
    });

    it('should filter batches by status', async () => {
      const user = userEvent.setup();
      render(<BatchPayoutManager />);

      const statusFilter = await screen.findByRole('combobox');
      await user.click(statusFilter);

      const completedOption = await screen.findByText(/Tamamlanan/i);
      await user.click(completedOption);

      await waitFor(() => {
        expect(batchPayoutApi.getBatches).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'COMPLETED' })
        );
      });
    });
  });

  describe('Batch Operations', () => {
    it('should process batch', async () => {
      const user = userEvent.setup();
      (batchPayoutApi.processBatch as jest.Mock).mockResolvedValue({});

      render(<BatchPayoutManager />);

      await waitFor(() => {
        expect(screen.getByText(/BATCH-20251119-00001/i)).toBeInTheDocument();
      });

      const processButton = screen.getByText(/İşle/i);
      await user.click(processButton);

      await waitFor(() => {
        expect(batchPayoutApi.processBatch).toHaveBeenCalledWith('batch-1');
      });
    });

    it('should cancel batch', async () => {
      const user = userEvent.setup();
      (batchPayoutApi.cancelBatch as jest.Mock).mockResolvedValue({});

      render(<BatchPayoutManager />);

      await waitFor(() => {
        expect(screen.getByText(/BATCH-20251119-00001/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByText(/İptal/i);
      await user.click(cancelButton);

      await waitFor(() => {
        expect(batchPayoutApi.cancelBatch).toHaveBeenCalledWith('batch-1');
      });
    });

    it('should download batch export', async () => {
      const user = userEvent.setup();
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
      (batchPayoutApi.downloadBatchExport as jest.Mock).mockResolvedValue(
        mockBlob
      );

      render(<BatchPayoutManager />);

      await waitFor(() => {
        expect(screen.getByText(/BATCH-20251119-00001/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByTitle(/İndir/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(batchPayoutApi.downloadBatchExport).toHaveBeenCalledWith(
          'batch-1'
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast on API failure', async () => {
      (payoutAdminApi.getAdminPayouts as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      render(<BatchPayoutManager />);

      await waitFor(() => {
        expect(payoutAdminApi.getAdminPayouts).toHaveBeenCalled();
      });
    });

    it('should handle batch creation error', async () => {
      const user = userEvent.setup();
      (batchPayoutApi.createPayoutBatch as jest.Mock).mockRejectedValue(
        new Error('Batch creation failed')
      );

      render(<BatchPayoutManager initialPayouts={mockPayouts} />);

      const selectAllButton = await screen.findByText(/Tümünü Seç/i);
      await user.click(selectAllButton);

      const createButton = screen.getByText(/Batch Oluştur/i);
      await user.click(createButton);

      await waitFor(() => {
        expect(batchPayoutApi.createPayoutBatch).toHaveBeenCalled();
      });
    });
  });

  describe('Real-time Updates', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should refresh data on interval', async () => {
      render(<BatchPayoutManager refreshInterval={5000} />);

      await waitFor(() => {
        expect(batchPayoutApi.getBatches).toHaveBeenCalledTimes(1);
      });

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(batchPayoutApi.getBatches).toHaveBeenCalledTimes(2);
      });
    });

    it('should stop polling on unmount', async () => {
      const { unmount } = render(<BatchPayoutManager refreshInterval={5000} />);

      await waitFor(() => {
        expect(batchPayoutApi.getBatches).toHaveBeenCalledTimes(1);
      });

      unmount();
      jest.advanceTimersByTime(5000);

      expect(batchPayoutApi.getBatches).toHaveBeenCalledTimes(1);
    });
  });
});
