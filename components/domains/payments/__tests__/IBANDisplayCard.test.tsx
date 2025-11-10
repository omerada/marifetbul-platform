/**
 * ================================================
 * IBAN DISPLAY CARD TESTS
 * ================================================
 * Unit tests for IBANDisplayCard component
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Epic 2
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IBANDisplayCard } from '../IBANDisplayCard';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('IBANDisplayCard', () => {
  const defaultProps = {
    orderId: 'order-123456789',
    amount: 1000,
    currency: 'TRY',
  };

  beforeEach(() => {
    mockWriteText.mockClear();
    mockWriteText.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders card with header', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      expect(screen.getByText(/Banka Havalesi Bilgileri/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Aşağıdaki hesaba ödemenizi yapınız/i)
      ).toBeInTheDocument();
    });

    it('displays amount correctly formatted', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      expect(screen.getByText(/1\.000,00 TRY/i)).toBeInTheDocument();
    });

    it('displays platform IBAN', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      const ibanInput = screen.getByDisplayValue(
        /TR33 0006 1005 1978 6457 8413 26/i
      );
      expect(ibanInput).toBeInTheDocument();
      expect(ibanInput).toHaveAttribute('readonly');
    });

    it('displays account holder name', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      expect(
        screen.getByDisplayValue(/MarifetBul Teknoloji A\.Ş\./i)
      ).toBeInTheDocument();
    });

    it('displays bank name', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      expect(screen.getByDisplayValue(/Garanti BBVA/i)).toBeInTheDocument();
    });

    it('generates and displays reference number', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      // Reference should be last 8 chars of order ID in uppercase
      expect(screen.getByDisplayValue(/56789/i)).toBeInTheDocument();
    });

    it('displays important instructions', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      expect(
        screen.getByText(/Havale\/EFT işleminizi yaptıktan sonra/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Referans numarasını mutlaka havale açıklamasına/i)
      ).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('copies IBAN to clipboard when copy button clicked', async () => {
      const user = userEvent.setup();
      render(<IBANDisplayCard {...defaultProps} />);

      const copyButtons = screen.getAllByRole('button', { name: /Kopyala/i });
      const ibanCopyButton = copyButtons[0]; // First copy button is for IBAN

      await user.click(ibanCopyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('TR330006100519786457841326'); // Without spaces
      });

      // Should show "Kopyalandı" feedback
      expect(screen.getByText(/Kopyalandı/i)).toBeInTheDocument();
    });

    it('copies reference number to clipboard', async () => {
      const user = userEvent.setup();
      render(<IBANDisplayCard {...defaultProps} />);

      const copyButtons = screen.getAllByRole('button');
      const referenceCopyButton = copyButtons[1]; // Second copy button

      await user.click(referenceCopyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(expect.stringMatching(/56789/i));
      });
    });

    it('copies all information when "Tüm Bilgileri Kopyala" clicked', async () => {
      const user = userEvent.setup();
      render(<IBANDisplayCard {...defaultProps} />);

      const copyAllButton = screen.getByRole('button', {
        name: /Tüm Bilgileri Kopyala/i,
      });

      await user.click(copyAllButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
        const copiedText = mockWriteText.mock.calls[0][0];
        expect(copiedText).toContain('TR330006100519786457841326');
        expect(copiedText).toContain('MarifetBul Teknoloji A.Ş.');
        expect(copiedText).toContain('Garanti BBVA');
        expect(copiedText).toContain('1.000,00 TRY');
      });
    });

    it('shows success feedback temporarily after copy', async () => {
      const user = userEvent.setup();
      jest.useFakeTimers();
      render(<IBANDisplayCard {...defaultProps} />);

      const copyButtons = screen.getAllByRole('button', { name: /Kopyala/i });
      await user.click(copyButtons[0]);

      // Should show success
      expect(screen.getByText(/Kopyalandı/i)).toBeInTheDocument();

      // Fast-forward time
      jest.advanceTimersByTime(2000);

      // Should revert to "Kopyala"
      await waitFor(() => {
        expect(screen.queryByText(/Kopyalandı/i)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('calls onCopy callback when copy action performed', async () => {
      const user = userEvent.setup();
      const onCopy = jest.fn();
      render(<IBANDisplayCard {...defaultProps} onCopy={onCopy} />);

      const copyButtons = screen.getAllByRole('button', { name: /Kopyala/i });
      await user.click(copyButtons[0]);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalled();
      });
    });
  });

  describe('Custom Instructions', () => {
    it('displays custom instructions when provided', () => {
      const customInstructions = 'Bu özel bir talimattır';
      render(
        <IBANDisplayCard
          {...defaultProps}
          customInstructions={customInstructions}
        />
      );

      expect(screen.getByText(customInstructions)).toBeInTheDocument();
    });

    it('does not show custom instructions section when not provided', () => {
      const { container } = render(<IBANDisplayCard {...defaultProps} />);
      const customSection = container.querySelector(
        '.rounded-lg.bg-gray-50.border-gray-200 p-4'
      );
      expect(customSection).not.toBeInTheDocument();
    });
  });

  describe('Amount Formatting', () => {
    it('formats Turkish Lira correctly', () => {
      render(<IBANDisplayCard orderId="test" amount={1234.56} currency="TRY" />);
      expect(screen.getByText(/1\.234,56 TRY/i)).toBeInTheDocument();
    });

    it('formats large amounts with thousand separators', () => {
      render(<IBANDisplayCard orderId="test" amount={1000000} currency="TRY" />);
      expect(screen.getByText(/1\.000\.000,00 TRY/i)).toBeInTheDocument();
    });

    it('displays warning for exact amount', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      expect(
        screen.getByText(/Lütfen tam bu tutarı gönderin/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for copy buttons', () => {
      render(<IBANDisplayCard {...defaultProps} />);

      expect(screen.getByLabelText(/IBAN'ı kopyala/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Referans numarasını kopyala/i)
      ).toBeInTheDocument();
    });

    it('all inputs are readonly', () => {
      render(<IBANDisplayCard {...defaultProps} />);
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('readonly');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing currency gracefully (defaults to TRY)', () => {
      render(<IBANDisplayCard orderId="test" amount={100} />);
      expect(screen.getByText(/100,00 TRY/i)).toBeInTheDocument();
    });

    it('generates reference from short order IDs', () => {
      render(<IBANDisplayCard orderId="123" amount={100} />);
      expect(screen.getByDisplayValue(/123/i)).toBeInTheDocument();
    });

    it('handles clipboard API failure gracefully', async () => {
      const user = userEvent.setup();
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard access denied'));

      render(<IBANDisplayCard {...defaultProps} />);

      const copyButtons = screen.getAllByRole('button', { name: /Kopyala/i });
      await user.click(copyButtons[0]);

      // Should not crash, but also should not show success
      await waitFor(() => {
        expect(screen.queryByText(/Kopyalandı/i)).not.toBeInTheDocument();
      });
    });
  });
});
