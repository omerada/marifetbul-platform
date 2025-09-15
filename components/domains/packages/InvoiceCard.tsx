// Invoice card component
'use client';

import { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Download,
  Eye,
  FileText,
  Calendar,
  CreditCard,
  Building2,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { Payment } from '@/types';

interface InvoiceCardProps {
  payment: Payment;
  onDownload?: (paymentId: string) => void;
  onView?: (paymentId: string) => void;
  showDetails?: boolean;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  payment,
  onDownload,
  onView,
  showDetails = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      case 'paypal':
      case 'digital_wallet':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      completed: { label: 'Ödendi', variant: 'success' as const },
      pending: { label: 'Beklemede', variant: 'warning' as const },
      processing: { label: 'İşleniyor', variant: 'default' as const },
      failed: { label: 'Başarısız', variant: 'destructive' as const },
      cancelled: { label: 'İptal', variant: 'secondary' as const },
      refunded: { label: 'İade', variant: 'secondary' as const },
      paid: { label: 'Ödendi', variant: 'success' as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: payment.currency || 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    onDownload?.(payment.id);
  };

  const handleView = () => {
    onView?.(payment.id);
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Fatura #{payment.id.slice(-8)}</span>
          </CardTitle>
          {getStatusBadge(payment.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Sipariş No</p>
            <p className="font-medium">#{payment.orderId}</p>
          </div>
          <div>
            <p className="text-gray-500">Tutar</p>
            <p className="text-lg font-semibold">
              {formatCurrency(payment.amount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Ödeme Yöntemi</p>
            <div className="flex items-center space-x-2">
              {getMethodIcon(payment.method)}
              <span>
                {payment.method === 'credit_card' && 'Kredi Kartı'}
                {payment.method === 'bank_transfer' && 'Havale'}
                {payment.method === 'paypal' && 'PayPal'}
                {!payment.method && 'Bilinmiyor'}
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-500">Tarih</p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(payment.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 border-t pt-4">
            {payment.fees && (
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Maliyet Detayları</h4>
                <div className="grid grid-cols-2 gap-2 rounded bg-gray-50 p-3 text-xs">
                  <div className="flex justify-between">
                    <span>Platform Komisyonu:</span>
                    <span>{formatCurrency(payment.fees.platformFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>İşlem Ücreti:</span>
                    <span>{formatCurrency(payment.fees.processingFee)}</span>
                  </div>
                  <div className="col-span-2 flex justify-between border-t pt-2 font-medium">
                    <span>Toplam Ücret:</span>
                    <span>{formatCurrency(payment.fees.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {payment.transactionId && (
              <div className="text-sm">
                <p className="text-gray-500">İşlem ID</p>
                <p className="rounded bg-gray-100 p-2 font-mono text-xs">
                  {payment.transactionId}
                </p>
              </div>
            )}

            {payment.escrowStatus && (
              <div className="text-sm">
                <p className="text-gray-500">Emanet Durumu</p>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      payment.escrowStatus === 'released'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {payment.escrowStatus === 'held' && 'Beklemede'}
                    {payment.escrowStatus === 'released' && 'Serbest Bırakıldı'}
                    {payment.escrowStatus === 'disputed' && 'Anlaşmazlık'}
                  </Badge>
                  {payment.escrowReleaseDate && (
                    <span className="text-xs text-gray-500">
                      {formatDate(payment.escrowReleaseDate)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Daha Az' : 'Detaylar'}
          </Button>

          <div className="flex items-center space-x-2">
            {payment.invoiceUrl && (
              <>
                <Button variant="ghost" size="sm" onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Görüntüle
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  İndir
                </Button>
              </>
            )}
            {payment.receiptUrl && (
              <Button variant="ghost" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Makbuz
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceCard;
