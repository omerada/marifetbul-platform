'use client';

import React, { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  Flag,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { Card, Button, Loading } from '@/components/ui';
import type { DisputeResponse, DisputeStatus } from '@/types/dispute';

/**
 * AdminDisputeQueue - Admin panel dispute management table
 *
 * Features:
 * - Table view of all disputes
 * - Status filters (ALL, OPEN, UNDER_REVIEW, RESOLVED, CLOSED, ESCALATED)
 * - Search by ID, order ID, or user
 * - Bulk selection and actions
 * - Resolution actions (view details, resolve, escalate)
 * - Real-time status updates
 *
 * @example
 * ```tsx
 * <AdminDisputeQueue
 *   disputes={disputes}
 *   isLoading={isLoading}
 *   onRefresh={handleRefresh}
 *   onResolveDispute={(id) => setSelectedDisputeId(id)}
 *   onViewDetails={(id) => router.push(`/admin/disputes/${id}`)}
 * />
 * ```
 */

interface AdminDisputeQueueProps {
  disputes: DisputeResponse[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onResolveDispute?: (disputeId: string) => void;
  onViewDetails?: (disputeId: string) => void;
  onEscalate?: (disputeId: string) => void;
}

const statusColors: Record<DisputeStatus, string> = {
  OPEN: 'bg-red-100 text-red-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  AWAITING_BUYER_RESPONSE: 'bg-blue-100 text-blue-800',
  AWAITING_SELLER_RESPONSE: 'bg-purple-100 text-purple-800',
  ESCALATED: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const statusIcons: Record<DisputeStatus, React.ReactNode> = {
  OPEN: <Clock className="h-4 w-4" />,
  UNDER_REVIEW: <AlertTriangle className="h-4 w-4" />,
  AWAITING_BUYER_RESPONSE: <Clock className="h-4 w-4" />,
  AWAITING_SELLER_RESPONSE: <Clock className="h-4 w-4" />,
  ESCALATED: <Flag className="h-4 w-4" />,
  RESOLVED: <CheckCircle className="h-4 w-4" />,
  CLOSED: <XCircle className="h-4 w-4" />,
};

const statusLabels: Record<DisputeStatus, string> = {
  OPEN: 'Açık',
  UNDER_REVIEW: 'İncelemede',
  AWAITING_BUYER_RESPONSE: 'Alıcı Yanıtı Bekleniyor',
  AWAITING_SELLER_RESPONSE: 'Satıcı Yanıtı Bekleniyor',
  ESCALATED: 'Yükseltildi',
  RESOLVED: 'Çözüldü',
  CLOSED: 'Kapatıldı',
};

type FilterStatus = DisputeStatus | 'ALL';

export const AdminDisputeQueue: React.FC<AdminDisputeQueueProps> = ({
  disputes,
  isLoading = false,
  onRefresh,
  onResolveDispute,
  onViewDetails,
  onEscalate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisputes, setSelectedDisputes] = useState<Set<string>>(
    new Set()
  );

  // Filter disputes based on status and search
  const filteredDisputes = useMemo(() => {
    let filtered = disputes;

    // Status filter
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((d) => d.status === selectedStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.id.toLowerCase().includes(query) ||
          d.orderId.toLowerCase().includes(query) ||
          d.raisedByUserFullName.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [disputes, selectedStatus, searchQuery]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      ALL: disputes.length,
      OPEN: disputes.filter((d) => d.status === 'OPEN').length,
      UNDER_REVIEW: disputes.filter((d) => d.status === 'UNDER_REVIEW').length,
      AWAITING_BUYER_RESPONSE: disputes.filter(
        (d) => d.status === 'AWAITING_BUYER_RESPONSE'
      ).length,
      AWAITING_SELLER_RESPONSE: disputes.filter(
        (d) => d.status === 'AWAITING_SELLER_RESPONSE'
      ).length,
      RESOLVED: disputes.filter((d) => d.status === 'RESOLVED').length,
      CLOSED: disputes.filter((d) => d.status === 'CLOSED').length,
    };
  }, [disputes]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedDisputes.size === filteredDisputes.length) {
      setSelectedDisputes(new Set());
    } else {
      setSelectedDisputes(new Set(filteredDisputes.map((d) => d.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedDisputes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDisputes(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Title and Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                İtiraz Kuyruğu
              </h2>
              <p className="text-sm text-gray-600">
                {filteredDisputes.length} itiraz görüntüleniyor
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Yenile
            </Button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                'ALL',
                'OPEN',
                'UNDER_REVIEW',
                'AWAITING_BUYER_RESPONSE',
                'AWAITING_SELLER_RESPONSE',
                'RESOLVED',
                'CLOSED',
              ] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status as FilterStatus)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL'
                  ? 'Tümü'
                  : statusLabels[status as DisputeStatus]}{' '}
                ({statusCounts[status as keyof typeof statusCounts]})
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="İtiraz ID, Sipariş ID veya Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Bulk Actions */}
          {selectedDisputes.size > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedDisputes.size} itiraz seçildi
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Toplu İnceleme
                </Button>
                <Button variant="outline" size="sm">
                  Toplu Çözüm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDisputes(new Set())}
                >
                  Seçimi Temizle
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Disputes Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filteredDisputes.length > 0 &&
                      selectedDisputes.size === filteredDisputes.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  İtiraz ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Sipariş
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Şikayetçi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Şikayet Edilen
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Sebep
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Tarih
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Loading text="Yükleniyor..." />
                  </td>
                </tr>
              ) : filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Filter className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          İtiraz Bulunamadı
                        </p>
                        <p className="text-sm text-gray-600">
                          {searchQuery
                            ? 'Arama kriterlerinize uygun itiraz bulunamadı'
                            : 'Bu durumda henüz itiraz yok'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((dispute) => (
                  <tr
                    key={dispute.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDisputes.has(dispute.id)}
                        onChange={() => handleSelectOne(dispute.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm text-gray-900">
                        #{dispute.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="cursor-pointer font-mono text-sm text-blue-600 hover:underline">
                        #{dispute.orderId.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">
                        {dispute.raisedByUserFullName}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        Sipariş Sahibi
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {dispute.description.length > 30
                          ? `${dispute.description.slice(0, 30)}...`
                          : dispute.description}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusColors[dispute.status]
                        }`}
                      >
                        {statusIcons[dispute.status]}
                        {statusLabels[dispute.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(dispute.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetails?.(dispute.id)}
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                          title="Detayları Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {dispute.status === 'OPEN' && (
                          <button
                            onClick={() => onResolveDispute?.(dispute.id)}
                            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-green-600"
                            title="Çözümle"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {dispute.status === 'UNDER_REVIEW' && (
                          <button
                            onClick={() => onEscalate?.(dispute.id)}
                            className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-purple-600"
                            title="Yükselt"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          title="Kanıtları Görüntüle"
                        >
                          <FileText className="h-4 w-4" />
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
    </div>
  );
};

export default AdminDisputeQueue;
