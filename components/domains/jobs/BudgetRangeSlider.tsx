'use client';

/**
 * BudgetRangeSlider Component
 * Dual-handle slider for budget range filtering
 *
 * Sprint 3 - Story 3.2: Advanced Job Search & Filtering
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-01-24
 */

import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/Label';

interface BudgetRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export function BudgetRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 100,
  formatValue = (v) => `₺${v.toLocaleString('tr-TR')}`,
  className = '',
}: BudgetRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - step);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + step);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <DollarSign className="h-4 w-4" />
          Bütçe Aralığı
        </Label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatValue(localValue[0])} - {formatValue(localValue[1])}
        </span>
      </div>

      <div className="relative pt-6 pb-2">
        {/* Background Track */}
        <div className="absolute top-6 right-0 left-0 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />

        {/* Active Range Track */}
        <div
          className="bg-primary-500 absolute top-6 h-2 rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className="[&::-webkit-slider-thumb]:border-primary-500 [&::-moz-range-thumb]:border-primary-500 pointer-events-none absolute top-4 left-0 h-2 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-shadow [&::-moz-range-thumb]:hover:shadow-lg [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-lg"
          style={{ zIndex: localValue[0] > max - (max - min) / 2 ? 5 : 3 }}
        />

        {/* Max Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="[&::-webkit-slider-thumb]:border-primary-500 [&::-moz-range-thumb]:border-primary-500 pointer-events-none absolute top-4 left-0 h-2 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-shadow [&::-moz-range-thumb]:hover:shadow-lg [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-lg"
          style={{ zIndex: localValue[1] <= max - (max - min) / 2 ? 5 : 3 }}
        />
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([min, 1000])}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          &lt; ₺1,000
        </button>
        <button
          type="button"
          onClick={() => onChange([1000, 5000])}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          ₺1,000 - ₺5,000
        </button>
        <button
          type="button"
          onClick={() => onChange([5000, 15000])}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          ₺5,000 - ₺15,000
        </button>
        <button
          type="button"
          onClick={() => onChange([15000, max])}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          &gt; ₺15,000
        </button>
      </div>
    </div>
  );
}
