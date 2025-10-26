/**
 * API Error Hook
 *
 * Custom hook for handling API errors in React components.
 * Provides user-friendly error messages and error state management.
 */

'use client';

import { useState, useCallback } from 'react';
import {
  ApiError,
  getUserFriendlyErrorMessage,
  requiresReauth,
  isClientError,
  isServerError,
} from '@/lib/api/errors';
import { useRouter } from 'next/navigation';

export interface ApiErrorState {
  error: ApiError | null;
  message: string | null;
  fieldErrors: Record<string, string[]> | null;
  isClientError: boolean;
  isServerError: boolean;
}

export interface UseApiErrorReturn extends ApiErrorState {
  setError: (error: unknown) => void;
  clearError: () => void;
  hasError: boolean;
  hasFieldErrors: boolean;
}

/**
 * Hook for managing API errors in components
 *
 * @example
 * ```tsx
 * const { error, message, fieldErrors, setError, clearError } = useApiError();
 *
 * try {
 *   await createOrder(data);
 * } catch (err) {
 *   setError(err); // Automatically handles auth redirect
 * }
 *
 * {message && <ErrorAlert message={message} />}
 * {fieldErrors && <FieldErrors errors={fieldErrors} />}
 * ```
 */
export function useApiError(): UseApiErrorReturn {
  const router = useRouter();
  const [errorState, setErrorState] = useState<ApiErrorState>({
    error: null,
    message: null,
    fieldErrors: null,
    isClientError: false,
    isServerError: false,
  });

  const setError = useCallback(
    (error: unknown) => {
      // Ensure it's an ApiError
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError('Bilinmeyen hata', 500);

      // Check if requires re-authentication
      if (requiresReauth(apiError)) {
        // Redirect to login
        router.push(
          '/login?redirect=' + encodeURIComponent(window.location.pathname)
        );
        return;
      }

      // Set error state
      setErrorState({
        error: apiError,
        message: getUserFriendlyErrorMessage(apiError),
        fieldErrors: apiError.details as Record<string, string[]> | null,
        isClientError: isClientError(apiError),
        isServerError: isServerError(apiError),
      });
    },
    [router]
  );

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      message: null,
      fieldErrors: null,
      isClientError: false,
      isServerError: false,
    });
  }, []);

  return {
    ...errorState,
    setError,
    clearError,
    hasError: errorState.error !== null,
    hasFieldErrors:
      errorState.fieldErrors !== null &&
      Object.keys(errorState.fieldErrors).length > 0,
  };
}
