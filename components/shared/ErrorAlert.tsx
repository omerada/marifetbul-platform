/**
 * Error Alert Component
 *
 * Displays user-friendly error messages with appropriate styling
 * and action buttons based on error type.
 */

'use client';

import { AlertCircle, WifiOff, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { ApiError, isNetworkError, isRetriableError } from '@/lib/api/errors';

export interface ErrorAlertProps {
  /**
   * Error message to display
   */
  message: string;
  /**
   * Optional error object for more context
   */
  error?: ApiError | null;
  /**
   * Title of the alert (defaults based on error type)
   */
  title?: string;
  /**
   * Callback for retry action (shown for retriable errors)
   */
  onRetry?: () => void;
  /**
   * Callback for dismiss action
   */
  onDismiss?: () => void;
  /**
   * Whether to show the alert (for controlled visibility)
   */
  visible?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Displays API errors in a user-friendly format
 *
 * @example
 * ```tsx
 * const { error, message, setError } = useApiError();
 *
 * <ErrorAlert
 *   message={message}
 *   error={error}
 *   onRetry={refetch}
 *   onDismiss={() => setError(null)}
 * />
 * ```
 */
export function ErrorAlert({
  message,
  error,
  title,
  onRetry,
  onDismiss,
  visible = true,
  className,
}: ErrorAlertProps) {
  if (!visible || !message) return null;

  // Determine error type for icon and styling
  const isNetwork = error && isNetworkError(error);
  const canRetry = error && isRetriableError(error);

  // Default title based on error type
  const alertTitle = title || (isNetwork ? 'Bağlantı Hatası' : 'Hata Oluştu');

  // Icon based on error type
  const Icon = isNetwork ? WifiOff : AlertCircle;

  return (
    <Alert variant="destructive" className={className}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>{alertTitle}</AlertTitle>
        <AlertDescription className="mt-2">{message}</AlertDescription>
      </div>

      {/* Action buttons */}
      <div className="ml-auto flex items-center gap-2">
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="focus-visible:ring-ring ring-offset-background border-input hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Tekrar Dene
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Kapat</span>
          </button>
        )}
      </div>
    </Alert>
  );
}

/**
 * Compact inline error message (for form fields)
 */
export function InlineError({ message }: { message: string }) {
  return (
    <p className="text-destructive mt-1 flex items-center gap-1 text-sm">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

/**
 * Field-level validation errors component
 */
export interface FieldErrorsProps {
  /**
   * Field errors from ValidationError
   */
  errors: Record<string, string[]>;
  /**
   * Optional field name mapping for display
   */
  fieldNames?: Record<string, string>;
}

/**
 * Displays field-level validation errors
 *
 * @example
 * ```tsx
 * {fieldErrors && (
 *   <FieldErrors
 *     errors={fieldErrors}
 *     fieldNames={{ email: 'E-posta', password: 'Şifre' }}
 *   />
 * )}
 * ```
 */
export function FieldErrors({ errors, fieldNames = {} }: FieldErrorsProps) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Lütfen aşağıdaki hataları düzeltin:</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {entries.map(([field, messages]) => {
            const displayName = fieldNames[field] || field;
            return (
              <li key={field}>
                <strong>{displayName}:</strong> {messages.join(', ')}
              </li>
            );
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
