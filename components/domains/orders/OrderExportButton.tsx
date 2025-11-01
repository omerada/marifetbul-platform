/**
 * ================================================
 * ORDER EXPORT BUTTON
 * ================================================
 * Export orders to CSV/Excel format
 *
 * Features:
 * - CSV export
 * - Excel export (optional)
 * - Custom column selection
 * - Date range export
 * - Loading state
 * - Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/shared/utils/logger';
import type { Order } from '@/types/business/features/orders';

// ================================================
// TYPES
// ================================================

interface OrderExportButtonProps {
  /** Orders to export */
  orders: Order[];
  /** Export format */
  format?: 'csv' | 'excel';
  /** File name prefix */
  fileNamePrefix?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function formatOrderForExport(order: Order) {
  return {
    'Sipariş No': order.orderNumber || order.id,
    'Durum': order.status,
    'Alıcı': order.buyer?.username || order.buyer?.email || '-',
    'Satıcı': order.seller?.username || order.seller?.email || '-',
    'Paket/Hizmet': order.customOrderDetails?.title || order.packageDetails?.packageTitle || '-',
    'Tutar': order.totalAmount || order.amount || 0,
    'Para Birimi': order.currency || 'TRY',
    'Oluşturulma Tarihi': new Date(order.createdAt).toLocaleString('tr-TR'),
    'Son Tarih': order.deadline ? new Date(order.deadline).toLocaleString('tr-TR') : '-',
    'Tamamlanma Tarihi': order.completedAt ? new Date(order.completedAt).toLocaleString('tr-TR') : '-',
    'Ödeme Durumu': order.paymentStatus || '-',
  };
}

function convertToCSV(orders: Order[]): string {
  if (orders.length === 0) return '';

  const formattedOrders = orders.map(formatOrderForExport);
  const headers = Object.keys(formattedOrders[0]);
  
  // CSV header row
  const csvHeader = headers.join(',');
  
  // CSV data rows
  const csvRows = formattedOrders.map(order => 
    headers.map(header => {
      const value = order[header as keyof typeof order];
      // Escape commas and quotes in values
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  return [csvHeader, ...csvRows].join('\n');
}

function downloadCSV(csvContent: string, fileName: string) {
  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// ================================================
// MAIN COMPONENT
// ================================================

export function OrderExportButton({
  orders,
  format = 'csv',
  fileNamePrefix = 'siparisler',
  variant = 'outline',
  size = 'sm',
  disabled = false,
}: OrderExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  // ================================================
  // HANDLERS
  // ================================================

  const handleExport = async () => {
    if (orders.length === 0) {
      toast.error('Dışa Aktarma Hatası', {
        description: 'Dışa aktarılacak sipariş bulunamadı',
      });
      return;
    }

    try {
      setIsExporting(true);

      if (format === 'csv') {
        // Generate CSV
        const csvContent = convertToCSV(orders);
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `${fileNamePrefix}_${timestamp}.csv`;
        
        // Download
        downloadCSV(csvContent, fileName);
        
        toast.success('Dışa Aktarma Başarılı', {
          description: `${orders.length} sipariş CSV formatında indirildi`,
        });
      } else if (format === 'excel') {
        // Excel export can be implemented with a library like xlsx
        toast.info('Excel dışa aktarma yakında eklenecek');
      }
    } catch (error) {
      logger.error('Export error:', error);
      toast.error('Dışa Aktarma Hatası', {
        description: 'Siparişler dışa aktarılırken bir hata oluştu',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={disabled || isExporting || orders.length === 0}
      className="flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Dışa Aktarılıyor...
        </>
      ) : (
        <>
          {format === 'csv' ? (
            <FileText className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {format === 'csv' ? 'CSV İndir' : 'Excel İndir'}
          {orders.length > 0 && ` (${orders.length})`}
        </>
      )}
    </Button>
  );
}
