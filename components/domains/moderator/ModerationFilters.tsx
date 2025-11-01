'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Filter,
  X,
  Search,
  MessageSquare,
  Star,
  Flag,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { ActionType } from '@/types/business/moderation';

export interface ModerationFiltersState {
  search?: string;
  type?: 'comment' | 'review' | 'report' | 'all';
  actionType?: ActionType | 'all';
  moderatorId?: string;
  startDate?: Date;
  endDate?: Date;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'all';
  status?: 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'all';
}

interface ModerationFiltersProps {
  filters: ModerationFiltersState;
  onFiltersChange: (filters: ModerationFiltersState) => void;
  moderators?: Array<{ id: string; name: string }>;
  className?: string;
}

export function ModerationFilters({
  filters,
  onFiltersChange,
  moderators = [],
  className = '',
}: ModerationFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] =
    useState<ModerationFiltersState>(filters);

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'type' && value && value !== 'all'
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'type' && value && value !== 'all'
  ).length;

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsExpanded(false);
  };

  const handleResetFilters = () => {
    const resetFilters: ModerationFiltersState = {
      type: 'all',
      actionType: 'all',
      priority: 'all',
      status: 'all',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleQuickFilter = (
    key: keyof ModerationFiltersState,
    value: string | undefined
  ) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  return (
    <Card className={`p-4 ${className}`}>
      {/* Quick Filters */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Type Filters */}
          <UnifiedButton
            variant={
              filters.type === 'all' || !filters.type ? 'primary' : 'outline'
            }
            size="sm"
            onClick={() => handleQuickFilter('type', 'all')}
            className="h-8"
          >
            Tümü
          </UnifiedButton>
          <UnifiedButton
            variant={filters.type === 'comment' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('type', 'comment')}
            className="h-8"
            leftIcon={<MessageSquare className="h-3 w-3" />}
          >
            Yorumlar
          </UnifiedButton>
          <UnifiedButton
            variant={filters.type === 'review' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('type', 'review')}
            className="h-8"
            leftIcon={<Star className="h-3 w-3" />}
          >
            Değerlendirmeler
          </UnifiedButton>
          <UnifiedButton
            variant={filters.type === 'report' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('type', 'report')}
            className="h-8"
            leftIcon={<Flag className="h-3 w-3" />}
          >
            Şikayetler
          </UnifiedButton>

          {/* Priority Filters */}
          <div className="mx-1 h-6 w-px bg-gray-300" />
          <UnifiedButton
            variant={filters.priority === 'HIGH' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('priority', 'HIGH')}
            className="h-8"
          >
            <AlertTriangle className="h-3 w-3 text-red-500" />
            Yüksek Öncelik
          </UnifiedButton>
        </div>

        {/* Advanced Filters Toggle */}
        <UnifiedButton
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          leftIcon={<Filter className="h-4 w-4" />}
          className="h-8"
        >
          Filtreler
          {activeFilterCount > 0 && (
            <Badge className="bg-primary-500 ml-2 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </UnifiedButton>

        {hasActiveFilters && (
          <UnifiedButton
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            leftIcon={<X className="h-4 w-4" />}
            className="h-8"
          >
            Temizle
          </UnifiedButton>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div>
              <Label
                htmlFor="search"
                className="mb-1 block text-sm font-medium"
              >
                Arama
              </Label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ID, kullanıcı veya içerik ara..."
                  value={localFilters.search || ''}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, search: e.target.value })
                  }
                  className="pl-9"
                />
              </div>
            </div>

            {/* Action Type */}
            <div>
              <Label
                htmlFor="actionType"
                className="mb-1 block text-sm font-medium"
              >
                İşlem Türü
              </Label>
              <Select
                value={localFilters.actionType || 'all'}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    actionType: value as ActionType | 'all',
                  })
                }
              >
                <option value="all">Tümü</option>
                <option value="APPROVE">Onay</option>
                <option value="REJECT">Red</option>
                <option value="SPAM">Spam</option>
                <option value="RESOLVE">Çözüm</option>
                <option value="WARN">Uyarı</option>
                <option value="BAN">Yasak</option>
                <option value="ESCALATE">Yükseltme</option>
              </Select>
            </div>

            {/* Moderator */}
            {moderators.length > 0 && (
              <div>
                <Label
                  htmlFor="moderator"
                  className="mb-1 block text-sm font-medium"
                >
                  Moderatör
                </Label>
                <Select
                  value={localFilters.moderatorId || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      moderatorId: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <option value="all">Tümü</option>
                  {moderators.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Status */}
            <div>
              <Label
                htmlFor="status"
                className="mb-1 block text-sm font-medium"
              >
                Durum
              </Label>
              <Select
                value={localFilters.status || 'all'}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    status: value as
                      | 'PENDING'
                      | 'RESOLVED'
                      | 'DISMISSED'
                      | 'all',
                  })
                }
              >
                <option value="all">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="RESOLVED">Çözüldü</option>
                <option value="DISMISSED">Reddedildi</option>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label className="mb-1 block text-sm font-medium">
                Başlangıç Tarihi
              </Label>
              <Input
                type="date"
                value={
                  localFilters.startDate
                    ? format(localFilters.startDate, 'yyyy-MM-dd')
                    : ''
                }
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    startDate: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <Label className="mb-1 block text-sm font-medium">
                Bitiş Tarihi
              </Label>
              <Input
                type="date"
                value={
                  localFilters.endDate
                    ? format(localFilters.endDate, 'yyyy-MM-dd')
                    : ''
                }
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    endDate: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                max={format(new Date(), 'yyyy-MM-dd')}
                min={
                  localFilters.startDate
                    ? format(localFilters.startDate, 'yyyy-MM-dd')
                    : undefined
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
            >
              Sıfırla
            </UnifiedButton>
            <UnifiedButton size="sm" onClick={handleApplyFilters}>
              Uygula
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-2">
          <span className="text-xs text-gray-500">Aktif filtreler:</span>
          {Object.entries(filters).map(
            ([key, value]) =>
              value &&
              value !== 'all' &&
              key !== 'type' && (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}:{' '}
                  {typeof value === 'object' && value instanceof Date
                    ? format(value, 'PP', { locale: tr })
                    : String(value)}
                  <button
                    onClick={() =>
                      handleQuickFilter(
                        key as keyof ModerationFiltersState,
                        undefined
                      )
                    }
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
          )}
        </div>
      )}
    </Card>
  );
}

export default ModerationFilters;
