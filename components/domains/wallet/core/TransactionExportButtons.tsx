'use client';

/**
 * ================================================
 * TRANSACTION EXPORT BUTTONS
 * ================================================
 * Export buttons for transaction history (CSV & PDF)
 *
 * Features:
 * - CSV export with UTF-8 BOM
 * - PDF export with professional template
 * - Date range filtering
 * - Transaction type filtering
 * - Loading states
 * - Error handling
 *
 * Sprint 1, Story 1.2
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks';
import type { TransactionType } from '@/types/business/features/wallet';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface TransactionExportButtonsProps {
  /** Transaction type filter (optional) */
  type?: TransactionType;

  /** Start date filter (optional, format: yyyy-MM-dd) */
  startDate?: string;

  /** End date filter (optional, format: yyyy-MM-dd) */
  endDate?: string;

  /** Admin mode (export all transactions) */
  isAdmin?: boolean;

  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Button variant */
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'success'
    | 'warning';

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TransactionExportButtons({
  type,
  startDate,
  endDate,
  isAdmin = false,
  size = 'md',
  variant = 'outline',
  className = '',
}: TransactionExportButtonsProps) {
  const { success, error } = useToast();
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  /**
   * Build query string for export
   */
  const buildQueryString = (): string => {
    const params = new URLSearchParams();

    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return params.toString();
  };

  /**
   * Handle CSV export
   */
  const handleExportCSV = async () => {
    try {
      setIsExportingCSV(true);

      const baseUrl = isAdmin
        ? '/api/v1/admin/transactions/export/csv'
        : '/api/v1/transactions/export/csv';

      const queryString = buildQueryString();
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'transactions.csv';

      // Download file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      success('Başarılı', 'İşlem geçmişi CSV olarak indirildi');
    } catch (err) {
      logger.error('CSV export error', err as Error);
      error('Hata', 'CSV dosyası indirilemedi');
    } finally {
      setIsExportingCSV(false);
    }
  };

  /**
   * Handle PDF export
   */
  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);

      const baseUrl = isAdmin
        ? '/api/v1/admin/transactions/export/pdf'
        : '/api/v1/transactions/export/pdf';

      const queryString = buildQueryString();
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'transactions.pdf';

      // Download file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      success('Başarılı', 'İşlem geçmişi PDF olarak indirildi');
    } catch (err) {
      logger.error('PDF export error', err as Error);
      error('Hata', 'PDF dosyası indirilemedi');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleExportCSV}
        disabled={isExportingCSV || isExportingPDF}
        size={size}
        variant={variant}
        className="gap-2"
      >
        {isExportingCSV ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        CSV İndir
      </Button>

      <Button
        onClick={handleExportPDF}
        disabled={isExportingCSV || isExportingPDF}
        size={size}
        variant={variant}
        className="gap-2"
      >
        {isExportingPDF ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        PDF İndir
      </Button>
    </div>
  );
}
