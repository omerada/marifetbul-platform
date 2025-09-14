import React, { Suspense, ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

/**
 * Admin Loading Skeleton Component
 * Provides consistent loading experience across admin panels
 */
export function AdminLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Minimal Spinner Loading Component
 * For quick loading states
 */
export function AdminSpinnerLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-lg text-gray-600">Yükleniyor...</span>
      </div>
    </div>
  );
}

/**
 * Lazy Loading Wrapper for Admin Components
 * Provides consistent loading experience and error boundaries
 */
interface LazyAdminWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  title?: string;
}

export function LazyAdminWrapper({ 
  children, 
  fallback: Fallback = AdminLoadingSkeleton,
  title 
}: LazyAdminWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {title && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      <Suspense fallback={<Fallback />}>
        {children}
      </Suspense>
    </div>
  );
}

/**
 * Higher-Order Component for lazy admin pages
 * Automatically wraps admin components with lazy loading
 */
export function withLazyAdmin<P extends object>(
  Component: ComponentType<P>,
  options?: {
    fallback?: React.ComponentType;
    title?: string;
  }
) {
  const WrappedComponent = (props: P) => (
    <LazyAdminWrapper 
      fallback={options?.fallback} 
      title={options?.title}
    >
      <Component {...props} />
    </LazyAdminWrapper>
  );

  WrappedComponent.displayName = `withLazyAdmin(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Admin Error Boundary
 * Catches and displays errors in admin components
 */
interface AdminErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  AdminErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error!} />;
      }

      return (
        <div className="p-6">
          <Card className="border-red-200">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bir hata oluştu</h3>
              <p className="text-gray-600 mb-4">Bu bölüm şu anda kullanılamıyor. Lütfen sayfayı yenileyin.</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sayfayı Yenile
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}