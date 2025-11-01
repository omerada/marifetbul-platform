'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { AdminDisputeTable } from './AdminDisputeTable';
import { useAdminDisputeList } from '@/hooks/business/disputes';
import { DisputeStatus, DisputeReason } from '@/types/dispute';

export function AdminDisputeList() {
  const [filters, setFilters] = useState({
    status: '' as DisputeStatus | '',
    reason: '' as DisputeReason | '',
    search: '',
  });

  const { disputes, isLoading, error, mutate } = useAdminDisputeList();

  const handleExport = () => {
    // TODO: Implement CSV export
    // eslint-disable-next-line no-console
    console.log('Exporting disputes...');
  };

  const handleRefresh = () => {
    mutate();
  };

  const filteredDisputes = disputes?.filter((dispute) => {
    if (filters.status && dispute.status !== filters.status) return false;
    if (filters.reason && dispute.reason !== filters.reason) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        dispute.id.toLowerCase().includes(searchLower) ||
        dispute.raisedByUserFullName.toLowerCase().includes(searchLower) ||
        dispute.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İtiraz Yönetimi</h1>
          <p className="text-muted-foreground">
            Tüm itirazları yönetin ve çözümleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrele</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Arama</label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="ID, kullanıcı veya açıklama..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Durum</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status: value as DisputeStatus | '',
                  })
                }
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="">Tüm durumlar</SelectItem>
                  <SelectItem value="OPEN">Açık</SelectItem>
                  <SelectItem value="UNDER_REVIEW">İnceleniyor</SelectItem>
                  <SelectItem value="AWAITING_BUYER_RESPONSE">
                    Alıcı Yanıtı Bekleniyor
                  </SelectItem>
                  <SelectItem value="AWAITING_SELLER_RESPONSE">
                    Satıcı Yanıtı Bekleniyor
                  </SelectItem>
                  <SelectItem value="RESOLVED">Çözümlendi</SelectItem>
                  <SelectItem value="CLOSED">Kapatıldı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Neden</label>
              <Select
                value={filters.reason}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    reason: value as DisputeReason | '',
                  })
                }
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="">Tüm nedenler</SelectItem>
                  <SelectItem value="QUALITY_ISSUE">Kalite Sorunu</SelectItem>
                  <SelectItem value="DELIVERY_NOT_RECEIVED">
                    Teslimat Alınmadı
                  </SelectItem>
                  <SelectItem value="INCOMPLETE_WORK">Eksik İş</SelectItem>
                  <SelectItem value="NOT_AS_DESCRIBED">
                    Açıklamaya Uygun Değil
                  </SelectItem>
                  <SelectItem value="COMMUNICATION_ISSUE">
                    İletişim Sorunu
                  </SelectItem>
                  <SelectItem value="DEADLINE_MISSED">
                    Termin Kaçırıldı
                  </SelectItem>
                  <SelectItem value="UNAUTHORIZED_WORK">Yetkisiz İş</SelectItem>
                  <SelectItem value="OTHER">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(filters.status || filters.reason || filters.search) && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters({ status: '', reason: '', search: '' })
                }
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <AdminDisputeTable
        disputes={filteredDisputes || []}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
