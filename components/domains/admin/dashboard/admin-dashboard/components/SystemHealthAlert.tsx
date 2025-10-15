/**
 * SystemHealthAlert Component
 *
 * System health alert with issues list
 */

import { AlertTriangle } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import type { SystemHealthAlertProps } from '../types/adminDashboardTypes';

export function SystemHealthAlert({ systemHealth }: SystemHealthAlertProps) {
  if (!systemHealth || systemHealth.status !== 'warning') {
    return null;
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-md">
      <div className="flex items-start space-x-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 shadow-md">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-900">
            Sistem Sağlığı Uyarısı
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Bazı sistem bileşenleri dikkat gerektiriyor.
          </p>
          <div className="mt-4 space-y-2">
            {systemHealth.issues?.map((issue, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 rounded-md bg-yellow-100/50 px-3 py-2"
              >
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-600" />
                <p className="text-sm text-yellow-800">{issue}</p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            Detayları Görüntüle
          </Button>
        </div>
      </div>
    </div>
  );
}
