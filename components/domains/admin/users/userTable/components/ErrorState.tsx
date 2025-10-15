/**
 * ErrorState Component
 *
 * Error display for user table
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface ErrorStateProps {
  error: string | Error | null;
  className?: string;
}

export function ErrorState({ error, className }: ErrorStateProps) {
  const errorMessage =
    typeof error === 'string' ? error : error?.message || 'Bilinmeyen hata';

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="text-center text-red-600">
          Kullanıcılar yüklenirken hata: {errorMessage}
        </div>
      </CardContent>
    </Card>
  );
}
