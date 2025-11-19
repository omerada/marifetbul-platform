/**
 * ================================================
 * CATEGORY COMMISSIONS TABLE
 * ================================================
 * Editable table for managing category-specific commission rates
 *
 * Sprint: Admin Commission Management
 * Story: Category Commission Management (3 SP)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint Day 2
 */

'use client';

import { useState } from 'react';
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

  const startEdit = (categoryId: string, currentRate: number | null) => {
    setEditing({ categoryId, rate: currentRate });
  };

  const cancelEdit = () => {
    setEditing({ categoryId: null, rate: null });
    setUpdateReason('');
  };

  const saveEdit = (categoryId: string, useDefault: boolean) => {
    if (!updateReason || updateReason.length < 10) {
      alert('Güncelleme nedeni en az 10 karakter olmalıdır');
      return;
    }

    updateCommission(
      categoryId,
      {
        commissionRate: useDefault ? null : editing.rate,
        useDefaultRate: useDefault,
        updateReason,
      },
      {
        onSuccess: () => {
          cancelEdit();
        },
      }
    );
  };

  const handleReset = (categoryId: string) => {
    if (!updateReason || updateReason.length < 10) {
      alert('Güncelleme nedeni en az 10 karakter olmalıdır');
      return;
    }

    resetCommission(categoryId, {
      onSuccess: () => {
        setUpdateReason('');
      },
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  if (!commissions || commissions.length === 0) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        Henüz kategori bulunamadı
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="p-4 text-left font-medium">Kategori</th>
              <th className="p-4 text-left font-medium">Komisyon Oranı</th>
              <th className="p-4 text-left font-medium">Sipariş Sayısı</th>
              <th className="p-4 text-left font-medium">Toplam Komisyon</th>
              <th className="p-4 text-right font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map(
              (commission: CategoryCommission, index: number) => {
                const isEditing = editing.categoryId === commission.categoryId;

                return (
                  <tr
                    key={`${commission.id}-${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="p-4 font-medium">
                      {commission.categoryName}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
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
                          <span className="text-muted-foreground text-sm">
                            %
                          </span>
                        </div>
                      ) : (
                        <span>
                          {commission.useDefaultRate
                            ? 'Varsayılan'
                            : `%${commission.commissionRate?.toFixed(2)}`}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {commission.totalOrders.toLocaleString('tr-TR')}
                    </td>
                    <td className="p-4">
                      {commission.totalCommissionEarned.toLocaleString(
                        'tr-TR',
                        {
                          style: 'currency',
                          currency: 'TRY',
                        }
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <UnifiedButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                saveEdit(commission.categoryId, false)
                              }
                              disabled={isUpdating || editing.rate === null}
                            >
                              <Check className="h-4 w-4" />
                            </UnifiedButton>
                            <UnifiedButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              disabled={isUpdating}
                            >
                              <X className="h-4 w-4" />
                            </UnifiedButton>
                          </>
                        ) : (
                          <>
                            <UnifiedButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                startEdit(
                                  commission.categoryId,
                                  commission.commissionRate
                                )
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
                                onClick={() =>
                                  handleReset(commission.categoryId)
                                }
                                disabled={isUpdating}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </UnifiedButton>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

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
          <p className="text-muted-foreground mt-1 text-sm">
            En az 10 karakter
          </p>
        </div>
      )}
    </div>
  );
}
