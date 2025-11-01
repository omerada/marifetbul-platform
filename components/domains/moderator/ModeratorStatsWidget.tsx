/**
 * ================================================
 * MODERATOR STATS WIDGET
 * ================================================
 * Displays real-time moderation statistics
 *
 * Sprint: Moderator System Completion - Day 1
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Star,
  Flag,
  Headphones,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ModerationStats } from '@/types/business/moderation';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ModeratorStatsWidgetProps {
  stats: ModerationStats | null;
  isLoading?: boolean;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
  link?: string;
  subStats?: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  link,
  subStats,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        link && 'cursor-pointer hover:border-blue-300'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
            {subStats && subStats.length > 0 && (
              <div className="mt-3 flex items-center gap-3">
                {subStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className={cn('text-xs font-medium', stat.color)}>
                      {stat.label}:
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={cn('rounded-full p-3', iconBgColor)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModeratorStatsWidget({
  stats,
  isLoading = false,
  className = '',
}: ModeratorStatsWidgetProps) {
  // Loading state
  if (isLoading || !stats) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4',
          className
        )}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="mt-2 h-8 w-16 rounded bg-gray-200" />
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards: StatCardProps[] = [
    {
      title: 'Bekleyen Yorumlar',
      value: stats.pendingComments || 0,
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      iconBgColor: 'bg-blue-100',
      link: '/moderator/comments',
      subStats: [
        {
          label: 'Bugün Onaylanan',
          value: stats.commentsApprovedToday || 0,
          color: 'text-green-600',
        },
        {
          label: 'Reddedilen',
          value: stats.commentsRejectedToday || 0,
          color: 'text-red-600',
        },
      ],
    },
    {
      title: 'İşaretli Değerlendirmeler',
      value: stats.flaggedReviews || 0,
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      iconBgColor: 'bg-yellow-100',
      link: '/moderator/reviews',
      subStats: [
        {
          label: 'Bekleyen',
          value: stats.pendingReviews || 0,
          color: 'text-orange-600',
        },
        {
          label: 'Bugün Çözülen',
          value: stats.reviewsApprovedToday + stats.reviewsRejectedToday || 0,
          color: 'text-green-600',
        },
      ],
    },
    {
      title: 'Kullanıcı Şikayetleri',
      value: stats.pendingReports || 0,
      icon: <Flag className="h-6 w-6 text-red-600" />,
      iconBgColor: 'bg-red-100',
      link: '/moderator/reports',
      subStats: [
        {
          label: 'Bugün Çözülen',
          value: stats.reportsResolvedToday || 0,
          color: 'text-green-600',
        },
      ],
    },
    {
      title: 'Destek Talepleri',
      value: stats.pendingSupportTickets || 0,
      icon: <Headphones className="h-6 w-6 text-green-600" />,
      iconBgColor: 'bg-green-100',
      link: '/moderator/tickets',
      subStats: [
        {
          label: 'Bugün Kapatılan',
          value: stats.ticketsClosedToday || 0,
          color: 'text-green-600',
        },
      ],
    },
  ];

  return (
    <div className={className}>
      {/* Primary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Overall Performance Stats */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Pending */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Bekleyen
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {stats.totalPendingItems || 0}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {stats.totalPendingItems > 10 ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-yellow-600">
                        Yüksek kuyruk
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">
                        Normal seviye
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Today */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Bugün Yapılan İşlem
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {stats.totalActionsToday || 0}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">
                    Aktif moderasyon
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ort. Yanıt Süresi
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {stats.averageResponseTimeMinutes || 0}
                  <span className="text-base text-gray-600"> dk</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {stats.averageResponseTimeMinutes < 30 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">Çok iyi</span>
                    </>
                  ) : stats.averageResponseTimeMinutes < 60 ? (
                    <>
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-yellow-600">İyi</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600">Yavaş</span>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Badge */}
      {stats.accuracyRate !== undefined && (
        <div className="mt-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Moderasyon Doğruluk Oranı
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {(stats.accuracyRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div>
                  {stats.accuracyRate >= 0.95 ? (
                    <Badge className="bg-green-500 text-white">Mükemmel</Badge>
                  ) : stats.accuracyRate >= 0.85 ? (
                    <Badge className="bg-blue-500 text-white">Çok İyi</Badge>
                  ) : stats.accuracyRate >= 0.75 ? (
                    <Badge className="bg-yellow-500 text-white">İyi</Badge>
                  ) : (
                    <Badge className="bg-red-500 text-white">
                      Geliştirilmeli
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ModeratorStatsWidget;
