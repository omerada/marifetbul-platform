/**
 * ================================================
 * CURRENCY SELECTOR COMPONENT
 * ================================================
 * UI component for selecting currency
 *
 * Features:
 * - Dropdown currency selection
 * - Currency symbols and names
 * - Real-time exchange rate display
 * - Conversion preview
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 3.1: Multi-Currency Wallet Support
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Loader2, TrendingUp } from 'lucide-react';
import {
  currencyApi,
  type CurrencyCode,
  type CurrencyInfo,
} from '@/lib/api/currency';

// ============================================================================
// TYPES
// ============================================================================

export interface CurrencySelectorProps {
  /** Currently selected currency */
  value: CurrencyCode;

  /** Callback when currency changes */
  onChange: (currency: CurrencyCode) => void;

  /** Label for the selector */
  label?: string;

  /** Whether to show exchange rate */
  showExchangeRate?: boolean;

  /** Base currency for exchange rate comparison */
  baseCurrency?: CurrencyCode;

  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CurrencySelector({
  value,
  onChange,
  label = 'Para Birimi',
  showExchangeRate = false,
  baseCurrency = 'TRY',
  className = '',
}: CurrencySelectorProps) {
  // State
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch supported currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await currencyApi.getSupportedCurrencies();
        setCurrencies(data);
      } catch (err) {
        console.error('Failed to fetch currencies:', err);
        setError('Para birimleri yüklenemedi');
        // Fallback to default currencies
        setCurrencies([
          {
            code: 'TRY',
            symbol: '₺',
            nameTr: 'Türk Lirası',
            nameEn: 'Turkish Lira',
            decimalPlaces: 2,
            isDefault: true,
          },
          {
            code: 'USD',
            symbol: '$',
            nameTr: 'Amerikan Doları',
            nameEn: 'US Dollar',
            decimalPlaces: 2,
            isDefault: false,
          },
          {
            code: 'EUR',
            symbol: '€',
            nameTr: 'Euro',
            nameEn: 'Euro',
            decimalPlaces: 2,
            isDefault: false,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Fetch exchange rate when showing rates
  useEffect(() => {
    if (!showExchangeRate || value === baseCurrency) {
      setExchangeRate(null);
      return;
    }

    const fetchExchangeRate = async () => {
      try {
        const data = await currencyApi.getExchangeRate(baseCurrency, value);
        setExchangeRate(data.rate);
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
        setExchangeRate(null);
      }
    };

    fetchExchangeRate();
  }, [value, baseCurrency, showExchangeRate]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={className}>
        {label && (
          <Label className="mb-2 block text-sm font-medium">{label}</Label>
        )}
        <div className="flex h-10 items-center justify-center rounded-md border">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // Render error state
  if (error && currencies.length === 0) {
    return (
      <div className={className}>
        {label && (
          <Label className="mb-2 block text-sm font-medium">{label}</Label>
        )}
        <div className="text-destructive rounded-md border border-red-200 bg-red-50 p-2 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <Label
          htmlFor="currency-selector"
          className="mb-2 block text-sm font-medium"
        >
          {label}
        </Label>
      )}

      <Select
        value={value}
        onValueChange={(val) => onChange(val as CurrencyCode)}
      >
        <SelectTrigger className="w-full" placeholder="Para birimi seçin" />
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.nameTr}
              {currency.isDefault && ' (Varsayılan)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Exchange Rate Display */}
      {showExchangeRate && exchangeRate && value !== baseCurrency && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-2 text-sm dark:border-blue-800 dark:bg-blue-950/20">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-900 dark:text-blue-100">
            1 {baseCurrency} = {exchangeRate.toFixed(4)} {value}
          </span>
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;
