/**
 * API Error Boundary
 *
 * React Error Boundary specifically for handling API errors.
 * Catches errors thrown by API calls and displays user-friendly fallback UI.
 */

'use client';

import { Component, ReactNode } from 'react';
import { ApiError, getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { ErrorAlert } from './ErrorAlert';

interface Props {
  /**
   * Child components to render
   */
  children: ReactNode;
  /**
   * Optional fallback UI (if not provided, uses default ErrorAlert)
   */
  fallback?: (error: ApiError, reset: () => void) => ReactNode;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface State {
  hasError: boolean;
  error: ApiError | null;
}

/**
 * Error boundary for catching and handling API errors
 *
 * @example
 * ```tsx
 * <ApiErrorBoundary>
 *   <YourComponent />
 * </ApiErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <ApiErrorBoundary
 *   fallback={(error, reset) => (
 *     <CustomErrorPage error={error} onRetry={reset} />
 *   )}
 * >
 *   <YourComponent />
 * </ApiErrorBoundary>
 * ```
 */
export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Convert to ApiError if it isn't already
    const apiError =
      error instanceof ApiError ? error : new ApiError(error.message, 500);

    return {
      hasError: true,
      error: apiError,
    };
  }

  override componentDidCatch(
    error: Error,
    errorInfo: { componentStack: string }
  ) {
    // Log error to monitoring service
    console.error('ApiErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div className="container mx-auto px-4 py-8">
          <ErrorAlert
            message={getUserFriendlyErrorMessage(this.state.error)}
            error={this.state.error}
            onRetry={this.resetError}
            visible
          />
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with ApiErrorBoundary
 *
 * @example
 * ```tsx
 * const ProtectedComponent = withApiErrorBoundary(MyComponent);
 * ```
 */
export function withApiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: ApiError, reset: () => void) => ReactNode
) {
  return function WithApiErrorBoundary(props: P) {
    return (
      <ApiErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ApiErrorBoundary>
    );
  };
}
