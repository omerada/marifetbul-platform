/**
 * ================================================
 * MODERATOR LEADERBOARD COMPONENT
 * ================================================
 * Displays top moderators by activity count
 * Shows rankings, action counts, and performance badges
 *
 * Sprint 2 - Day 4 Story 4.2: Activity Timeline & Charts
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy, Medal, Award, User, TrendingUp } from 'lucide-react';

// ==================== TYPES ====================

export interface ModeratorStats {
  moderatorName: string;
  actionCount: number;
  rank?: number;
}

export interface ModeratorLeaderboardProps {
  moderators: ModeratorStats[];
  loading?: boolean;
  maxDisplay?: number;
}

// ==================== MODERATOR ROW ====================

interface ModeratorRowProps {
  moderator: ModeratorStats;
  rank: number;
}

function ModeratorRow({ moderator, rank }: ModeratorRowProps) {
  // Medal icons for top 3
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-sm font-semibold text-gray-600">#{rank}</span>
        );
    }
  };

  // Background color for top 3
  const getBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-md ${getBgColor(rank)}`}
    >
      <div className="flex items-center gap-4">
        {/* Rank / Medal */}
        <div className="flex h-10 w-10 items-center justify-center">
          {getMedalIcon(rank)}
        </div>

        {/* Moderator Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {moderator.moderatorName}
            </p>
            <p className="text-sm text-gray-600">Moderatör</p>
          </div>
        </div>
      </div>

      {/* Action Count */}
      <div className="text-right">
        <p className="text-2xl font-bold text-gray-900">
          {moderator.actionCount}
        </p>
        <p className="text-sm text-gray-600">işlem</p>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ModeratorLeaderboard({
  moderators,
  loading,
  maxDisplay = 10,
}: ModeratorLeaderboardProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            En Aktif Moderatörler
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="h-6 w-12 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // No data state
  if (!moderators || moderators.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            En Aktif Moderatörler
          </h3>
        </div>
        <div className="py-8 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">Henüz aktivite yok</p>
        </div>
      </Card>
    );
  }

  // Sort moderators by action count and add ranks
  const rankedModerators = [...moderators]
    .sort((a, b) => b.actionCount - a.actionCount)
    .slice(0, maxDisplay)
    .map((mod, index) => ({
      ...mod,
      rank: index + 1,
    }));

  const totalActions = rankedModerators.reduce(
    (sum, mod) => sum + mod.actionCount,
    0
  );

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            En Aktif Moderatörler
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>Toplam: {totalActions} işlem</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {rankedModerators.map((moderator) => (
          <ModeratorRow
            key={`${moderator.moderatorName}-${moderator.rank}`}
            moderator={moderator}
            rank={moderator.rank!}
          />
        ))}
      </div>

      {/* Footer Info */}
      {moderators.length > maxDisplay && (
        <div className="mt-4 border-t pt-4 text-center text-sm text-gray-600">
          İlk {maxDisplay} moderatör gösteriliyor. Toplam: {moderators.length}
        </div>
      )}

      {/* Performance Summary */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Trophy className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-900">Ekip Performansı</h4>
            <p className="mt-1 text-sm text-blue-800">
              {rankedModerators.length} aktif moderatör toplam {totalActions}{' '}
              işlem gerçekleştirdi. Ortalama{' '}
              {Math.round(totalActions / rankedModerators.length)}{' '}
              işlem/moderatör.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
