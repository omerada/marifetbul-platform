'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: 'default' | 'compact' | 'page';
  className?: string;
}

export function ErrorState({
  title = 'Bir Hata Oluştu',
  message,
  onRetry,
  showRetry = true,
  variant = 'default',
  className = '',
}: ErrorStateProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{title}</p>
              <p className="text-xs text-red-600">{message}</p>
            </div>
            {showRetry && onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-red-50/50 via-white to-orange-50/30 ${className}`}
      >
        <div className="flex min-h-screen items-center justify-center p-8">
          <Card className="border-0 bg-gradient-to-br from-white to-red-50/30 shadow-2xl">
            <div className="p-12 text-center">
              {/* Animated Error Icon */}
              <div className="mb-8 flex justify-center">
                <div className="animate-pulse rounded-full bg-gradient-to-br from-red-100 to-red-200 p-6">
                  <div className="rounded-full bg-gradient-to-br from-red-500 to-red-600 p-4">
                    <AlertCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="mb-4 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-3xl font-bold text-transparent">
                {title}
              </h1>

              <p className="mb-8 max-w-md text-lg text-gray-600">{message}</p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                {showRetry && onRetry && (
                  <Button
                    onClick={onRetry}
                    className="bg-gradient-to-r from-red-500 to-red-600 font-semibold shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tekrar Dene
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri Dön
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = '/')}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfa
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <Card className="border-0 bg-gradient-to-br from-white to-red-50/30 p-8 shadow-xl">
        {/* Error Icon with Animation */}
        <div className="mb-6 flex justify-center">
          <div className="animate-bounce rounded-full bg-gradient-to-br from-red-100 to-red-200 p-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <h2 className="mb-3 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-xl font-bold text-transparent">
          {title}
        </h2>

        <p className="mb-6 max-w-md text-gray-600">{message}</p>

        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            className="bg-gradient-to-r from-red-500 to-red-600 font-semibold shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        )}
      </Card>
    </div>
  );
}
