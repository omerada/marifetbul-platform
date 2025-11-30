'use client';

/**
 * ================================================
 * ADMIN WALLET FILTERS COMPONENT
 * ================================================
 * Filter component for wallet management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import type { WalletFilters } from '@/lib/api/admin/wallet-admin-api';
import type { WalletStatus } from '@/types/business/features/wallet';
import { X } from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface AdminWalletFiltersProps {
  filters: WalletFilters;
  onFiltersChange: (filters: WalletFilters) => void;
  onClear: () => void;
}

// ================================================
// COMPONENT
// ================================================

export const AdminWalletFilters: React.FC<AdminWalletFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [localFilters, setLocalFilters] = useState<WalletFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof WalletFilters, value: string | number) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  const hasActiveFilters =
    Object.keys(filters).filter((key) => key !== 'page' && key !== 'size')
      .length > 0;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="mr-1 h-4 w-4" />
              Temizle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Durum</Label>
            <select
              id="status"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={localFilters.status || ''}
              onChange={(e) =>
                handleChange('status', e.target.value as WalletStatus)
              }
            >
              <option value="">Tümü</option>
              <option value="ACTIVE">Aktif</option>
              <option value="SUSPENDED">Askıda</option>
              <option value="CLOSED">Kapalı</option>
            </select>
          </div>

          {/* Min Balance */}
          <div className="space-y-2">
            <Label htmlFor="minBalance">Minimum Bakiye</Label>
            <Input
              id="minBalance"
              type="number"
              placeholder="0"
              value={localFilters.minBalance || ''}
              onChange={(e) =>
                handleChange('minBalance', parseFloat(e.target.value) || 0)
              }
            />
          </div>

          {/* Max Balance */}
          <div className="space-y-2">
            <Label htmlFor="maxBalance">Maximum Bakiye</Label>
            <Input
              id="maxBalance"
              type="number"
              placeholder="1000000"
              value={localFilters.maxBalance || ''}
              onChange={(e) =>
                handleChange('maxBalance', parseFloat(e.target.value) || 0)
              }
            />
          </div>

          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="searchQuery">Kullanıcı Ara</Label>
            <Input
              id="searchQuery"
              type="text"
              placeholder="İsim, email..."
              value={localFilters.searchQuery || ''}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy">Sıralama</Label>
            <select
              id="sortBy"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={localFilters.sortBy || 'createdAt'}
              onChange={(e) =>
                handleChange(
                  'sortBy',
                  e.target.value as 'balance' | 'createdAt' | 'updatedAt'
                )
              }
            >
              <option value="createdAt">Oluşturulma Tarihi</option>
              <option value="updatedAt">Güncellenme Tarihi</option>
              <option value="balance">Bakiye</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div className="space-y-2">
            <Label htmlFor="sortDirection">Yön</Label>
            <select
              id="sortDirection"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={localFilters.sortDirection || 'desc'}
              onChange={(e) =>
                handleChange('sortDirection', e.target.value as 'asc' | 'desc')
              }
            >
              <option value="desc">Azalan</option>
              <option value="asc">Artan</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleApply}>Filtreleri Uygula</Button>
        </div>
      </div>
    </Card>
  );
};

export default AdminWalletFilters;
