import React, { Suspense, ComponentType } from 'react';
import {
  UnifiedLoading,
  LoadingPageSkeleton,
} from '@/components/ui/UnifiedLoadingSystem';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';

/**
 * Admin Loading Skeleton Component - Legacy Wrapper
 * @deprecated Use UnifiedLoading with variant="skeleton" instead
 */
export function AdminLoadingSkeleton() {
  return (
    <LoadingPageSkeleton hasHeader={true} hasSidebar={false} contentLines={8} />
  );
}

/**
 * Admin Spinner Loading Component - Legacy Wrapper
 * @deprecated Use UnifiedLoading with variant="spinner" instead
 */
export function AdminSpinnerLoading() {
  return (
    <UnifiedLoading
      variant="spinner"
      size="lg"
      text="Y�kleniyor..."
      className="min-h-[400px]"
    />
  );
}

/**
 * Lazy Loading Wrapper for Admin Components
 * Uses unified loading and error systems
 */
interface LazyAdminWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  title?: string;
  loadingVariant?: 'skeleton' | 'spinner';
}

export function LazyAdminWrapper({
  children,
  fallback,
  title,
  loadingVariant = 'skeleton',
}: LazyAdminWrapperProps) {
  // Default fallback using unified loading system
  const defaultFallback =
    loadingVariant === 'skeleton' ? (
      <AdminLoadingSkeleton />
    ) : (
      <AdminSpinnerLoading />
    );

  const FallbackComponent = fallback
    ? React.createElement(fallback)
    : defaultFallback;

  const content = (
    <div className="min-h-screen bg-gray-50">
      {title && (
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      <Suspense fallback={FallbackComponent}>{children}</Suspense>
    </div>
  );

  // Wrap with unified error boundary
  return (
    <UnifiedErrorBoundary
      level="page"
      showDetails={process.env.NODE_ENV === 'development'}
      enableReporting={process.env.NODE_ENV === 'production'}
    >
      {content}
    </UnifiedErrorBoundary>
  );
}

/**
 * Higher-Order Component for lazy admin pages
 * Uses unified loading and error systems
 */
export function withLazyAdmin<P extends object>(
  Component: ComponentType<P>,
  options?: {
    fallback?: React.ComponentType;
    title?: string;
    loadingVariant?: 'skeleton' | 'spinner';
  }
) {
  const WrappedComponent = (props: P) => (
    <LazyAdminWrapper
      fallback={options?.fallback}
      title={options?.title}
      loadingVariant={options?.loadingVariant}
    >
      <Component {...props} />
    </LazyAdminWrapper>
  );

  WrappedComponent.displayName = `withLazyAdmin(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Admin Error Boundary - Legacy Component
 * @deprecated Use UnifiedErrorBoundary with level="page" instead
 */
export class AdminErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error }>;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin component error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      // Use unified error boundary for better UX
      return (
        <UnifiedErrorBoundary level="page">
          {this.props.children}
        </UnifiedErrorBoundary>
      );
    }

    return this.props.children;
  }
}
