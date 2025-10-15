/**
 * DashboardErrorState Component
 *
 * Error display with retry button
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import type { DashboardErrorStateProps } from '../types/adminDashboardTypes';

export function DashboardErrorState({
  error,
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <Card className="mx-auto mt-20 max-w-2xl border-0 bg-gradient-to-r from-red-50 to-red-100 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 shadow-lg">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold text-red-900">
                Panel Hatası
              </h3>
              <p className="text-red-700">
                Panel verilerinizi yüklerken bir hatayla karşılaştık.
              </p>
              <div className="mt-4 rounded-lg bg-red-100 p-3">
                <p className="font-mono text-sm text-red-800">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onRetry}
              className="border-red-300 text-red-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
