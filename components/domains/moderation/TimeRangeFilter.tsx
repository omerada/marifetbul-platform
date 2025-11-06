/**
 * ================================================
 * TIME RANGE FILTER COMPONENT
 * ================================================
 * Filter for selecting time ranges in analytics
 * Supports: Today, Last 7 days, Last 30 days, Custom
 *
 * Sprint 2 - Day 4 Story 4.2: Activity Timeline & Charts
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

export type TimeRange = 'today' | 'week' | 'month' | 'custom';

export interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange, startDate?: string, endDate?: string) => void;
  className?: string;
}

interface TimeRangeOption {
  value: TimeRange;
  label: string;
  description: string;
}

// ==================== MAIN COMPONENT ====================

export default function TimeRangeFilter({
  value,
  onChange,
  className = '',
}: TimeRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const options: TimeRangeOption[] = [
    {
      value: 'today',
      label: 'Bugün',
      description: 'Son 24 saat',
    },
    {
      value: 'week',
      label: 'Son 7 Gün',
      description: 'Haftalık özet',
    },
    {
      value: 'month',
      label: 'Son 30 Gün',
      description: 'Aylık özet',
    },
    {
      value: 'custom',
      label: 'Özel Tarih',
      description: 'Tarih aralığı seçin',
    },
  ];

  const selectedOption = options.find((opt) => opt.value === value);

  const handleOptionClick = (option: TimeRangeOption) => {
    if (option.value === 'custom') {
      setShowCustomDates(true);
      setIsOpen(false);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setShowCustomDates(false);
    }
    logger.debug('TimeRangeFilter', { rangeoptionvalue,  });
  };

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      onChange('custom', startDate, endDate);
      setShowCustomDates(false);
      logger.debug('TimeRangeFilter', { startDate, endDate,  });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <Calendar className="h-4 w-4" />
        <span>{selectedOption?.label || 'Zaman Aralığı'}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Options */}
          <div className="absolute top-full right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={`w-full px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 ${
                  value === option.value ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-600">
                      {option.description}
                    </p>
                  </div>
                  {value === option.value && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Custom Date Picker */}
      {showCustomDates && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowCustomDates(false)}
          />

          {/* Date Inputs */}
          <div className="absolute top-full right-0 z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <h3 className="mb-4 font-semibold text-gray-900">
              Özel Tarih Aralığı
            </h3>

            {/* Start Date */}
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomDates(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                İptal
              </button>
              <button
                onClick={handleCustomDateApply}
                disabled={!startDate || !endDate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Uygula
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
