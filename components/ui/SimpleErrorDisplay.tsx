'use client';

/**
 * ================================================
 * SIMPLE ERROR DISPLAY - Production Ready
 * ================================================
 * Lightweight inline error display component
 * Use UnifiedErrorBoundary for error catching
 * Use this for simple error states (loading failed, etc.)
 * 
 * @example
 * if (error) return <SimpleErrorDisplay error={error} onRetry={refetch} />
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface SimpleErrorDisplayProps {
  error?: string | Error;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function SimpleErrorDisplay({
  error,
  message = 'Bir hata oluştu',
  onRetry,
  className = '',
}: SimpleErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : error || message;

  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-12 text-center ${className}`}>
      <div className="rounded-full bg-red-50 p-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900">{errorMessage}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </Button>
        )}
      </div>
    </div>
  );
}
