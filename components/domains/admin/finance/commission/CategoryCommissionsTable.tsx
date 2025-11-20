/**
 * ================================================
 * CATEGORY COMMISSIONS TABLE - UNIFIED VERSION
 * ================================================
 * Sprint 2 - Migration to UnifiedDataTable
 * 220+ lines → ~120 lines (-45%)
 */

'use client';

import React, { useMemo, useState } from 'react';
import { UnifiedDataTable } from '@/lib/components/unified/UnifiedDataTable';
import type { Column } from '@/lib/components/unified/UnifiedDataTable';
import { Pencil, RotateCcw, Check, X } from 'lucide-react';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { useCategoryCommissions } from '@/hooks';
import type { CategoryCommission } from '@/lib/api/admin/types';

interface EditingState {
  categoryId: string | null;
  rate: number | null;
}

export function CategoryCommissionsTable() {
  const {
    commissions,
    isLoading,
    updateCommission,
    resetCommission,
    isUpdating,
  } = useCategoryCommissions();
  const [editing, setEditing] = useState<EditingState>({
    categoryId: null,
    rate: null,
  });
  const [updateReason, setUpdateReason] = useState('');

  const columns = useMemo<Column<CategoryCommission>[]>(
    () => [
      {
        id: 'category',
        header: 'Kategori',
        accessor: 'categoryName',
        sortable: true,
      },
      {
        id: 'commission',
        header: 'Komisyon Oranı',
        render: (_, commission) => {
          const isEditing = editing.categoryId === commission.categoryId;
          if (isEditing) {
            return (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  max="50"
                  value={editing.rate ?? ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      rate: parseFloat(e.target.value) || null,
                    })
                  }
                  className="w-24"
                  placeholder="%"
                />
                <span className="text-muted-foreground text-sm">%</span>
              </div>
            );
          }
          return (
            <span>
              {commission.useDefaultRate
                ? 'Varsayılan'
                : `%${commission.commissionRate?.toFixed(2)}`}
            </span>
          );
        },
      },
      {
        id: 'orders',
        header: 'Sipariş Sayısı',
        accessor: 'totalOrders',
        render: (value) => (value as number).toLocaleString('tr-TR'),
        sortable: true,
      },
      {
        id: 'earnings',
        header: 'Toplam Komisyon',
        accessor: 'totalCommissionEarned',
        formatter: 'currency',
        sortable: true,
      },
      {
        id: 'actions',
        header: 'İşlemler',
        align: 'right',
        render: (_, commission) => {
          const isEditing = editing.categoryId === commission.categoryId;
          const saveEdit = (useDefault: boolean) => {
            if (!updateReason || updateReason.length < 10) {
              alert('Güncelleme nedeni en az 10 karakter olmalıdır');
              return;
            }
            updateCommission(
              commission.categoryId,
              {
                commissionRate: useDefault ? null : editing.rate,
                useDefaultRate: useDefault,
                updateReason,
              },
              {
                onSuccess: () => {
                  setEditing({ categoryId: null, rate: null });
                  setUpdateReason('');
                },
              }
            );
          };

          const handleReset = () => {
            if (!updateReason || updateReason.length < 10) {
              alert('Güncelleme nedeni en az 10 karakter olmalıdır');
              return;
            }
            resetCommission(commission.categoryId, {
              onSuccess: () => setUpdateReason(''),
            });
          };

          if (isEditing) {
            return (
              <div className="flex items-center justify-end gap-2">
                <UnifiedButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => saveEdit(false)}
                  disabled={isUpdating || editing.rate === null}
                >
                  <Check className="h-4 w-4" />
                </UnifiedButton>
                <UnifiedButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing({ categoryId: null, rate: null });
                    setUpdateReason('');
                  }}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </UnifiedButton>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-end gap-2">
              <UnifiedButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setEditing({
                    categoryId: commission.categoryId,
                    rate: commission.commissionRate,
                  })
                }
                disabled={isUpdating}
              >
                <Pencil className="h-4 w-4" />
              </UnifiedButton>
              {!commission.useDefaultRate && (
                <UnifiedButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isUpdating}
                >
                  <RotateCcw className="h-4 w-4" />
                </UnifiedButton>
              )}
            </div>
          );
        },
      },
    ],
    [editing, updateReason, isUpdating, updateCommission, resetCommission]
  );

  return (
    <div className="space-y-4">
      <UnifiedDataTable<CategoryCommission>
        data={commissions}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Henüz kategori bulunamadı"
        sorting={{
          enabled: true,
          serverSide: false,
        }}
        hoverable
        className="rounded-lg border"
      />

      {editing.categoryId && (
        <div className="rounded-lg border p-4">
          <label className="mb-2 block text-sm font-medium">
            Güncelleme Nedeni (zorunlu)
          </label>
          <Input
            type="text"
            placeholder="Örn: Kategori performansına göre oran ayarlandı"
            value={updateReason}
            onChange={(e) => setUpdateReason(e.target.value)}
            className="w-full"
          />
          <p className="text-muted-foreground mt-1 text-sm">En az 10 karakter</p>
        </div>
      )}
    </div>
  );
}
