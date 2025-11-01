/**
 * ================================================
 * REQUEST REVISION BUTTON - UNIT TESTS
 * ================================================
 * Test suite for RequestRevisionButton component
 *
 * Sprint 6: Test Coverage Improvement - Story 6
 * Test Coverage: Component rendering, form validation, API integration, error handling
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since 2025-01-30
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RequestRevisionButton } from '@/components/domains/orders/RequestRevisionButton';
import { orderApi } from '@/lib/api/orders';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/api/orders', () => ({
  orderApi: {
    requestRevision: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe('RequestRevisionButton', () => {
  const mockProps = {
    orderId: 'test-order-id',
    orderTitle: 'Test Order Title',
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // Component Rendering Tests
  // ========================================

  it('should render revision button', () => {
    render(<RequestRevisionButton {...mockProps} />);

    const button = screen.getByRole('button', { name: /Revizyon İste/i });
    expect(button).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    render(<RequestRevisionButton {...mockProps} />);

    const button = screen.getByRole('button', { name: /Revizyon İste/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Revizyon Talebi')).toBeInTheDocument();
    });
    expect(screen.getByText(mockProps.orderTitle)).toBeInTheDocument();
  });

  it('should display order information in dialog', async () => {
    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      expect(screen.getByText(mockProps.orderTitle)).toBeInTheDocument();
    });
  });

  // ========================================
  // Form Validation Tests
  // ========================================

  it('should show validation error for too short reason', async () => {
    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      fireEvent.change(textarea, { target: { value: 'Too short' } });
    });

    const submitButton = screen.getByRole('button', {
      name: /Revizyon Talebi Gönder/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/en az 20 karakter/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for too long reason', async () => {
    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      const longText = 'a'.repeat(1001);
      fireEvent.change(textarea, { target: { value: longText } });
    });

    const submitButton = screen.getByRole('button', {
      name: /Revizyon Talebi Gönder/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/en fazla 1000 karakter/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // API Integration Tests
  // ========================================

  it('should call API with correct parameters on successful submission', async () => {
    (orderApi.requestRevision as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      const validReason =
        'This is a valid reason for requesting revision with enough characters';
      fireEvent.change(textarea, { target: { value: validReason } });
    });

    const submitButton = screen.getByRole('button', {
      name: /Revizyon Talebi Gönder/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(orderApi.requestRevision).toHaveBeenCalledWith(mockProps.orderId, {
        revisionNote:
          'This is a valid reason for requesting revision with enough characters',
      });
    });
  });

  it('should show success toast on successful submission', async () => {
    (orderApi.requestRevision as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      fireEvent.change(textarea, {
        target: { value: 'Valid reason for revision with enough characters' },
      });
    });

    const submitButton = screen.getByRole('button', {
      name: /Revizyon Talebi Gönder/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Revizyon talebi gönderildi',
        expect.objectContaining({
          description: expect.any(String),
        })
      );
    });
  });

  it('should call onSuccess callback after successful submission', async () => {
    (orderApi.requestRevision as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      fireEvent.change(textarea, {
        target: { value: 'Valid reason for revision with enough characters' },
      });
    });

    const submitButton = screen.getByRole('button', {
      name: /Revizyon Talebi Gönder/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });

  // ========================================
  // Error Handling Tests
  // ========================================

  it('should show error toast when API returns failure', async () => {
    const errorMessage = 'Revizyon talebi gönderilemedi';
    (orderApi.requestRevision as jest.Mock).mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      fireEvent.change(textarea, {
        target: { value: 'Valid reason for revision with enough characters' },
      });
    });

    const submitButton = screen.getByRole('button', {
      name: /Revizyon Talebi Gönder/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'İşlem başarısız',
        expect.objectContaining({
          description: errorMessage,
        })
      );
    });
  });

  it('should show error toast when API throws exception', async () => {
    (orderApi.requestRevision as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      fireEvent.change(textarea, {
        target: { value: 'Valid reason for revision with enough characters' },
      });
    });

    const submitButton = screen.getByRole('button', {
      name: /Revizyon Talebi Gönder/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'İşlem başarısız',
        expect.objectContaining({
          description: 'Network error',
        })
      );
    });
  });

  // ========================================
  // Dialog Management Tests
  // ========================================

  it('should close dialog and reset form on cancel', async () => {
    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      fireEvent.change(textarea, { target: { value: 'Some text' } });
    });

    const cancelButton = screen.getByRole('button', { name: /İptal/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Revizyon Talebi')).not.toBeInTheDocument();
    });
  });

  it('should close dialog after successful submission', async () => {
    (orderApi.requestRevision as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<RequestRevisionButton {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Revizyon İste/i }));

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Örnek: Logo tasarımında/i);
      fireEvent.change(textarea, {
        target: { value: 'Valid reason for revision with enough characters' },
      });
    });

    const submitButton = screen.getByRole('button', {
      name: /Revizyon Talebi Gönder/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Revizyon Talebi')).not.toBeInTheDocument();
    });
  });
});
