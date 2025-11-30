'use client';

/**
 * ================================================
 * IBAN INPUT COMPONENT
 * ================================================
 * Validated IBAN input with Turkish bank detection
 *
 * Features:
 * - Real-time IBAN validation
 * - Auto-formatting (adds spaces)
 * - Bank logo and name display
 * - Visual feedback (success/error states)
 * - Error messages
 * - Turkish bank support
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 * @sprint Sprint 1 - Story 1.3 - Task 1 (1 story point)
 */

'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Loader2,
} from 'lucide-react';
import {
  validateTurkishIBAN,
  displayIBAN,
  formatIBAN,
  type IBANValidationResult,
} from '@/lib/utils/iban-validator';

// ================================================
// TYPES
// ================================================

export interface IBANInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  onValidation?: (result: IBANValidationResult) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showBankInfo?: boolean;
  validateOnChange?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export const IBANInput: React.FC<IBANInputProps> = ({
  value,
  onChange,
  onValidation,
  label = 'IBAN Numarası',
  placeholder = 'TR00 0000 0000 0000 0000 0000 00',
  required = false,
  disabled = false,
  className = '',
  showBankInfo = true,
  validateOnChange = true,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [validation, setValidation] = useState<IBANValidationResult | null>(
    null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Validate on mount if there's an initial value
  useEffect(() => {
    if (value) {
      handleValidate(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== HANDLERS ====================

  const handleValidate = (iban: string) => {
    if (!iban) {
      setValidation(null);
      return;
    }

    setIsValidating(true);

    // Simulate async validation (can be replaced with API call)
    setTimeout(() => {
      const result = validateTurkishIBAN(iban);
      setValidation(result);
      setIsValidating(false);

      if (onValidation) {
        onValidation(result);
      }

      onChange(formatIBAN(iban), result.isValid);
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);
    setIsDirty(true);

    if (validateOnChange) {
      handleValidate(inputValue);
    } else {
      onChange(formatIBAN(inputValue), false);
    }
  };

  const handleBlur = () => {
    if (!validateOnChange && localValue) {
      handleValidate(localValue);
    }
  };

  // ==================== COMPUTED PROPERTIES ====================

  const displayValue = localValue ? displayIBAN(localValue) : '';
  const hasError = isDirty && validation && !validation.isValid;
  const isSuccess = isDirty && validation?.isValid;

  // ==================== RENDER ====================

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <Label htmlFor="iban-input">
          {label}
          {required && <span className="text-red-600">*</span>}
        </Label>
      )}

      {/* Input with Icon */}
      <div className="relative">
        <Input
          id="iban-input"
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={31} // TR + spaces
          className={`pr-10 ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : isSuccess
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                : ''
          }`}
        />

        {/* Status Icon */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          {isValidating ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : hasError ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : null}
        </div>
      </div>

      {/* Bank Info */}
      {showBankInfo && validation?.bankInfo && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              {validation.bankInfo.name}
            </p>
            <p className="text-xs text-blue-700">
              Banka Kodu: {validation.bankInfo.code}
            </p>
          </div>
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Geçerli
          </Badge>
        </div>
      )}

      {/* Error Messages */}
      {hasError && validation && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg bg-red-50 p-2"
            >
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      {!hasError && !isSuccess && (
        <p className="text-xs text-gray-600">
          Türk bankalarına ait IBAN numaranızı girin (TR ile başlamalı, 26
          karakter)
        </p>
      )}
    </div>
  );
};

export default IBANInput;
