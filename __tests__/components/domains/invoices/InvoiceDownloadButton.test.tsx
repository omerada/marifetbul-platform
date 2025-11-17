import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceDownloadButton } from '@/components/domains/invoices';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('InvoiceDownloadButton', () => {
  const mockOrderId = 'order-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Invoice Availability Check', () => {
    it('should check if invoice is available on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/orders/${mockOrderId}/invoice`)
        );
      });
    });

    it('should show "Not Available" message if invoice does not exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: false }),
      });

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      await waitFor(() => {
        expect(screen.getByText(/Fatura.*Mevcut.*Değil/i)).toBeInTheDocument();
      });
    });

    it('should show download button if invoice is available', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Fatura.*İndir/i })
        ).toBeInTheDocument();
      });
    });

    it('should show loading state during availability check', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      expect(screen.getByText(/Kontrol ediliyor/i)).toBeInTheDocument();
    });
  });

  describe('Invoice Download', () => {
    it('should download PDF on button click', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          blob: async () => mockBlob,
        });

      const mockLink = {
        click: jest.fn(),
        href: '',
        download: '',
        style: { display: '' },
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation();
      const removeChildSpy = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation();

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      const downloadButton = await screen.findByRole('button', {
        name: /Fatura.*İndir/i,
      });

      await act(async () => {
        await userEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockLink.href).toBe('blob:mock-url');
        expect(mockLink.download).toMatch(/invoice-.*\.pdf/);
      });

      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should show loading state during download', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockImplementation(() => new Promise(() => {}));

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      const downloadButton = await screen.findByRole('button', {
        name: /Fatura.*İndir/i,
      });

      await act(async () => {
        await userEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/İndiriliyor/i)).toBeInTheDocument();
      });
    });

    it('should show error toast on download failure', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockRejectedValueOnce(new Error('Download failed'));

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      const downloadButton = await screen.findByRole('button', {
        name: /Fatura.*İndir/i,
      });

      await act(async () => {
        await userEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Hata'),
          expect.any(Object)
        );
      });
    });

    it('should revoke blob URL after download', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          blob: async () => mockBlob,
        });

      const mockLink = {
        click: jest.fn(),
        href: '',
        download: '',
        style: { display: '' },
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation();
      jest.spyOn(document.body, 'removeChild').mockImplementation();

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      const downloadButton = await screen.findByRole('button', {
        name: /Fatura.*İndir/i,
      });

      await act(async () => {
        await userEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(
          'blob:mock-url'
        );
      });
    });
  });

  describe('Invoice Email', () => {
    it('should send invoice via email on email button click', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<InvoiceDownloadButton orderId={mockOrderId} showEmailOption />);

      const emailButton = await screen.findByRole('button', {
        name: /Email.*Gönder/i,
      });

      await act(async () => {
        await userEvent.click(emailButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/orders/${mockOrderId}/invoice/email`),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should show success toast on successful email send', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<InvoiceDownloadButton orderId={mockOrderId} showEmailOption />);

      const emailButton = await screen.findByRole('button', {
        name: /Email.*Gönder/i,
      });

      await act(async () => {
        await userEvent.click(emailButton);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Gönderildi'),
          expect.any(Object)
        );
      });
    });

    it('should show error toast on email send failure', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockRejectedValueOnce(new Error('Email failed'));

      render(<InvoiceDownloadButton orderId={mockOrderId} showEmailOption />);

      const emailButton = await screen.findByRole('button', {
        name: /Email.*Gönder/i,
      });

      await act(async () => {
        await userEvent.click(emailButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Hata'),
          expect.any(Object)
        );
      });
    });

    it('should not show email option when showEmailOption is false', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(
        <InvoiceDownloadButton orderId={mockOrderId} showEmailOption={false} />
      );

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /Email.*Gönder/i })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Button Variants and Sizes', () => {
    it('should apply custom variant', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<InvoiceDownloadButton orderId={mockOrderId} variant="outline" />);

      const button = await screen.findByRole('button', {
        name: /Fatura.*İndir/i,
      });
      expect(button).toHaveClass(/outline/i);
    });

    it('should apply custom size', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<InvoiceDownloadButton orderId={mockOrderId} size="sm" />);

      const button = await screen.findByRole('button', {
        name: /Fatura.*İndir/i,
      });
      expect(button).toHaveClass(/sm/i);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Fatura kontrol.*başarısız/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle 404 errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      await waitFor(() => {
        expect(screen.getByText(/Fatura.*Mevcut.*Değil/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      const button = await screen.findByRole('button');
      expect(button).toHaveAccessibleName();
    });

    it('should be keyboard navigable', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          blob: async () => mockBlob,
        });

      const mockLink = {
        click: jest.fn(),
        href: '',
        download: '',
        style: { display: '' },
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation();
      jest.spyOn(document.body, 'removeChild').mockImplementation();

      render(<InvoiceDownloadButton orderId={mockOrderId} />);

      const button = await screen.findByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      await act(async () => {
        await userEvent.keyboard('{Enter}');
      });

      await waitFor(() => {
        expect(mockLink.click).toHaveBeenCalled();
      });
    });
  });
});
