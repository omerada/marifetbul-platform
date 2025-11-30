/**
 * Moderators Tab Component
 *
 * Display moderator performance table.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import type { ModeratorPerformance } from '../types/moderationAnalytics';
import {
  formatDuration,
  getWorkloadColor,
  getStatusColor,
} from '../utils/analyticsHelpers';

interface ModeratorsTabProps {
  moderators: ModeratorPerformance[];
}

export function ModeratorsTab({ moderators }: ModeratorsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderatör Performansı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Moderatör</th>
                <th className="p-3 text-left">İşlem Sayısı</th>
                <th className="p-3 text-left">Ort. Süre</th>
                <th className="p-3 text-left">Doğruluk</th>
                <th className="p-3 text-left">İş Yükü</th>
                <th className="p-3 text-left">Durum</th>
                <th className="p-3 text-left">Son Aktivite</th>
              </tr>
            </thead>
            <tbody>
              {moderators.map((moderator) => (
                <tr key={moderator.moderatorId} className="border-b">
                  <td className="p-3">
                    <div className="font-medium">{moderator.moderatorName}</div>
                    <div className="text-xs text-gray-500">
                      ID: {moderator.moderatorId}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{moderator.totalActions}</td>
                  <td className="p-3">
                    {formatDuration(moderator.averageTime)}
                  </td>
                  <td className="p-3 font-medium text-green-600">
                    {moderator.accuracyRate.toFixed(1)}%
                  </td>
                  <td className="p-3">
                    <Badge className={getWorkloadColor(moderator.workload)}>
                      {moderator.workload}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={getStatusColor(moderator.onlineStatus)}>
                      {moderator.onlineStatus}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(moderator.lastActive).toLocaleString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
