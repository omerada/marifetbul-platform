'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/utils/format';
import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  ApiResponse,
  PageResponse,
  OrderSummaryResponse,
} from '@/types/backend-aligned';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Admin User Orders View Page
 * View all orders for a specific user (as buyer or seller)
 */
export default function AdminUserOrdersPage({ params }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [buyerOrders, setBuyerOrders] = useState<OrderSummaryResponse[]>([]);
  const [sellerOrders, setSellerOrders] = useState<OrderSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');

  useEffect(() => {
    params.then((p) => setUserId(p.id));
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use admin endpoint for user orders
        const response = await apiClient.get<
          ApiResponse<{
            buyerOrders: PageResponse<OrderSummaryResponse>;
            sellerOrders: PageResponse<OrderSummaryResponse>;
          }>
        >(`/api/v1/admin/orders/user/${userId}`, {
          page: '0',
          size: '100',
        });

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch orders');
        }

        // Combine buyer and seller orders based on filter
        setBuyerOrders(response.data.buyerOrders.content || []);
        setSellerOrders(response.data.sellerOrders.content || []);
      } catch (err) {
        console.error('Failed to fetch user orders:', err);
        setError('Kullanıcı siparişleri yüklenemedi');
        setBuyerOrders([]);
        setSellerOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]); // Fetch all orders on mount

  // Filter orders based on selected role
  const filteredOrders =
    filter === 'all'
      ? [...buyerOrders, ...sellerOrders]
      : filter === 'buyer'
        ? buyerOrders
        : sellerOrders;

  const totalOrders = buyerOrders.length + sellerOrders.length;

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant:
          | 'default'
          | 'secondary'
          | 'success'
          | 'warning'
          | 'destructive';
        icon: React.ReactNode;
      }
    > = {
      PENDING_PAYMENT: {
        variant: 'warning',
        icon: <Clock className="h-3 w-3" />,
      },
      PAID: {
        variant: 'secondary',
        icon: <Package className="h-3 w-3" />,
      },
      IN_PROGRESS: {
        variant: 'secondary',
        icon: <Package className="h-3 w-3" />,
      },
      DELIVERED: {
        variant: 'secondary',
        icon: <Package className="h-3 w-3" />,
      },
      COMPLETED: {
        variant: 'success',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      CANCELLED: {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    const config = variants[status] || variants.PAID;
    const labels: Record<string, string> = {
      PENDING_PAYMENT: 'Ödeme Bekliyor',
      PAID: 'Ödendi',
      IN_PROGRESS: 'Devam Ediyor',
      DELIVERED: 'Teslim Edildi',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi',
    };

    return (
      <Badge variant={config.variant} className="flex w-fit items-center gap-1">
        {config.icon}
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            <div className="h-24 rounded bg-gray-200"></div>
            <div className="h-24 rounded bg-gray-200"></div>
            <div className="h-24 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kullanıcılara Dön
        </Button>
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  // Note: Backend already fetches both buyer and seller orders separately
  // We just need to filter them on the frontend based on user selection
  // Since backend endpoint returns buyerOrders and sellerOrders separately,
  // we need to re-fetch when filter changes to get the correct subset

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kullanıcılara Dön
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kullanıcı Siparişleri</h1>
            <p className="text-muted-foreground mt-1">Kullanıcı ID: {userId}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tümü ({totalOrders})
            </Button>
            <Button
              variant={filter === 'buyer' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('buyer')}
            >
              Alıcı ({buyerOrders.length})
            </Button>
            <Button
              variant={filter === 'seller' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('seller')}
            >
              Satıcı ({sellerOrders.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="text-muted-foreground text-lg font-medium">
            Sipariş bulunamadı
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="hover:border-primary/50 p-6 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {order.orderNumber}
                    </h3>
                    {getStatusBadge(order.status)}
                  </div>

                  <p className="text-muted-foreground mb-4 text-sm">
                    {order.packageTitle || 'Özel Sipariş'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">Tutar</p>
                      <p className="font-medium">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tarih</p>
                      <p className="font-medium">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {order.buyerName && (
                      <div>
                        <p className="text-muted-foreground">Alıcı</p>
                        <p className="font-medium">{order.buyerName}</p>
                      </div>
                    )}
                    {order.sellerName && (
                      <div>
                        <p className="text-muted-foreground">Satıcı</p>
                        <p className="font-medium">{order.sellerName}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  Detay
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
