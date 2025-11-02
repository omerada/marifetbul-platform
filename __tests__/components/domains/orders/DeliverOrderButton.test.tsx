/**
 * ================================================
 * DELIVER ORDER BUTTON - UNIT TESTS
 * ================================================
 * Test suite for DeliverOrderButton component
 *
 * Sprint 3: Order Delivery & Acceptance Flow - Enhanced Coverage
 * Test Coverage: Component rendering, user interactions, validation,
 *               file handling, API integration, error states
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 3: Enhanced Test Coverage
 * @since 2025-10-30
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { DeliverOrderButton } from '@/components/domains/orders/DeliverOrderButton';
import { orderApi } from '@/lib/api/orders';
import { uploadMultipleFiles } from '@/lib/services/fileUploadService';

// Mock dependencies
jest.mock('sonner');
jest.mock('@/lib/api/orders');
jest.mock('@/lib/services/fileUploadService');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe('DeliverOrderButton', () => {
  const mockProps = {
    orderId: 'test-order-123',
    orderTitle: 'Test Project: Logo Design',
    onDelivered: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================================================
  // RENDERING TESTS
  // ================================================

  describe('Rendering', () => {
    it('should render the delivery button with correct text', () => {
      render(<DeliverOrderButton {...mockProps} />);
      const button = screen.getByRole('button', {
        name: /siparişi teslim et/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('w-full');
    });

    it('should render disabled button when disabled prop is true', () => {
      render(<DeliverOrderButton {...mockProps} disabled />);
      const button = screen.getByRole('button', {
        name: /siparişi teslim et/i,
      });
      expect(button).toBeDisabled();
    });

    it('should apply custom className', () => {
      render(<DeliverOrderButton {...mockProps} className="custom-class" />);
      const button = screen.getByRole('button', {
        name: /siparişi teslim et/i,
      });
      expect(button).toHaveClass('custom-class');
    });
  });

  // ================================================
  // MODAL INTERACTION TESTS
  // ================================================

  describe('Modal Interactions', () => {
    it('should open modal when button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      const triggerButton = screen.getByRole('button', {
        name: /siparişi teslim et/i,
      });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Sipariş Teslimi')).toBeInTheDocument();
      });
    });

    it('should display order information in modal', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );

      await waitFor(() => {
        expect(screen.getByText(mockProps.orderTitle)).toBeInTheDocument();
        expect(screen.getByText(/test-order/i)).toBeInTheDocument();
      });
    });

    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const cancelButton = screen.getByRole('button', { name: /iptal/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ================================================
  // FORM VALIDATION TESTS
  // ================================================

  describe('Form Validation', () => {
    it('should show error when notes are too short (< 20 characters)', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const notesTextarea = screen.getByPlaceholderText(
        /teslim ettiğiniz dosyaları/i
      );
      await user.type(notesTextarea, 'Short note');

      const submitButton = screen.getByRole('button', {
        name: /teslimi gönder/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/en az 20 karakter olmalıdır/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error when notes exceed 1000 characters', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const notesTextarea = screen.getByPlaceholderText(
        /teslim ettiğiniz dosyaları/i
      );
      const longText = 'a'.repeat(1001);
      await user.type(notesTextarea, longText);

      const submitButton = screen.getByRole('button', {
        name: /teslimi gönder/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/en fazla 1000 karakter olabilir/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error toast when no files are uploaded', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const notesTextarea = screen.getByPlaceholderText(
        /teslim ettiğiniz dosyaları/i
      );
      await user.type(
        notesTextarea,
        'Valid notes with at least 20 characters here'
      );

      const submitButton = screen.getByRole('button', {
        name: /teslimi gönder/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Lütfen en az bir teslim dosyası yükleyin'
        );
      });
    });
  });

  // ================================================
  // FILE UPLOAD TESTS
  // ================================================

  describe('File Upload', () => {
    it('should display uploaded files', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      // Simulate file upload
      const file = new File(['test content'], 'test-file.pdf', {
        type: 'application/pdf',
      });
      const fileInput = screen.getByLabelText(/teslim dosyaları/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
      });
    });

    it('should remove file when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      // Upload file
      const file = new File(['test content'], 'test-file.pdf', {
        type: 'application/pdf',
      });
      const fileInput = screen.getByLabelText(/teslim dosyaları/i);
      await user.upload(fileInput, file);

      await waitFor(() => screen.getByText('test-file.pdf'));

      // Remove file
      const removeButton = screen.getByLabelText(/dosyayı kaldır/i);
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('test-file.pdf')).not.toBeInTheDocument();
      });
    });

    it('should enforce maximum file limit (10 files)', async () => {
      const user = userEvent.setup();
      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const files = Array.from(
        { length: 11 },
        (_, i) =>
          new File([`content ${i}`], `file-${i}.pdf`, {
            type: 'application/pdf',
          })
      );

      const fileInput = screen.getByLabelText(/teslim dosyaları/i);
      await user.upload(fileInput, files);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'En fazla 10 dosya yükleyebilirsiniz'
        );
      });
    });
  });

  // ================================================
  // API INTEGRATION TESTS
  // ================================================

  describe('API Integration', () => {
    it('should successfully submit delivery with files and notes', async () => {
      const user = userEvent.setup();

      // Mock successful file upload
      (uploadMultipleFiles as jest.Mock).mockResolvedValue([
        { success: true, url: 'https://cloudinary.com/file1.pdf' },
      ]);

      // Mock successful API call
      (orderApi.submitDelivery as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<DeliverOrderButton {...mockProps} />);

      // Open modal
      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      // Upload file
      const file = new File(['test content'], 'deliverable.pdf', {
        type: 'application/pdf',
      });
      const fileInput = screen.getByLabelText(/teslim dosyaları/i);
      await user.upload(fileInput, file);

      // Fill notes
      const notesTextarea = screen.getByPlaceholderText(
        /teslim ettiğiniz dosyaları/i
      );
      await user.type(
        notesTextarea,
        'Here are the completed deliverables for your project'
      );

      // Submit
      const submitButton = screen.getByRole('button', {
        name: /teslimi gönder/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(uploadMultipleFiles).toHaveBeenCalledWith(
          expect.arrayContaining([expect.any(File)]),
          expect.any(Function),
          expect.any(Function)
        );
        expect(orderApi.submitDelivery).toHaveBeenCalledWith(
          mockProps.orderId,
          {
            deliverables: expect.any(String),
            deliveryNote: expect.any(String),
            attachments: ['https://cloudinary.com/file1.pdf'],
          }
        );
        expect(toast.success).toHaveBeenCalledWith(
          'Sipariş Teslim Edildi! 🎉',
          expect.any(Object)
        );
        expect(mockProps.onDelivered).toHaveBeenCalled();
      });
    });

    it('should handle file upload failure', async () => {
      const user = userEvent.setup();

      // Mock failed file upload
      (uploadMultipleFiles as jest.Mock).mockResolvedValue([
        { success: false, error: 'Upload failed' },
      ]);

      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const file = new File(['test'], 'file.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/teslim dosyaları/i);
      await user.upload(fileInput, file);

      const notesTextarea = screen.getByPlaceholderText(
        /teslim ettiğiniz dosyaları/i
      );
      await user.type(
        notesTextarea,
        'Valid delivery notes with sufficient length'
      );

      const submitButton = screen.getByRole('button', {
        name: /teslimi gönder/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Dosya yükleme hatası',
          expect.objectContaining({
            description: expect.stringContaining('yüklenemedi'),
          })
        );
        expect(orderApi.submitDelivery).not.toHaveBeenCalled();
      });
    });

    it('should handle API submission error', async () => {
      const user = userEvent.setup();

      (uploadMultipleFiles as jest.Mock).mockResolvedValue([
        { success: true, url: 'https://cloudinary.com/file.pdf' },
      ]);

      (orderApi.submitDelivery as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Submission failed',
      });

      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const file = new File(['test'], 'file.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/teslim dosyaları/i);
      await user.upload(fileInput, file);

      const notesTextarea = screen.getByPlaceholderText(
        /teslim ettiğiniz dosyaları/i
      );
      await user.type(
        notesTextarea,
        'Valid delivery notes here with enough characters'
      );

      const submitButton = screen.getByRole('button', {
        name: /teslimi gönder/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Teslim Başarısız',
          expect.any(Object)
        );
      });
    });
  });

  // ================================================
  // LOADING STATE TESTS
  // ================================================

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      (uploadMultipleFiles as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ success: true, url: 'test.pdf' }]), 100)
          )
      );

      (orderApi.submitDelivery as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const file = new File(['test'], 'file.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/teslim dosyaları/i);
      await user.upload(fileInput, file);

      const notesTextarea = screen.getByPlaceholderText(
        /teslim ettiğiniz dosyaları/i
      );
      await user.type(
        notesTextarea,
        'Valid notes with minimum required length'
      );

      const submitButton = screen.getByRole('button', {
        name: /teslimi gönder/i,
      });
      await user.click(submitButton);

      // Should show upload progress
      await waitFor(() => {
        expect(screen.getByText(/dosyalar yükleniyor/i)).toBeInTheDocument();
      });
    });

    it('should disable buttons during submission', async () => {
      const user = userEvent.setup();

      (uploadMultipleFiles as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([{ success: true, url: 'test.pdf' }]), 100)
          )
      );

      render(<DeliverOrderButton {...mockProps} />);

      await user.click(
        screen.getByRole('button', { name: /siparişi teslim et/i })
      );
      await waitFor(() => screen.getByRole('dialog'));

      const file = new File(['test'], 'file.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/teslim dosyaları/i);
      await user.upload(fileInput, file);

      const notesTextarea = screen.getByPlaceholderText(
        /teslim ettiğiniz dosyaları/i
      );
      await user.type(
        notesTextarea,
        'Valid delivery notes for testing purposes'
      );

      const submitButton = screen.getByRole('button', {
        name: /teslimi gönder/i,
      });
      await user.click(submitButton);

      // Buttons should be disabled
      const cancelButton = screen.getByRole('button', { name: /iptal/i });
      expect(cancelButton).toBeDisabled();
    });
  });
});
