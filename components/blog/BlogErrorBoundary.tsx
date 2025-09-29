'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class BlogErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Blog Error Boundary caught an error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              Blog yüklenirken bir hata oluştu
            </h2>
            <p className="mb-4 text-gray-600">
              Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
            </p>
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Sayfayı Yenile
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
