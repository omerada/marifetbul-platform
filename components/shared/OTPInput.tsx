'use client';

/**
 * OTP Input Component
 * Sprint 1 - Story 1.3: Phone Verification (OTP)
 *
 * Production-ready OTP input with auto-focus and paste support
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import {
  useRef,
  useState,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from 'react';
import { cn } from '@/lib/utils';

export interface OTPInputProps {
  /** Number of OTP digits (default: 6) */
  length?: number;

  /** Value controlled from parent */
  value?: string;

  /** Change handler */
  onChange?: (value: string) => void;

  /** Complete handler (called when all digits filled) */
  onComplete?: (value: string) => void;

  /** Auto-focus first input on mount */
  autoFocus?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Error state */
  error?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Input type (numeric or alphanumeric) */
  type?: 'numeric' | 'alphanumeric';

  /** Custom className */
  className?: string;
}

/**
 * OTP Input Component with auto-focus and paste support
 */
export function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  autoFocus = true,
  disabled = false,
  error = false,
  loading = false,
  type = 'numeric',
  className = '',
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * Initialize refs array
   */
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  /**
   * Sync internal state with external value
   */
  useEffect(() => {
    if (value !== undefined) {
      const digits = value.split('').slice(0, length);
      const paddedDigits = [
        ...digits,
        ...Array(length - digits.length).fill(''),
      ];
      setOtp(paddedDigits);
    }
  }, [value, length]);

  /**
   * Auto-focus first input
   */
  useEffect(() => {
    if (autoFocus && !disabled && !loading) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled, loading]);

  /**
   * Validate input character based on type
   */
  const isValidChar = (char: string): boolean => {
    if (type === 'numeric') {
      return /^\d$/.test(char);
    }
    return /^[a-zA-Z0-9]$/.test(char);
  };

  /**
   * Handle input change
   */
  const handleChange = (index: number, char: string) => {
    if (disabled || loading) return;

    // Filter out invalid characters
    const validChar = char.split('').find(isValidChar) || '';

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = validChar;
    setOtp(newOtp);

    // Notify parent
    const otpString = newOtp.join('');
    onChange?.(otpString);

    // Auto-focus next input
    if (validChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (
      validChar &&
      index === length - 1 &&
      newOtp.every((digit) => digit !== '')
    ) {
      onComplete?.(otpString);
    }
  };

  /**
   * Handle key down events
   */
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || loading) return;

    // Backspace: Clear current and move to previous
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (otp[index]) {
        // Clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous and clear
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Delete: Clear current
    if (e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange?.(newOtp.join(''));
    }

    // Arrow Left: Move to previous
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow Right: Move to next
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    // Home: Focus first input
    if (e.key === 'Home') {
      e.preventDefault();
      inputRefs.current[0]?.focus();
    }

    // End: Focus last input
    if (e.key === 'End') {
      e.preventDefault();
      inputRefs.current[length - 1]?.focus();
    }
  };

  /**
   * Handle paste event
   */
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (disabled || loading) return;

    const pastedData = e.clipboardData.getData('text/plain');
    const pastedChars = pastedData
      .split('')
      .filter(isValidChar)
      .slice(0, length);

    if (pastedChars.length > 0) {
      const newOtp = Array(length).fill('');
      pastedChars.forEach((char, i) => {
        newOtp[i] = char;
      });

      setOtp(newOtp);
      onChange?.(newOtp.join(''));

      // Focus last filled input or first empty
      const lastFilledIndex = pastedChars.length - 1;
      const focusIndex = Math.min(lastFilledIndex, length - 1);
      inputRefs.current[focusIndex]?.focus();

      // Check if complete
      if (pastedChars.length === length) {
        onComplete?.(pastedChars.join(''));
      }
    }
  };

  /**
   * Handle input focus
   */
  const handleFocus = (index: number) => {
    // Select all on focus for easy replacement
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode={type === 'numeric' ? 'numeric' : 'text'}
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled || loading}
          className={cn(
            'h-12 w-12 rounded-lg border-2 text-center text-lg font-semibold transition-all',
            'focus:ring-2 focus:ring-offset-2 focus:outline-none',

            // Normal state
            !error &&
              !disabled &&
              'border-gray-300 focus:border-blue-500 focus:ring-blue-500',

            // Filled state
            !error && !disabled && digit && 'border-blue-500 bg-blue-50',

            // Error state
            error &&
              'border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500',

            // Disabled state
            disabled &&
              'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400',

            // Loading state
            loading && 'animate-pulse cursor-wait',

            // Hover effect
            !disabled && !loading && 'hover:border-gray-400',

            // Screen reader support
            'focus-visible:ring-2 focus-visible:ring-offset-2',

            // Responsive sizing
            'sm:h-14 sm:w-14 sm:text-xl'
          )}
          aria-label={`OTP digit ${index + 1}`}
          aria-invalid={error}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      ))}
    </div>
  );
}

/**
 * Compact OTP Input (smaller variant for modals/cards)
 */
export function CompactOTPInput(props: OTPInputProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array(props.length || 6)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="h-10 w-10 sm:h-12 sm:w-12">
            {/* Individual input rendered via OTPInput with custom className */}
          </div>
        ))}
    </div>
  );
}

export default OTPInput;
