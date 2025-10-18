/**
 * SecurityAlertsCard Component
 *
 * Security alerts list with priority-based styling
 */

import { Shield, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import {
  getPriorityConfig,
  formatPriorityLabel,
  formatDateTime,
} from '../utils/dashboardHelpers';
import type { SecurityAlertsCardProps } from '../types/adminDashboardTypes';

export function SecurityAlertsCard({
  alerts,
  onAlertAction,
}: SecurityAlertsCardProps) {
  const unreadCount = alerts.filter((a) => !a.isResolved).length;

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 shadow-md">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Güvenlik Uyarıları
            </CardTitle>
            {unreadCount > 0 && (
              <p className="text-xs text-red-600">
                {unreadCount} okunmamış uyarı
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {alerts.map((alert) => {
            const priorityConfig = getPriorityConfig(alert.priority || 'low');

            return (
              <div
                key={alert.id}
                className={`group relative overflow-hidden rounded-lg border p-4 transition-all duration-300 hover:shadow-md ${priorityConfig.bg} ${priorityConfig.border}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/50 shadow-md transition-all duration-300 group-hover:scale-110">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {alert.title}
                          </h4>
                          <Badge className={priorityConfig.badge}>
                            {formatPriorityLabel(alert.priority || 'low')}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">
                          {alert.description}
                        </p>
                      </div>
                      {!alert.isResolved && (
                        <div
                          className={`h-2 w-2 shrink-0 rounded-full ${priorityConfig.dot}`}
                        />
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDateTime(alert.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!alert.isResolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAlertAction(alert.id, 'read')}
                            className="h-7 px-2 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          >
                            Okundu İşaretle
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAlertAction(alert.id, 'dismiss')}
                          className="h-7 px-2 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        >
                          <span>Kapat</span>
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
