/**
 * ================================================
 * PAYMENT MODE SELECTOR - UNIT TESTS
 * ================================================
 * SPRINT 1 - Epic 1 - Story 1.1
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentModeSelector, getPaymentModeLabel, getPaymentModeDescription } from '../PaymentModeSelector';

describe('PaymentModeSelector', () => {
  const mockOnModeChange = jest.fn();

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  it('renders both payment options', () => {
    render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('Güvenli Ödeme (Escrow)')).toBeInTheDocument();
    expect(screen.getByText('IBAN ile Ödeme')).toBeInTheDocument();
  });

  it('shows selected mode correctly', () => {
    const { rerender } = render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
      />
    );

    const escrowButton = screen.getByLabelText('Güvenli Ödeme (Escrow) seç');
    expect(escrowButton).toHaveAttribute('aria-pressed', 'true');

    rerender(
      <PaymentModeSelector
        selectedMode="MANUAL_IBAN"
        onModeChange={mockOnModeChange}
      />
    );

    const ibanButton = screen.getByLabelText('IBAN ile Ödeme seç');
    expect(ibanButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onModeChange when clicking an option', () => {
    render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
      />
    );

    const ibanButton = screen.getByLabelText('IBAN ile Ödeme seç');
    fireEvent.click(ibanButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('MANUAL_IBAN');
    expect(mockOnModeChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onModeChange when disabled', () => {
    render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
        disabled
      />
    );

    const ibanButton = screen.getByLabelText('IBAN ile Ödeme seç');
    fireEvent.click(ibanButton);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('shows platform fees when showFees is true', () => {
    render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
        showFees
      />
    );

    expect(screen.getByText('%5 + KDV')).toBeInTheDocument();
    expect(screen.getByText('Platform ücreti yok')).toBeInTheDocument();
  });

  it('hides platform fees when showFees is false', () => {
    render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
        showFees={false}
      />
    );

    expect(screen.queryByText('%5 + KDV')).not.toBeInTheDocument();
    expect(screen.queryByText('Platform ücreti yok')).not.toBeInTheDocument();
  });

  it('shows recommended badge for escrow option', () => {
    render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByText('Önerilen')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('is keyboard accessible', () => {
    render(
      <PaymentModeSelector
        selectedMode="ESCROW_PROTECTED"
        onModeChange={mockOnModeChange}
      />
    );

    const escrowButton = screen.getByLabelText('Güvenli Ödeme (Escrow) seç');
    const ibanButton = screen.getByLabelText('IBAN ile Ödeme seç');

    expect(escrowButton).toHaveAttribute('type', 'button');
    expect(ibanButton).toHaveAttribute('type', 'button');
  });
});

describe('Helper Functions', () => {
  describe('getPaymentModeLabel', () => {
    it('returns correct label for ESCROW_PROTECTED', () => {
      expect(getPaymentModeLabel('ESCROW_PROTECTED')).toBe(
        'Güvenli Ödeme (Escrow)'
      );
    });

    it('returns correct label for MANUAL_IBAN', () => {
      expect(getPaymentModeLabel('MANUAL_IBAN')).toBe('IBAN ile Ödeme');
    });
  });

  describe('getPaymentModeDescription', () => {
    it('returns correct description for ESCROW_PROTECTED', () => {
      expect(getPaymentModeDescription('ESCROW_PROTECTED')).toBe(
        'Platform garantili, güvenli online ödeme'
      );
    });

    it('returns correct description for MANUAL_IBAN', () => {
      expect(getPaymentModeDescription('MANUAL_IBAN')).toBe(
        "Doğrudan freelancer'a banka transferi"
      );
    });
  });
});
