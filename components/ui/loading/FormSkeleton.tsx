/**
 * FORM SKELETON COMPONENT
 * ================================================
 * Reusable loading skeleton for form layouts
 * Sprint EPIC 4 - Story 4.1: Loading States Enhancement
 *
 * Features:
 * - Configurable field count
 * - Different field types (text, textarea, select, checkbox)
 * - Action buttons skeleton
 * - Multi-column support
 */

'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio';

export interface FormFieldConfig {
  type: FormFieldType;
  span?: 1 | 2; // Column span for grid layout
}

export interface FormSkeletonProps {
  /** Number of simple text fields (if not using fields config) */
  fields?: number;
  /** Detailed field configuration */
  fieldConfig?: FormFieldConfig[];
  /** Show card wrapper */
  showCard?: boolean;
  /** Card title skeleton */
  showTitle?: boolean;
  /** Show action buttons at bottom */
  showActions?: boolean;
  /** Number of action buttons */
  actionButtons?: number;
  /** Grid layout (columns) */
  columns?: 1 | 2;
  /** Additional CSS classes */
  className?: string;
}

export function FormSkeleton({
  fields = 4,
  fieldConfig,
  showCard = false,
  showTitle = false,
  showActions = true,
  actionButtons = 2,
  columns = 1,
  className,
}: FormSkeletonProps) {
  const formContent = (
    <div className="space-y-6">
      {/* Title Skeleton */}
      {showTitle && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      )}

      {/* Fields Skeleton */}
      <div
        className={cn(
          'space-y-6',
          columns === 2 && 'sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0'
        )}
      >
        {fieldConfig
          ? // Custom field configuration
            fieldConfig.map((config, index) => (
              <div
                key={index}
                className={cn(
                  config.span === 2 && columns === 2 && 'sm:col-span-2'
                )}
              >
                <FormFieldSkeleton type={config.type} />
              </div>
            ))
          : // Simple text fields
            Array.from({ length: fields }).map((_, index) => (
              <div key={index}>
                <FormFieldSkeleton type="text" />
              </div>
            ))}
      </div>

      {/* Action Buttons Skeleton */}
      {showActions && (
        <div className="flex gap-3 pt-4">
          {Array.from({ length: actionButtons }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn('h-10 rounded-lg', index === 0 ? 'flex-1' : 'w-32')}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
        )}
        <CardContent>{formContent}</CardContent>
      </Card>
    );
  }

  return <div className={cn('w-full', className)}>{formContent}</div>;
}

/**
 * Individual Form Field Skeleton
 */
function FormFieldSkeleton({ type }: { type: FormFieldType }) {
  return (
    <div className="space-y-2">
      {/* Label */}
      <Skeleton className="h-4 w-24" />

      {/* Input/Field */}
      {type === 'textarea' ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : type === 'select' ? (
        <Skeleton className="h-10 w-full rounded-lg" />
      ) : type === 'checkbox' || type === 'radio' ? (
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <Skeleton className="h-10 w-full rounded-lg" />
      )}

      {/* Helper text */}
      {type !== 'checkbox' && type !== 'radio' && (
        <Skeleton className="h-3 w-48" />
      )}
    </div>
  );
}

/**
 * Settings Form Skeleton
 * Pre-configured for settings pages
 */
export function SettingsFormSkeleton({
  sections = 3,
  className,
}: {
  sections?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: sections }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-full max-w-lg" />
          </CardHeader>
          <CardContent>
            <FormSkeleton
              fields={index === 0 ? 2 : 3}
              showActions={index === sections - 1}
              showCard={false}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Inline Form Skeleton
 * For inline editing or small forms
 */
export function InlineFormSkeleton({
  fields = 2,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-3', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-10 rounded-lg', index === 0 ? 'flex-1' : 'w-32')}
        />
      ))}
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  );
}

export default FormSkeleton;
