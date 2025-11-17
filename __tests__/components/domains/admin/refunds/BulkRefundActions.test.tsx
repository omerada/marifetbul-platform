/**
 * ================================================
 * BULK REFUND APPROVAL - INTEGRATION TEST
 * ================================================
 * Tests for admin bulk refund approval functionality
 * Sprint 1 - Story 1.1
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 17, 2025
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BulkApprovalResponse } from '@/types/business/features/refund';

// Mock UI components before imports
jest.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/Textarea', () => ({
  Textarea: ({ value, onChange, ...props }: any) => (
    <textarea value={value} onChange={onChange} {...props} />
  ),
}));

jest.mock('@/components/ui/Label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

import { BulkRefundActions } from '@/components/domains/admin/refunds/BulkRefundActions';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

describe('BulkRefundActions', () => {
  const mockOnBulkApprove = jest.fn();
  const mockOnClearSelection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display selected count', () => {
    render(
      <BulkRefundActions
        selectedCount={5}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText('5 iade talebi seçildi')).toBeInTheDocument();
  });

  it('should show notes input when "Seçilenleri Onayla" clicked', async () => {
    const user = userEvent.setup();

    render(
      <BulkRefundActions
        selectedCount={3}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    const approveButton = screen.getByText('Seçilenleri Onayla');
    await user.click(approveButton);

    expect(screen.getByLabelText(/Toplu Onay Notu/i)).toBeInTheDocument();
  });

  it('should call onBulkApprove with notes', async () => {
    const user = userEvent.setup();
    const mockResponse: BulkApprovalResponse = {
      totalRequested: 3,
      approvedCount: 3,
      failedCount: 0,
      totalAmountApproved: 1500.0,
    };

    mockOnBulkApprove.mockResolvedValue(mockResponse);

    render(
      <BulkRefundActions
        selectedCount={3}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    // Click to show notes input
    await user.click(screen.getByText('Seçilenleri Onayla'));

    // Type notes
    const notesInput = screen.getByLabelText(/Toplu Onay Notu/i);
    await user.type(notesInput, 'Test approval notes');

    // Submit
    await user.click(screen.getByText('Onayı Tamamla'));

    await waitFor(() => {
      expect(mockOnBulkApprove).toHaveBeenCalledWith('Test approval notes');
    });
  });

  it('should call onBulkApprove without notes', async () => {
    const user = userEvent.setup();
    const mockResponse: BulkApprovalResponse = {
      totalRequested: 2,
      approvedCount: 2,
      failedCount: 0,
      totalAmountApproved: 800.0,
    };

    mockOnBulkApprove.mockResolvedValue(mockResponse);

    render(
      <BulkRefundActions
        selectedCount={2}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    await user.click(screen.getByText('Not Eklemeden Onayla'));

    await waitFor(() => {
      expect(mockOnBulkApprove).toHaveBeenCalledWith('');
    });
  });

  it('should show success toast for full success', async () => {
    const user = userEvent.setup();
    const { toast } = require('sonner');
    const mockResponse: BulkApprovalResponse = {
      totalRequested: 5,
      approvedCount: 5,
      failedCount: 0,
      totalAmountApproved: 2500.0,
    };

    mockOnBulkApprove.mockResolvedValue(mockResponse);

    render(
      <BulkRefundActions
        selectedCount={5}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    await user.click(screen.getByText('Not Eklemeden Onayla'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Toplu Onay Başarılı',
        expect.objectContaining({
          description: expect.stringContaining('5 iade talebi onaylandı'),
        })
      );
    });
  });

  it('should show warning toast for partial success', async () => {
    const user = userEvent.setup();
    const { toast } = require('sonner');
    const mockResponse: BulkApprovalResponse = {
      totalRequested: 5,
      approvedCount: 3,
      failedCount: 2,
      totalAmountApproved: 1500.0,
      failedIds: ['ref-1', 'ref-2'],
      errors: [
        {
          refundId: 'ref-1',
          errorMessage: 'Not in PENDING status',
          errorCode: 'INVALID_STATUS',
        },
        {
          refundId: 'ref-2',
          errorMessage: 'Already approved',
          errorCode: 'INVALID_STATUS',
        },
      ],
    };

    mockOnBulkApprove.mockResolvedValue(mockResponse);

    render(
      <BulkRefundActions
        selectedCount={5}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    await user.click(screen.getByText('Not Eklemeden Onayla'));

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        'Kısmi Başarı',
        expect.objectContaining({
          description: '3 onaylandı, 2 başarısız oldu.',
        })
      );
    });
  });

  it('should show error toast for complete failure', async () => {
    const user = userEvent.setup();
    const { toast } = require('sonner');
    const mockResponse: BulkApprovalResponse = {
      totalRequested: 3,
      approvedCount: 0,
      failedCount: 3,
      totalAmountApproved: 0,
    };

    mockOnBulkApprove.mockResolvedValue(mockResponse);

    render(
      <BulkRefundActions
        selectedCount={3}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    await user.click(screen.getByText('Not Eklemeden Onayla'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Toplu Onay Başarısız',
        expect.objectContaining({
          description: '3 iade talebi onaylanamadı.',
        })
      );
    });
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    const { toast } = require('sonner');

    mockOnBulkApprove.mockRejectedValue(new Error('Network error'));

    render(
      <BulkRefundActions
        selectedCount={2}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    await user.click(screen.getByText('Not Eklemeden Onayla'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Hata',
        expect.objectContaining({
          description: expect.stringContaining(
            'Toplu onaylama sırasında bir hata oluştu'
          ),
        })
      );
    });
  });

  it('should clear selection when clear button clicked', async () => {
    const user = userEvent.setup();

    render(
      <BulkRefundActions
        selectedCount={4}
        onBulkApprove={mockOnBulkApprove}
        onClearSelection={mockOnClearSelection}
      />
    );

    await user.click(screen.getByText('Seçimi Temizle'));

    expect(mockOnClearSelection).toHaveBeenCalled();
  });
});
