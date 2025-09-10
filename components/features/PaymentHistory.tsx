'use client';

import { useState } from 'react';
import {
  formatCurrency,
  getPaymentStatusColor,
  getPaymentStatusLabel,
} from '@/lib/utils/payment';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Transaction, Order, Invoice } from '@/types';

interface PaymentHistoryProps {
  userId: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<
    'transactions' | 'orders' | 'invoices'
  >('transactions');

  // Mock data - should come from API
  const mockTransactions: Transaction[] = [
    {
      id: 'txn-001',
      walletId: 'wallet-1',
      type: 'payment',
      amount: 1500,
      currency: 'TRY',
      status: 'completed',
      description: 'Web sitesi tasarımı ödemesi',
      referenceId: 'order-001',
      fees: 75,
      netAmount: 1425,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:31:00Z',
    },
    {
      id: 'txn-002',
      walletId: 'wallet-1',
      type: 'deposit',
      amount: 2000,
      currency: 'TRY',
      status: 'completed',
      description: 'Hesaba para yükleme',
      createdAt: '2024-01-10T14:15:00Z',
      updatedAt: '2024-01-10T14:16:00Z',
    },
    {
      id: 'txn-003',
      walletId: 'wallet-1',
      type: 'refund',
      amount: 500,
      currency: 'TRY',
      status: 'pending',
      description: 'İptal edilen proje iadesi',
      referenceId: 'order-002',
      createdAt: '2024-01-12T09:20:00Z',
      updatedAt: '2024-01-12T09:20:00Z',
    },
  ];

  const mockOrders: Order[] = [
    {
      id: 'order-001',
      userId,
      user: {
        id: userId,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@example.com',
        userType: 'employer',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      packageId: 'pkg-001',
      amount: 1500,
      subtotal: 1271.19,
      tax: 228.81,
      discount: 0,
      total: 1500,
      currency: 'TRY',
      status: 'completed',
      paymentStatus: 'paid',
      notes: 'Kurumsal web sitesi tasarımı',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T16:30:00Z',
    },
    {
      id: 'order-002',
      userId,
      user: {
        id: userId,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@example.com',
        userType: 'employer',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      jobId: 'job-001',
      amount: 500,
      subtotal: 423.73,
      tax: 76.27,
      discount: 0,
      total: 500,
      currency: 'TRY',
      status: 'canceled',
      paymentStatus: 'refunded',
      notes: 'İptal edilen mobil uygulama projesi',
      createdAt: '2024-01-12T09:00:00Z',
      updatedAt: '2024-01-12T11:30:00Z',
    },
  ];

  const mockInvoices: Invoice[] = [
    {
      id: 'inv-001',
      orderId: 'order-001',
      order: mockOrders[0],
      invoiceNumber: 'INV-202401-001',
      issueDate: '2024-01-15T10:30:00Z',
      dueDate: '2024-01-30T23:59:59Z',
      amount: 1271.19,
      tax: 228.81,
      totalAmount: 1500,
      currency: 'TRY',
      status: 'paid',
      billingAddress: {
        fullName: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+90 555 123 4567',
        addressLine1: 'Atatürk Cad. No: 123',
        city: 'İstanbul',
        state: 'İstanbul',
        postalCode: '34000',
        country: 'TR',
      },
      items: [
        {
          id: 'item-1',
          description: 'Kurumsal Web Sitesi Tasarımı',
          quantity: 1,
          unitPrice: 1271.19,
          totalPrice: 1271.19,
        },
      ],
      notes: 'Teşekkür ederiz.',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:31:00Z',
    },
  ];

  const renderTransactions = () => (
    <div className="space-y-4">
      {mockTransactions.map((transaction) => (
        <Card key={transaction.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="text-lg">
                  {transaction.type === 'payment' && '💳'}
                  {transaction.type === 'deposit' && '💰'}
                  {transaction.type === 'withdrawal' && '🏦'}
                  {transaction.type === 'refund' && '↩️'}
                  {transaction.type === 'commission' && '💼'}
                  {transaction.type === 'bonus' && '🎁'}
                </div>
                <div>
                  <h4 className="font-semibold">{transaction.description}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString(
                      'tr-TR',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                  {transaction.referenceId && (
                    <p className="text-xs text-gray-400">
                      Referans: {transaction.referenceId}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-lg font-semibold ${
                  transaction.type === 'deposit' ||
                  transaction.type === 'refund' ||
                  transaction.type === 'bonus'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {transaction.type === 'deposit' ||
                transaction.type === 'refund' ||
                transaction.type === 'bonus'
                  ? '+'
                  : '-'}
                {formatCurrency(transaction.amount, transaction.currency)}
              </div>
              <div
                className={`inline-block rounded-full px-2 py-1 text-xs ${getPaymentStatusColor(transaction.status)}`}
              >
                {getPaymentStatusLabel(transaction.status)}
              </div>
              {transaction.fees && transaction.fees > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Komisyon:{' '}
                  {formatCurrency(transaction.fees, transaction.currency)}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      {mockOrders.map((order) => (
        <Card key={order.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="text-lg">📋</div>
                <div>
                  <h4 className="font-semibold">
                    Sipariş #{order.id.split('-')[1]}
                  </h4>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {formatCurrency(order.total, order.currency)}
              </div>
              <div
                className={`inline-block rounded-full px-2 py-1 text-xs ${getPaymentStatusColor(order.status)}`}
              >
                {getPaymentStatusLabel(order.status)}
              </div>
              <div
                className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${getPaymentStatusColor(order.paymentStatus)}`}
              >
                {getPaymentStatusLabel(order.paymentStatus)}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-4">
      {mockInvoices.map((invoice) => (
        <Card key={invoice.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="text-lg">🧾</div>
                <div>
                  <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                  <p className="text-sm text-gray-600">
                    {invoice.items[0]?.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Düzenlenme:{' '}
                    {new Date(invoice.issueDate).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Vade:{' '}
                    {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </div>
              <div
                className={`inline-block rounded-full px-2 py-1 text-xs ${getPaymentStatusColor(invoice.status)}`}
              >
                {getPaymentStatusLabel(invoice.status)}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  // Download invoice logic
                  console.log('Download invoice:', invoice.id);
                }}
              >
                İndir
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ödeme Geçmişi</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            İşlemler
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Siparişler
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Faturalar
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'invoices' && renderInvoices()}
      </div>

      {/* Empty state */}
      {((activeTab === 'transactions' && mockTransactions.length === 0) ||
        (activeTab === 'orders' && mockOrders.length === 0) ||
        (activeTab === 'invoices' && mockInvoices.length === 0)) && (
        <div className="py-12 text-center">
          <div className="mb-4 text-4xl">📋</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Henüz{' '}
            {activeTab === 'transactions'
              ? 'işlem'
              : activeTab === 'orders'
                ? 'sipariş'
                : 'fatura'}{' '}
            bulunmuyor
          </h3>
          <p className="text-gray-500">
            İlk{' '}
            {activeTab === 'transactions'
              ? 'işleminizi'
              : activeTab === 'orders'
                ? 'siparişinizi'
                : 'faturanızı'}{' '}
            gerçekleştirdiğinizde burada görünecek.
          </p>
        </div>
      )}
    </div>
  );
};
