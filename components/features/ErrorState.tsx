'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({
  title = 'Bir Hata Oluştu',
  message,
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>

      <p className="mb-6 max-w-md text-gray-600">{message}</p>

      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tekrar Dene</span>
        </Button>
      )}
    </div>
  );
}
