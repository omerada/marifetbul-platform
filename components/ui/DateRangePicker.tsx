'use client';

/**
 * DateRangePicker Component
 * Reusable date range selection component
 *
 * Features:
 * - Start and end date selection
 * - Validation (end date must be after start date)
 * - Clear functionality
 * - Disabled state support
 * - Accessible labels and ARIA attributes
 * - Responsive design
 *
 * Used in: Job filters, wallet filters, analytics dashboards
 */

import { useState, useEffect } from 'react';
import { Input } from './Input';
import Button from './UnifiedButton';
import { Calendar, X } from 'lucide-react';

export interface DateRangePickerProps {
  /** Start date value (ISO string or Date) */
  startDate?: Date | string | null;

  /** End date value (ISO string or Date) */
  endDate?: Date | string | null;

  /** Callback when dates change */
  onChange: (startDate: Date | null, endDate: Date | null) => void;

  /** Label for start date input */
  startLabel?: string;

  /** Label for end date input */
  endLabel?: string;

  /** Placeholder for start date */
  startPlaceholder?: string;

  /** Placeholder for end date */
  endPlaceholder?: string;

  /** Disabled state */
  disabled?: boolean;

  /** Show clear button */
  showClear?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Minimum date allowed */
  minDate?: Date | string;

  /** Maximum date allowed */
  maxDate?: Date | string;
}

/**
 * Converts Date or ISO string to YYYY-MM-DD format for input[type="date"]
 */
function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Converts YYYY-MM-DD string to Date object
 */
function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export function DateRangePicker({
  startDate: initialStartDate,
  endDate: initialEndDate,
  onChange,
  startLabel = 'Başlangıç Tarihi',
  endLabel = 'Bitiş Tarihi',
  startPlaceholder = 'Başlangıç seç',
  endPlaceholder = 'Bitiş seç',
  disabled = false,
  showClear = true,
  className = '',
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [startValue, setStartValue] = useState(
    toDateInputValue(initialStartDate)
  );
  const [endValue, setEndValue] = useState(toDateInputValue(initialEndDate));
  const [error, setError] = useState<string | null>(null);

  // Update internal state when props change
  useEffect(() => {
    setStartValue(toDateInputValue(initialStartDate));
  }, [initialStartDate]);

  useEffect(() => {
    setEndValue(toDateInputValue(initialEndDate));
  }, [initialEndDate]);

  const validateAndNotify = (
    newStartValue: string,
    newEndValue: string
  ): boolean => {
    const start = fromDateInputValue(newStartValue);
    const end = fromDateInputValue(newEndValue);

    // Clear error if both are empty
    if (!start && !end) {
      setError(null);
      onChange(null, null);
      return true;
    }

    // Validate end date is after start date
    if (start && end && end < start) {
      setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return false;
    }

    setError(null);
    onChange(start, end);
    return true;
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setStartValue(newValue);
    validateAndNotify(newValue, endValue);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEndValue(newValue);
    validateAndNotify(startValue, newValue);
  };

  const handleClear = () => {
    setStartValue('');
    setEndValue('');
    setError(null);
    onChange(null, null);
  };

  const hasValue = startValue || endValue;
  const minDateValue = toDateInputValue(minDate);
  const maxDateValue = toDateInputValue(maxDate);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Start Date */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          <Calendar className="mr-1 inline h-4 w-4" />
          {startLabel}
        </label>
        <div className="relative">
          <Input
            type="date"
            value={startValue}
            onChange={handleStartChange}
            disabled={disabled}
            placeholder={startPlaceholder}
            min={minDateValue}
            max={endValue || maxDateValue}
            className="w-full"
            aria-label={startLabel}
            aria-invalid={!!error}
          />
        </div>
      </div>

      {/* End Date */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          <Calendar className="mr-1 inline h-4 w-4" />
          {endLabel}
        </label>
        <div className="relative">
          <Input
            type="date"
            value={endValue}
            onChange={handleEndChange}
            disabled={disabled}
            placeholder={endPlaceholder}
            min={startValue || minDateValue}
            max={maxDateValue}
            className="w-full"
            aria-label={endLabel}
            aria-invalid={!!error}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Clear Button */}
      {showClear && hasValue && !disabled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="w-full"
        >
          <X className="mr-1.5 h-4 w-4" />
          Temizle
        </Button>
      )}
    </div>
  );
}
