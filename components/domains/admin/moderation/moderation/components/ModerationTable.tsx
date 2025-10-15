/**
 * ModerationTable Component
 *
 * Table wrapper for moderation items
 */

import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { ModerationRow } from './ModerationRow';
import type { ModerationTableProps } from '../types/moderationTypes';

export function ModerationTable({
  items,
  isLoading,
  onActionClick,
  onViewDetails,
}: ModerationTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İçerik</TableHead>
                <TableHead>Rapor Eden</TableHead>
                <TableHead>Sebep</TableHead>
                <TableHead>Öncelik</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Yükleniyor...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-gray-500"
                  >
                    Moderasyon öğesi bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                items
                  .filter((item) => item && item.id)
                  .map((item) => (
                    <ModerationRow
                      key={item.id}
                      item={item}
                      onActionClick={(action) => onActionClick(item, action)}
                      onViewDetails={() => onViewDetails(item)}
                    />
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
