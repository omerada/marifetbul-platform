'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Eye, Loader2, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import type { DisputeResponse } from '@/types/dispute';
import { disputeStatusLabels, disputeReasonLabels } from '@/types/dispute';

interface AdminDisputeTableProps {
  disputes: DisputeResponse[];
  isLoading: boolean;
  error: string | null;
}

const statusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  OPEN: 'destructive',
  UNDER_REVIEW: 'default',
  AWAITING_BUYER_RESPONSE: 'secondary',
  AWAITING_SELLER_RESPONSE: 'secondary',
  RESOLVED: 'outline',
  CLOSED: 'outline',
};

export function AdminDisputeTable({
  disputes,
  isLoading,
  error,
}: AdminDisputeTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'İtirazlar yüklenirken bir hata oluştu'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!disputes || disputes.length === 0) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">İtiraz Bulunamadı</h3>
        <p className="text-muted-foreground">
          Filtrelerinize uygun itiraz bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Sipariş</TableHead>
            <TableHead>Açan</TableHead>
            <TableHead>Neden</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Oluşturulma</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes.map((dispute) => (
            <TableRow key={dispute.id}>
              <TableCell className="font-mono text-xs">
                {dispute.id.slice(0, 8)}...
              </TableCell>
              <TableCell className="font-mono text-xs">
                <Link
                  href={`/admin/orders/${dispute.orderId}`}
                  className="text-primary hover:underline"
                >
                  {dispute.orderId.slice(0, 8)}...
                </Link>
              </TableCell>
              <TableCell>{dispute.raisedByUserFullName}</TableCell>
              <TableCell>
                <span className="text-sm">
                  {disputeReasonLabels[dispute.reason]}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[dispute.status] || 'default'}>
                  {disputeStatusLabels[dispute.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(dispute.createdAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/disputes/${dispute.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Görüntüle
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
