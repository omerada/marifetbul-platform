'use client';

/**
 * ================================================
 * COMMISSION RULES MANAGEMENT COMPONENT
 * ================================================
 * Interface for managing commission rules
 *
 * Features:
 * - List all commission rules
 * - Create new rules
 * - Edit existing rules
 * - Activate/deactivate rules
 * - Delete rules
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Day 2 - Commission UI
 * @since 2025-11-14
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCommissions } from '@/hooks/business/useCommissions';
import { formatDate } from '@/lib/shared/formatters';
import type { CommissionRule } from '@/lib/api/commission';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';
import { CommissionRuleFormModal } from './CommissionRuleFormModal';

// ================================================
// TYPES
// ================================================

type RuleType = 'ALL' | 'GLOBAL' | 'CATEGORY' | 'USER';
type RuleStatus = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface Filters {
  ruleType: RuleType;
  status: RuleStatus;
  search: string;
}

// ================================================
// MAIN COMPONENT
// ================================================

export const CommissionRulesManagement: React.FC = () => {
  const {
    rules,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule,
    activateRule,
    deactivateRule,
    fetchRules,
    refresh,
  } = useCommissions();

  // ==================== STATE ====================

  const [filters, setFilters] = useState<Filters>({
    ruleType: 'ALL',
    status: 'ALL',
    search: '',
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ==================== EFFECTS ====================

  useEffect(() => {
    const loadRules = async () => {
      try {
        await fetchRules();
      } catch (err) {
        logger.error('Failed to load commission rules', err as Error);
        toast.error('Kurallar yüklenemedi');
      }
    };

    loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== HANDLERS ====================

  const handleCreateRule = () => {
    setSelectedRule(null);
    setIsFormModalOpen(true);
  };

  const handleEditRule = (rule: CommissionRule) => {
    setSelectedRule(rule);
    setIsFormModalOpen(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Bu kuralı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteRule(ruleId);
      toast.success('Kural silindi');
    } catch (err) {
      logger.error('Failed to delete rule', err as Error);
      toast.error('Kural silinemedi');
    }
  };

  const handleToggleActive = async (rule: CommissionRule) => {
    try {
      if (rule.isActive) {
        await deactivateRule(rule.id);
        toast.success('Kural devre dışı bırakıldı');
      } else {
        await activateRule(rule.id);
        toast.success('Kural etkinleştirildi');
      }
    } catch (err) {
      logger.error('Failed to toggle rule status', err as Error);
      toast.error('Durum değiştirilemedi');
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Veriler yenilendi');
    } catch (err) {
      logger.error('Failed to refresh rules', err as Error);
      toast.error('Yenileme başarısız');
    }
  };

  const handleFormSubmit = async (
    data: import('@/lib/api/commission').CommissionRuleRequest
  ) => {
    try {
      if (selectedRule) {
        await updateRule(selectedRule.id, data);
        toast.success('Kural güncellendi');
      } else {
        await createRule(data);
        toast.success('Kural oluşturuldu');
      }
      setIsFormModalOpen(false);
      setSelectedRule(null);
    } catch (err) {
      logger.error('Failed to save rule', err as Error);
      toast.error('Kural kaydedilemedi');
    }
  };

  // ==================== FILTERING ====================

  const filteredRules = rules.filter((rule) => {
    // Type filter
    if (filters.ruleType !== 'ALL' && rule.ruleType !== filters.ruleType) {
      return false;
    }

    // Status filter
    if (filters.status === 'ACTIVE' && !rule.isActive) return false;
    if (filters.status === 'INACTIVE' && rule.isActive) return false;

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesDescription = rule.description
        ?.toLowerCase()
        .includes(search);
      const matchesRate = rule.rate.toString().includes(search);
      return matchesDescription || matchesRate;
    }

    return true;
  });

  // ==================== STATS ====================

  const activeCount = rules.filter((r) => r.isActive).length;
  const inactiveCount = rules.length - activeCount;

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleCreateRule}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kural Ekle
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtrele
          </Button>
        </div>
        <Button variant="outline" onClick={handleRefresh} loading={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Toplam Kural</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {rules.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Aktif</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {activeCount}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">İnaktif</div>
          <div className="mt-1 text-2xl font-bold text-gray-400">
            {inactiveCount}
          </div>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ara
              </label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2"
                  placeholder="Açıklama veya oran..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Kural Tipi
              </label>
              <select
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
                value={filters.ruleType}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    ruleType: e.target.value as RuleType,
                  }))
                }
              >
                <option value="ALL">Tümü</option>
                <option value="GLOBAL">Global</option>
                <option value="CATEGORY">Kategori</option>
                <option value="USER">Kullanıcı</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Durum
              </label>
              <select
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as RuleStatus,
                  }))
                }
              >
                <option value="ALL">Tümü</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">İnaktif</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Rules List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Oran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Geçerlilik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={6}>
                      <Skeleton className="h-12" />
                    </td>
                  </tr>
                ))
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-gray-500"
                    colSpan={6}
                  >
                    Kural bulunamadı
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">{rule.ruleType}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        %{(rule.rate * 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {rule.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(rule.validFrom)}
                      </div>
                      {rule.validTo && (
                        <div className="text-xs text-gray-500">
                          → {formatDate(rule.validTo)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={rule.isActive ? 'success' : 'outline'}>
                        {rule.isActive ? 'Aktif' : 'İnaktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(rule)}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          title={
                            rule.isActive ? 'Devre dışı bırak' : 'Etkinleştir'
                          }
                        >
                          {rule.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded p-1"
                          title="Düzenle"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-900"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {/* Form Modal */}
      <CommissionRuleFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedRule(null);
        }}
        onSubmit={handleFormSubmit}
        rule={selectedRule}
      />
    </div>
  );
};

export default CommissionRulesManagement;
