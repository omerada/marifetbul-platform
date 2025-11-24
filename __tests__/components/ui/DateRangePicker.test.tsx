/**
 * DateRangePicker Component Tests
 * Sprint 5 - Story 5.3
 *
 * NOTE: Uses mocked dependencies to avoid lucide-react ESM issues
 * Run E2E tests (advanced-job-search.spec.ts) for integration testing
 */

// Mock dependencies BEFORE any imports
jest.mock('lucide-react', () => ({
  Calendar: ({ className }: any) => (
    <svg data-testid="calendar-icon" className={className} />
  ),
  X: ({ className }: any) => <svg data-testid="x-icon" className={className} />,
}));

jest.mock('../../../components/ui/UnifiedButton', () => ({
  __esModule: true,
  default: ({ children, onClick, className, variant, size }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../../components/ui/Input', () => ({
  Input: ({ type, value, onChange, disabled, className, ...props }: any) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    />
  ),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DateRangePicker } from '../../../components/ui/DateRangePicker';

describe('DateRangePicker', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with default labels', () => {
    render(<DateRangePicker onChange={mockOnChange} />);

    expect(screen.getByLabelText('Başlangıç Tarihi')).toBeInTheDocument();
    expect(screen.getByLabelText('Bitiş Tarihi')).toBeInTheDocument();
  });

  it('should render with custom labels', () => {
    render(
      <DateRangePicker
        onChange={mockOnChange}
        startLabel="Start Date"
        endLabel="End Date"
      />
    );

    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('should call onChange when start date changes', async () => {
    render(<DateRangePicker onChange={mockOnChange} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '2025-11-01' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(expect.any(Date), null);
    });
  });

  it('should call onChange when end date changes', async () => {
    render(<DateRangePicker onChange={mockOnChange} />);

    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;
    fireEvent.change(endInput, { target: { value: '2025-12-01' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(null, expect.any(Date));
    });
  });

  it('should show error when end date is before start date', async () => {
    render(<DateRangePicker onChange={mockOnChange} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2025-12-01' } });
    fireEvent.change(endInput, { target: { value: '2025-11-01' } });

    await waitFor(() => {
      expect(
        screen.getByText('Bitiş tarihi başlangıç tarihinden sonra olmalıdır')
      ).toBeInTheDocument();
    });
  });

  it('should not show error when dates are valid', async () => {
    render(<DateRangePicker onChange={mockOnChange} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2025-11-01' } });
    fireEvent.change(endInput, { target: { value: '2025-12-01' } });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('should display clear button when dates are set', async () => {
    render(<DateRangePicker onChange={mockOnChange} showClear={true} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '2025-11-01' } });

    await waitFor(() => {
      expect(screen.getByText('Temizle')).toBeInTheDocument();
    });
  });

  it('should not display clear button when showClear is false', async () => {
    render(<DateRangePicker onChange={mockOnChange} showClear={false} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '2025-11-01' } });

    await waitFor(() => {
      expect(screen.queryByText('Temizle')).not.toBeInTheDocument();
    });
  });

  it('should clear dates when clear button is clicked', async () => {
    render(<DateRangePicker onChange={mockOnChange} showClear={true} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    // Set dates
    fireEvent.change(startInput, { target: { value: '2025-11-01' } });
    fireEvent.change(endInput, { target: { value: '2025-12-01' } });

    await waitFor(() => {
      expect(screen.getByText('Temizle')).toBeInTheDocument();
    });

    // Click clear
    const clearButton = screen.getByText('Temizle');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(startInput.value).toBe('');
      expect(endInput.value).toBe('');
      expect(mockOnChange).toHaveBeenCalledWith(null, null);
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(<DateRangePicker onChange={mockOnChange} disabled={true} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    expect(startInput).toBeDisabled();
    expect(endInput).toBeDisabled();
  });

  it('should initialize with provided dates', () => {
    const startDate = new Date('2025-11-01');
    const endDate = new Date('2025-12-01');

    render(
      <DateRangePicker
        onChange={mockOnChange}
        startDate={startDate}
        endDate={endDate}
      />
    );

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    expect(startInput.value).toBe('2025-11-01');
    expect(endInput.value).toBe('2025-12-01');
  });

  it('should handle ISO string dates', () => {
    const startDate = '2025-11-01T00:00:00.000Z';
    const endDate = '2025-12-01T00:00:00.000Z';

    render(
      <DateRangePicker
        onChange={mockOnChange}
        startDate={startDate}
        endDate={endDate}
      />
    );

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    expect(startInput.value).toBe('2025-11-01');
    expect(endInput.value).toBe('2025-12-01');
  });

  it('should respect minDate constraint', () => {
    const minDate = new Date('2025-11-01');

    render(<DateRangePicker onChange={mockOnChange} minDate={minDate} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;

    expect(startInput.getAttribute('min')).toBe('2025-11-01');
  });

  it('should respect maxDate constraint', () => {
    const maxDate = new Date('2025-12-31');

    render(<DateRangePicker onChange={mockOnChange} maxDate={maxDate} />);

    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    expect(endInput.getAttribute('max')).toBe('2025-12-31');
  });

  it('should update when props change', async () => {
    const { rerender } = render(
      <DateRangePicker
        onChange={mockOnChange}
        startDate={null}
        endDate={null}
      />
    );

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    expect(startInput.value).toBe('');

    // Update props
    rerender(
      <DateRangePicker
        onChange={mockOnChange}
        startDate={new Date('2025-11-15')}
        endDate={new Date('2025-12-15')}
      />
    );

    await waitFor(() => {
      expect(startInput.value).toBe('2025-11-15');
    });
  });

  it('should set end date min to start date value', async () => {
    render(<DateRangePicker onChange={mockOnChange} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: '2025-11-15' } });

    await waitFor(() => {
      expect(endInput.getAttribute('min')).toBe('2025-11-15');
    });
  });

  it('should set start date max to end date value', async () => {
    render(<DateRangePicker onChange={mockOnChange} />);

    const startInput = screen.getByLabelText(
      'Başlangıç Tarihi'
    ) as HTMLInputElement;
    const endInput = screen.getByLabelText('Bitiş Tarihi') as HTMLInputElement;

    fireEvent.change(endInput, { target: { value: '2025-12-15' } });

    await waitFor(() => {
      expect(startInput.getAttribute('max')).toBe('2025-12-15');
    });
  });
});
