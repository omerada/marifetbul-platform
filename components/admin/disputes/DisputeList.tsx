/**
 * DisputeList Component
 * Sprint 1: Order Dispute System - Admin
 *
 * Admin component for listing and managing all disputes
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  DisputeStatus,
  disputeStatusLabels,
  disputeStatusColors,
  disputeReasonLabels,
  type DisputeResponse,
} from '@/types/dispute';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight, Eye, Filter } from 'lucide-react';

interface DisputeListProps {
  disputes: DisputeResponse[];
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onViewDispute?: (disputeId: string) => void;
  onResolveDispute?: (disputeId: string) => void;
  isLoading?: boolean;
}

export default function DisputeList({
  disputes,
  totalCount = 0,
  currentPage = 0,
  pageSize = 20,
  onPageChange,
  onViewDispute,
  onResolveDispute,
  isLoading = false,
}: DisputeListProps) {
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'ALL'>(
    'ALL'
  );

  const filteredDisputes =
    statusFilter === 'ALL'
      ? disputes
      : disputes.filter((d) => d.status === statusFilter);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtreler</CardTitle>
            <Filter className="text-muted-foreground h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Durum</label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as DisputeStatus | 'ALL')
                }
              >
                <SelectTrigger className="w-full" placeholder="Tüm Durumlar" />
                <SelectContent>
                  <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                  {Object.entries(disputeStatusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => setStatusFilter('ALL')}
                size="sm"
              >
                Filtreyi Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>İtirazlar ({filteredDisputes.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              {statusFilter === 'ALL'
                ? 'Henüz itiraz bulunmuyor'
                : `${disputeStatusLabels[statusFilter as DisputeStatus]} durumunda itiraz bulunmuyor`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş ID</TableHead>
                    <TableHead>İtiraz Eden</TableHead>
                    <TableHead>Neden</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Oluşturma Tarihi</TableHead>
                    <TableHead>Çözüm Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-medium">
                        {dispute.orderId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{dispute.raisedByUserFullName}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {disputeReasonLabels[dispute.reason]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={disputeStatusColors[dispute.status]}>
                          {disputeStatusLabels[dispute.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(dispute.createdAt),
                          'dd MMM yyyy HH:mm',
                          {
                            locale: tr,
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {dispute.resolvedAt
                          ? format(
                              new Date(dispute.resolvedAt),
                              'dd MMM yyyy HH:mm',
                              {
                                locale: tr,
                              }
                            )
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDispute?.(dispute.id)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Görüntüle
                          </Button>
                          {dispute.status !== DisputeStatus.RESOLVED &&
                            dispute.status !== DisputeStatus.CLOSED && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onResolveDispute?.(dispute.id)}
                              >
                                Çözümle
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-sm">
                Sayfa {currentPage + 1} / {totalPages} ({totalCount} toplam)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
