/**
 * ================================================
 * INVOICE DOWNLOAD BUTTON COMPONENT
 * ================================================
 * Sprint 1.4: Invoice Download System - Frontend (3 SP)
 *
 * Features:
 * ✅ Check invoice availability
 * ✅ Download invoice PDF
 * ✅ Send invoice via email
 * ✅ Loading states
 * ✅ Error handling
 * ✅ Download progress
 *
 * Usage:
 * ```tsx
 *             <InvoiceDownloadButton orderId={orderId} variant="primary" size="sm" />
 * ```
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1.4 - Invoice System
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';
import { FileText, Download, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ==================== TYPES ====================

interface InvoiceMetadata {
  id: string;
  orderId: string;
  invoiceNumber: string;
  generatedAt: string;
  totalAmount: number;
  currency: string;
  taxAmount: number;
  taxRate: number;
  downloadCount: number;
  emailSent: boolean;
  emailSentAt: string | null;
}

interface InvoiceDownloadButtonProps {
  orderId: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'md' | 'sm' | 'lg';
  showEmailButton?: boolean;
  onDownloadSuccess?: () => void;
  onEmailSuccess?: () => void;
}

// ==================== MAIN COMPONENT ====================

export function InvoiceDownloadButton({
  orderId,
  className,
  variant = 'primary',
  size = 'md',
  showEmailButton = true,
  onDownloadSuccess,
  onEmailSuccess,
}: InvoiceDownloadButtonProps) {
  const [invoice, setInvoice] = useState<InvoiceMetadata | null>(null);
  const [hasInvoice, setHasInvoice] = useState(false);
  const [checking, setChecking] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  // ==================== CHECK INVOICE AVAILABILITY ====================

  const checkInvoiceAvailability = useCallback(async () => {
    setChecking(true);

    try {
      // Check if invoice exists
      const exists = await apiClient.get<boolean>(
        `/orders/${orderId}/invoice/exists`
      );

      setHasInvoice(exists);

      if (exists) {
        // Get invoice metadata
        const metadata = await apiClient.get<InvoiceMetadata>(
          `/orders/${orderId}/invoice`
        );

        setInvoice(metadata);
        logger.info('Invoice metadata loaded', {
          orderId,
          invoiceNumber: metadata.invoiceNumber,
        });
      }
    } catch (err) {
      const error = err as { message?: string };
      const message = error.message || 'Fatura kontrolü başarısız oldu';
      logger.error('Failed to check invoice availability', err as Error, {
        orderId,
        message,
      });
    } finally {
      setChecking(false);
    }
  }, [orderId]);

  // Initial check
  useEffect(() => {
    checkInvoiceAvailability();
  }, [checkInvoiceAvailability]);

  // ==================== DOWNLOAD INVOICE ====================

  const handleDownload = async () => {
    setDownloading(true);

    try {
      logger.info('Downloading invoice', { orderId });

      // Fetch PDF from API
      const response = await fetch(
        `/api/v1/orders/${orderId}/invoice/download`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = invoice?.invoiceNumber
        ? `${invoice.invoiceNumber}.pdf`
        : `invoice-${orderId}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);

      toast.success('📄 Fatura İndirildi', {
        description: 'Fatura başarıyla indirildi.',
      });

      logger.info('Invoice downloaded successfully', {
        orderId,
        invoiceNumber: invoice?.invoiceNumber,
      });

      onDownloadSuccess?.();

      // Refresh metadata to update download count
      await checkInvoiceAvailability();
    } catch (err) {
      const error = err as { message?: string };
      const message = error.message || 'Fatura indirilemedi';

      toast.error('❌ İndirme Hatası', {
        description: message,
      });

      logger.error(`Invoice download failed: ${message}`, error as Error, {
        orderId,
      });
    } finally {
      setDownloading(false);
    }
  };

  // ==================== SEND VIA EMAIL ====================

  const handleEmail = async () => {
    setEmailing(true);

    try {
      logger.info('Sending invoice via email', { orderId });

      await apiClient.post(`/orders/${orderId}/invoice/email`, {});

      toast.success('📧 Email Gönderildi', {
        description: 'Fatura email adresinize gönderildi.',
      });

      logger.info('Invoice emailed successfully', { orderId });

      onEmailSuccess?.();

      // Refresh metadata to update email status
      await checkInvoiceAvailability();
    } catch (err) {
      const error = err as { message?: string };
      const message = error.message || 'Email gönderilemedi';

      toast.error('❌ Email Hatası', {
        description: message,
      });

      logger.error(`Invoice email failed: ${message}`, error as Error, {
        orderId,
      });
    } finally {
      setEmailing(false);
    }
  };

  // ==================== RENDER ====================

  // Loading state
  if (checking) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Kontrol ediliyor...
      </Button>
    );
  }

  // No invoice available
  if (!hasInvoice) {
    return null; // Don't show button if no invoice
  }

  // Invoice available - show download options
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Download Button */}
      <Button
        onClick={handleDownload}
        disabled={downloading || emailing}
        variant={variant}
        size={size}
      >
        {downloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            İndiriliyor...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Fatura İndir
          </>
        )}
      </Button>

      {/* Email Button */}
      {showEmailButton && (
        <Button
          onClick={handleEmail}
          disabled={downloading || emailing}
          variant="outline"
          size={size}
        >
          {emailing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Email Gönder
            </>
          )}
        </Button>
      )}

      {/* Download count badge */}
      {invoice && invoice.downloadCount > 0 && (
        <span className="text-xs text-gray-500">
          ({invoice.downloadCount} kez indirildi)
        </span>
      )}
    </div>
  );
}

// ==================== INVOICE INFO CARD ====================

interface InvoiceInfoCardProps {
  orderId: string;
  className?: string;
}

/**
 * Detailed invoice info card for order detail pages
 */
export function InvoiceInfoCard({ orderId, className }: InvoiceInfoCardProps) {
  const [invoice, setInvoice] = useState<InvoiceMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await apiClient.get<InvoiceMetadata>(
          `/orders/${orderId}/invoice`
        );
        setInvoice(data);
      } catch (_err) {
        logger.error('Failed to load invoice info', _err as Error, { orderId });
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [orderId]);

  if (loading) {
    return (
      <Card className={cn('border-gray-200', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fatura bilgileri yükleniyor...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <Card className={cn('border-blue-200 bg-blue-50', className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-blue-900">Fatura Hazır</p>
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm text-blue-700">
                Faturanız oluşturulmuştur ve indirmeye hazır.
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-2 border-t border-blue-200 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Fatura No:</span>
              <span className="font-medium text-blue-900">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Tutar:</span>
              <span className="font-medium text-blue-900">
                {invoice.totalAmount.toFixed(2)} {invoice.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Oluşturma Tarihi:</span>
              <span className="font-medium text-blue-900">
                {new Date(invoice.generatedAt).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="pt-2">
            <InvoiceDownloadButton
              orderId={orderId}
              variant="primary"
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InvoiceDownloadButton;
