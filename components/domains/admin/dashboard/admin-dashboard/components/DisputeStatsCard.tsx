/**
 * DisputeStatsCard Component
 * Sprint 1: Order Dispute System
 *
 * Quick dispute statistics for admin dashboard
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getDisputeStatistics, getOpenDisputes } from '@/lib/api/disputes';
import type { DisputeStatistics, DisputeResponse } from '@/types/dispute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { AlertCircle, Clock, ArrowRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useWebSocket } from '@/hooks';

export function DisputeStatsCard() {
  const router = useRouter();
  const socket = useWebSocket();
  const [stats, setStats] = useState<DisputeStatistics | null>(null);
  const [recentDisputes, setRecentDisputes] = useState<DisputeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, disputesData] = await Promise.all([
        getDisputeStatistics(),
        getOpenDisputes({ page: 0, size: 5 }),
      ]);

      setStats(statsData);
      setRecentDisputes(disputesData);
    } catch (error) {
      console.error('Failed to fetch dispute stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    if (!socket.isConnected) return;

    const subscriptionId = socket.subscribe(
      '/topic/admin/disputes',
      (message: unknown) => {
        try {
          if (!message || typeof message !== 'object' || !('body' in message)) {
            return;
          }

          const msgBody = (message as { body: string }).body;
          const payload = JSON.parse(msgBody);

          // Refresh data on dispute events
          if (
            payload.type === 'DISPUTE_CREATED' ||
            payload.type === 'DISPUTE_RESOLVED'
          ) {
            fetchData();
          }
        } catch (err) {
          console.error('Failed to parse dispute update:', err);
        }
      }
    );

    return () => {
      socket.unsubscribe(subscriptionId);
    };
  }, [socket, fetchData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            İtirazlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            İtirazlar
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/disputes')}
          >
            Tümünü Gör
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">
                Açık İtirazlar
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {stats?.openDisputesCount || 0}
            </p>
          </div>

          <div className="rounded-lg border bg-blue-50 p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Ort. Süre
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {stats?.averageResolutionTimeHours
                ? `${Math.round(stats.averageResolutionTimeHours)}s`
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Recent Disputes */}
        {recentDisputes.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-muted-foreground text-sm font-medium">
              Son Açılan İtirazlar
            </h4>
            <div className="space-y-2">
              {recentDisputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="bg-card hover:bg-accent/50 flex items-center justify-between rounded-md border p-3 text-sm transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {dispute.raisedByUserFullName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {dispute.reasonDisplayName}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {format(
                        new Date(dispute.createdAt),
                        'dd MMM yyyy HH:mm',
                        {
                          locale: tr,
                        }
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/disputes`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground py-4 text-center text-sm">
            Açık itiraz bulunmuyor
          </div>
        )}
      </CardContent>
    </Card>
  );
}
