'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  PieChart,
  Download,
  RefreshCw,
  Clock,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
} from 'lucide-react';

export function AdminFinancialManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const financialStats = [
    {
      name: 'Toplam Gelir',
      value: '₺245,890',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      name: 'Aylık Gelir',
      value: '₺52,340',
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      name: 'Bekleyen Ödemeler',
      value: '₺8,750',
      change: '-3.1%',
      changeType: 'decrease' as const,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      name: 'Platform Komisyonu',
      value: '₺12,295',
      change: '+15.3%',
      changeType: 'increase' as const,
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  const recentTransactions = [
    {
      id: 'TXN-001',
      type: 'payment',
      amount: 1250,
      currency: 'TRY',
      status: 'completed',
      description: 'Freelancer payout - Proje tamamlandı',
      user: 'Ahmet Yılmaz',
      date: '2024-01-15 14:30',
      fee: 62.5,
    },
    {
      id: 'TXN-002',
      type: 'commission',
      amount: 150,
      currency: 'TRY',
      status: 'completed',
      description: 'Platform komisyonu - Web tasarım projesi',
      user: 'Elif Koç',
      date: '2024-01-15 13:45',
      fee: 0,
    },
    {
      id: 'TXN-003',
      type: 'refund',
      amount: 800,
      currency: 'TRY',
      status: 'pending',
      description: 'İade talebi - İptal edilen proje',
      user: 'Mehmet Demir',
      date: '2024-01-15 12:20',
      fee: 40,
    },
    {
      id: 'TXN-004',
      type: 'withdrawal',
      amount: 2500,
      currency: 'TRY',
      status: 'processing',
      description: 'Kazanç çekme talebi',
      user: 'Ayşe Kaya',
      date: '2024-01-15 11:15',
      fee: 25,
    },
    {
      id: 'TXN-005',
      type: 'payment',
      amount: 3200,
      currency: 'TRY',
      status: 'failed',
      description: 'Proje ödemesi - Kart limiti aşıldı',
      user: 'Can Öztürk',
      date: '2024-01-15 10:30',
      fee: 0,
    },
  ];

  const paymentMethods = [
    {
      name: 'Kredi Kartı',
      percentage: 65,
      amount: '₺159,829',
      color: 'bg-blue-500',
    },
    {
      name: 'Banka Transferi',
      percentage: 25,
      amount: '₺61,472',
      color: 'bg-green-500',
    },
    {
      name: 'Kripto Para',
      percentage: 2,
      amount: '₺4,918',
      color: 'bg-purple-500',
    },
  ];

  const getTransactionIcon = (type: string) => {
    const icons = {
      payment: CreditCard,
      commission: Receipt,
      refund: TrendingDown,
      withdrawal: Banknote,
    };
    return icons[type as keyof typeof icons] || CreditCard;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'success' as const, text: 'Tamamlandı' },
      pending: { variant: 'warning' as const, text: 'Beklemede' },
      processing: { variant: 'default' as const, text: 'İşleniyor' },
      failed: { variant: 'destructive' as const, text: 'Başarısız' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'default' as const,
      text: status,
    };

    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getTypeText = (type: string) => {
    const types = {
      payment: 'Ödeme',
      commission: 'Komisyon',
      refund: 'İade',
      withdrawal: 'Çekim',
    };
    return types[type as keyof typeof types] || type;
  };

  const refreshData = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mali Yönetim</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ödemeler, komisyonlar ve finansal raporlar
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className={`border ${stat.borderColor} ${stat.bgColor} transition-all hover:shadow-md`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="mt-2 flex items-center">
                      {stat.changeType === 'increase' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`ml-1 text-sm font-medium ${
                          stat.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        son 30 gün
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Gelir Trendi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
              <div className="text-center">
                <PieChart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Gelir trend grafiği burada gösterilecek
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Chart.js entegrasyonu gerekli
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Ödeme Yöntemleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {method.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {method.amount}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${method.color}`}
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    %{method.percentage}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Zaman Aralığı</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 3 Ay</option>
              <option value="1y">Son 1 Yıl</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">İşlem Türü</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="all">Tüm İşlemler</option>
              <option value="payment">Ödemeler</option>
              <option value="commission">Komisyonlar</option>
              <option value="refund">İadeler</option>
              <option value="withdrawal">Çekimler</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Toplu Ödeme
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Fatura Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Son İşlemler</span>
            <Badge variant="outline" className="text-gray-600">
              {recentTransactions.length} işlem
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);

              return (
                <div
                  key={transaction.id}
                  className="rounded-lg border border-gray-200 p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-lg bg-gray-50 p-2">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {transaction.id}
                          </h3>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <p className="mb-1 text-sm text-gray-600">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Kullanıcı: {transaction.user}</span>
                          <span>{transaction.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="mb-1 flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          ₺{transaction.amount.toLocaleString('tr-TR')}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({getTypeText(transaction.type)})
                        </span>
                      </div>
                      {transaction.fee > 0 && (
                        <p className="text-xs text-gray-500">
                          Komisyon: ₺{transaction.fee.toLocaleString('tr-TR')}
                        </p>
                      )}
                      <div className="mt-2 flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminFinancialManagement;
