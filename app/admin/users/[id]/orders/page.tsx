'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/utils/format';

interface Props {
  params: Promise<{ id: string }>;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  packageTitle?: string;
  buyerName?: string;
  sellerName?: string;
}

/**
 * Admin User Orders View Page
 * View all orders for a specific user (as buyer or seller)
 */
export default function AdminUserOrdersPage({ params }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
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
        // TODO: Replace with actual API call
        const response = await fetch(`/api/v1/admin/users/${userId}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        console.error('Failed to fetch user orders:', err);
        setError('Kullanıcı siparişleri yüklenemedi');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

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

  const filteredOrders = orders; // TODO: Filter by buyer/seller role

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
              Tümü ({orders.length})
            </Button>
            <Button
              variant={filter === 'buyer' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('buyer')}
            >
              Alıcı Olarak
            </Button>
            <Button
              variant={filter === 'seller' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('seller')}
            >
              Satıcı Olarak
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
