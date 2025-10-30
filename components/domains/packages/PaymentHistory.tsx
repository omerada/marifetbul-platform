'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui';
import { usePayment } from '@/hooks';
import { Payment } from '@/types';
import {
  Search,
  Download,
  Eye,
  CreditCard,
  Building2,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface PaymentHistoryProps {
  userId?: string;
  showSummary?: boolean;
  onPaymentSelect?: (payment: Payment) => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  onPaymentSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { payments, loading, error, fetchPaymentHistory, formatPaymentAmount } =
    usePayment();

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const getMethodIcon = (method: string | undefined) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank':
        return <Building2 className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      completed: { label: 'Tamamlandı', variant: 'success' as const },
      paid: { label: 'Ödendi', variant: 'success' as const },
      pending: { label: 'Beklemede', variant: 'warning' as const },
      processing: { label: 'İşleniyor', variant: 'default' as const },
      failed: { label: 'Başarısız', variant: 'destructive' as const },
      cancelled: { label: 'İptal Edildi', variant: 'secondary' as const },
      refunded: { label: 'İade Edildi', variant: 'secondary' as const },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter payments based on search
  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.paymentId?.toLowerCase().includes(query) ||
      payment.orderId.toLowerCase().includes(query) ||
      payment.method?.toLowerCase().includes(query)
    );
  });

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    onPaymentSelect?.(payment);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium">
              Ödeme geçmişi yüklenemedi
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchPaymentHistory()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ödeme Geçmişi</span>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Ödeme ID, sipariş ID ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Loading key={i} variant="skeleton" className="h-16" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">Ödeme bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Arama kriterlerinizle eşleşen ödeme bulunamadı.'
                  : 'Henüz hiç ödeme yapmamışsınız.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Card
                  key={payment.paymentId}
                  className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedPayment?.paymentId === payment.paymentId
                      ? 'ring-primary ring-2'
                      : ''
                  }`}
                  onClick={() => handlePaymentClick(payment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          {getMethodIcon(payment.method)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center space-x-2">
                            <p className="truncate text-sm font-medium">
                              {payment.paymentId}
                            </p>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Sipariş: {payment.orderId} •{' '}
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatPaymentAmount(
                              payment.amount,
                              payment.currency
                            )}
                          </p>
                          {payment.fees && (
                            <p className="text-muted-foreground text-xs">
                              +{formatPaymentAmount(payment.fees.total)}{' '}
                              komisyon
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {payment.invoiceUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(payment.invoiceUrl, '_blank');
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePaymentClick(payment);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
