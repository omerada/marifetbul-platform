'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button, Loading } from '@/components/ui';
import {
  ApproveDeliveryModal,
  RequestRevisionModal,
  DisputeModal,
} from '@/components/domains/orders';
import {
  Package,
  Clock,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import type { Order } from '@/types/business/features/orders';

export default function EmployerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v1/orders/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Siparişler yüklenemedi');
      }

      const data = await response.json();
      setOrders(data.data?.content || data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleApproveClick = (order: Order) => {
    setSelectedOrder(order);
    setApproveModalOpen(true);
  };

  const handleRevisionClick = (order: Order) => {
    setSelectedOrder(order);
    setRevisionModalOpen(true);
  };

  const handleDisputeClick = (order: Order) => {
    setSelectedOrder(order);
    setDisputeModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadOrders(); // Refresh orders after action
  };

  // Calculate stats
  const stats = {
    active: orders.filter((o) =>
      ['active', 'in_progress', 'delivered'].includes(o.status)
    ).length,
    pending: orders.filter((o) => o.status === 'pending').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      disputed: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Beklemede',
      active: 'Aktif',
      in_progress: 'Devam Ediyor',
      delivered: 'Teslim Edildi',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
      disputed: 'Anlaşmazlık',
    };
    return texts[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <Loading size="lg" text="Siparişler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Siparişlerim</h1>
          <p className="mt-1 text-gray-600">
            Verdiğiniz siparişleri takip edin
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Siparişler</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Henüz siparişiniz yok
          </h3>
          <p className="mt-2 text-gray-500">
            Freelancer&apos;lardan hizmet satın alarak işe başlayın
          </p>
          <Link href="/marketplace">
            <Button className="mt-4">Marketplace&apos;i Keşfet</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Order Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.customOrderDetails?.title ||
                            `Sipariş #${order.orderNumber}`}
                        </h3>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {order.customOrderDetails?.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        {order.seller?.firstName} {order.seller?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Teslimat:{' '}
                        {new Date(order.deliveryDate).toLocaleDateString(
                          'tr-TR'
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-gray-900">
                        {order.amount} {order.currency}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Info for Delivered Orders */}
                  {order.status === 'delivered' && order.deliverables && (
                    <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 flex-shrink-0 text-purple-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-900">
                            İş teslim edildi - İncelemenizi bekliyor
                          </p>
                          {order.deliverables && (
                            <p className="mt-1 text-xs text-purple-700">
                              Dosyalar mevcut
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  {order.status === 'delivered' && (
                    <>
                      <Button
                        onClick={() => handleApproveClick(order)}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Onayla
                      </Button>
                      <Button
                        onClick={() => handleRevisionClick(order)}
                        variant="secondary"
                        className="flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Revizyon İste
                      </Button>
                    </>
                  )}
                  {(order.status === 'in_progress' ||
                    order.status === 'delivered') && (
                    <Button
                      onClick={() => handleDisputeClick(order)}
                      variant="destructive"
                      className="flex items-center justify-center gap-2"
                    >
                      Anlaşmazlık Aç
                    </Button>
                  )}
                  <Link href={`/dashboard/employer/orders/${order.id}`}>
                    <Button variant="secondary" className="w-full">
                      Detaylar
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Delivery Modal */}
      {selectedOrder && (
        <ApproveDeliveryModal
          orderId={selectedOrder.id}
          orderTitle={
            selectedOrder.customOrderDetails?.title ||
            `Sipariş #${selectedOrder.orderNumber}`
          }
          deliveryNote={
            selectedOrder.deliverables && selectedOrder.deliverables.length > 0
              ? selectedOrder.deliverables[0]?.description
              : undefined
          }
          freelancerName={`${selectedOrder.seller?.firstName} ${selectedOrder.seller?.lastName}`}
          amount={selectedOrder.amount}
          currency={selectedOrder.currency}
          isOpen={approveModalOpen}
          onClose={() => {
            setApproveModalOpen(false);
            setSelectedOrder(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Request Revision Modal */}
      {selectedOrder && (
        <RequestRevisionModal
          orderId={selectedOrder.id}
          orderTitle={
            selectedOrder.customOrderDetails?.title ||
            `Sipariş #${selectedOrder.orderNumber}`
          }
          currentRevisionCount={0}
          maxRevisions={3}
          deliveryNote={
            selectedOrder.deliverables && selectedOrder.deliverables.length > 0
              ? selectedOrder.deliverables[0]?.description
              : undefined
          }
          isOpen={revisionModalOpen}
          onClose={() => {
            setRevisionModalOpen(false);
            setSelectedOrder(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Dispute Modal */}
      {selectedOrder && (
        <DisputeModal
          orderId={selectedOrder.id}
          orderTitle={
            selectedOrder.customOrderDetails?.title ||
            `Sipariş #${selectedOrder.orderNumber}`
          }
          userRole="buyer"
          isOpen={disputeModalOpen}
          onClose={() => {
            setDisputeModalOpen(false);
            setSelectedOrder(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
