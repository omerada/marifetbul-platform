/**
 * @fileoverview ErrorState Widget - Error Display Component
 * @module components/domains/dashboard/widgets/ErrorState
 *
 * Displays error state with message and retry option.
 * Handles both recoverable and non-recoverable errors.
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 3 - Task 5.5
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ErrorStateProps } from '../types/dashboard.types';

/**
 * ErrorState Component
 *
 * Consistent error display with:
 * - Error icon
 * - Error message
 * - Optional retry button
 * - Timestamp display
 * - Different styles for recoverable/non-recoverable errors
 *
 * @example
 * ```tsx
 * <ErrorState
 *   error={{
 *     message: 'Failed to load data',
 *     code: 'NETWORK_ERROR',
 *     timestamp: new Date(),
 *     recoverable: true
 *   }}
 *   onRetry={() => refetchData()}
 * />
 * ```
 */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const isRecoverable = error.recoverable && onRetry;

  return (
    <div
      className={cn(
        'rounded-lg border p-6',
        isRecoverable
          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20'
          : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
            isRecoverable
              ? 'bg-yellow-100 dark:bg-yellow-900/50'
              : 'bg-red-100 dark:bg-red-900/50'
          )}
        >
          <AlertCircle
            className={cn(
              'h-5 w-5',
              isRecoverable
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            )}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <h3
            className={cn(
              'mb-1 text-sm font-semibold',
              isRecoverable
                ? 'text-yellow-900 dark:text-yellow-200'
                : 'text-red-900 dark:text-red-200'
            )}
          >
            {isRecoverable ? 'Veri yüklenemedi' : 'Bir hata oluştu'}
          </h3>

          {/* Error message */}
          <p
            className={cn(
              'text-sm',
              isRecoverable
                ? 'text-yellow-800 dark:text-yellow-300'
                : 'text-red-800 dark:text-red-300'
            )}
          >
            {error.message}
          </p>

          {/* Error code (if available) */}
          {error.code && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Hata kodu: {error.code}
            </p>
          )}

          {/* Timestamp */}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {error.timestamp.toLocaleString('tr-TR')}
          </p>

          {/* Retry button */}
          {isRecoverable && onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-900 transition-colors hover:bg-yellow-200 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900/70 dark:focus:ring-offset-gray-900"
            >
              <RefreshCw className="h-4 w-4" />
              Tekrar Dene
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorState;
