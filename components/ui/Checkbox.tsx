'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
  error?: string;
  description?: string;
  variant?: 'default' | 'small';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, label, error, description, variant = 'default', id, ...props },
    ref
  ) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        <div className="flex items-start space-x-3">
          <div className="flex h-5 items-center">
            <input
              type="checkbox"
              ref={ref}
              id={checkboxId}
              className={cn(
                'h-4 w-4 rounded border-2 border-gray-300 text-blue-600 transition-colors',
                'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'checked:border-blue-600 checked:bg-blue-600',
                'hover:border-gray-400',
                'disabled:cursor-not-allowed disabled:opacity-50',
                variant === 'small' && 'h-3 w-3',
                error && 'border-red-300 focus:ring-red-500',
                className
              )}
              {...props}
            />
          </div>
          {label && (
            <div className="flex-1">
              <label
                htmlFor={checkboxId}
                className={cn(
                  'block cursor-pointer text-sm font-medium text-gray-700',
                  variant === 'small' && 'text-xs',
                  props.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
              {description && (
                <p
                  className={cn(
                    'mt-1 text-sm text-gray-500',
                    variant === 'small' && 'text-xs'
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
