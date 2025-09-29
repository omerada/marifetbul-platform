'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Search,
  RefreshCw,
  Plus,
  Eye,
  MessageCircle,
  Flag,
  Archive,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export function AdminSupportTickets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const ticketStats = [
    {
      name: 'Toplam Talep',
      value: '1,234',
      change: '+23 bugün',
      changeType: 'increase' as const,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      name: 'Açık Talepler',
      value: '87',
      change: '+12 bugün',
      changeType: 'increase' as const,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      name: 'Çözülen',
      value: '156',
      change: '+45 bu hafta',
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      name: 'Ortalama Yanıt',
      value: '2.4 saat',
      change: '-30 dk',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  const tickets = [
    {
      id: 'TICKET-001',
      title: 'Ödeme işlemi gerçekleşmiyor',
      description:
        'Kredi kartımla ödeme yapmaya çalışıyorum ancak hata alıyorum.',
      user: {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        avatar: null,
      },
      status: 'open',
      priority: 'high',
      category: 'payment',
      created: '2024-01-15 09:30',
      updated: '2024-01-15 14:22',
      assignee: 'Elif Koç',
      messages: 3,
    },
    {
      id: 'TICKET-002',
      title: 'Profil fotoğrafı yüklenmiyor',
      description:
        'Profil resmi yüklemeye çalışıyorum ama sürekli hata veriyor.',
      user: {
        name: 'Ayşe Demir',
        email: 'ayse@example.com',
        avatar: null,
      },
      status: 'in-progress',
      priority: 'medium',
      category: 'technical',
      created: '2024-01-15 08:15',
      updated: '2024-01-15 13:45',
      assignee: 'Can Öztürk',
      messages: 5,
    },
    {
      id: 'TICKET-003',
      title: 'Hesabım askıya alındı',
      description: 'Hesabım neden askıya alındı? Ne yapmalıyım?',
      user: {
        name: 'Mehmet Kaya',
        email: 'mehmet@example.com',
        avatar: null,
      },
      status: 'resolved',
      priority: 'high',
      category: 'account',
      created: '2024-01-14 16:20',
      updated: '2024-01-15 12:30',
      assignee: 'Zeynep Aydın',
      messages: 7,
    },
    {
      id: 'TICKET-004',
      title: 'İş ilanım yayınlanmıyor',
      description: 'İş ilanı oluşturdum ama sitede görünmüyor.',
      user: {
        name: 'Fatma Çelik',
        email: 'fatma@example.com',
        avatar: null,
      },
      status: 'closed',
      priority: 'medium',
      category: 'jobs',
      created: '2024-01-14 11:45',
      updated: '2024-01-14 18:20',
      assignee: 'Emre Şahin',
      messages: 2,
    },
    {
      id: 'TICKET-005',
      title: 'Şifre sıfırlama çalışmıyor',
      description: 'Şifre sıfırlama e-postası gelmiyor.',
      user: {
        name: 'Ali Özkan',
        email: 'ali@example.com',
        avatar: null,
      },
      status: 'open',
      priority: 'low',
      category: 'account',
      created: '2024-01-15 07:20',
      updated: '2024-01-15 07:20',
      assignee: null,
      messages: 1,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'warning' as const, text: 'Açık' },
      'in-progress': { variant: 'default' as const, text: 'İşlemde' },
      resolved: { variant: 'success' as const, text: 'Çözüldü' },
      closed: { variant: 'secondary' as const, text: 'Kapatıldı' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'default' as const,
      text: status,
    };

    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'secondary' as const, text: 'Düşük' },
      medium: { variant: 'warning' as const, text: 'Orta' },
      high: { variant: 'destructive' as const, text: 'Yüksek' },
      critical: { variant: 'destructive' as const, text: 'Kritik' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || {
      variant: 'default' as const,
      text: priority,
    };

    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getCategoryText = (category: string) => {
    const categories = {
      payment: 'Ödeme',
      technical: 'Teknik',
      account: 'Hesap',
      jobs: 'İş İlanları',
      general: 'Genel',
    };
    return categories[category as keyof typeof categories] || category;
  };

  const refreshTickets = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority =
      selectedPriority === 'all' || ticket.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destek Talepleri</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kullanıcı destek talepleri ve çözüm takibi
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTickets}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Talep
          </Button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ticketStats.map((stat) => {
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

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Arama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Talep ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Durum</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="open">Açık</option>
              <option value="in-progress">İşlemde</option>
              <option value="resolved">Çözüldü</option>
              <option value="closed">Kapatıldı</option>
            </select>
          </CardContent>
        </Card>

        {/* Priority Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Öncelik</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
          </CardContent>
        </Card>

        {/* Quick Actions */}
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
                <MessageCircle className="mr-2 h-4 w-4" />
                Toplu Yanıt
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Archive className="mr-2 h-4 w-4" />
                Arşivle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Destek Talepleri</span>
            <Badge variant="outline" className="text-gray-600">
              {filteredTickets.length} talep
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Filtrelere uygun talep bulunamadı
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg border border-gray-200 p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">
                          {ticket.title}
                        </h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryText(ticket.category)}
                        </Badge>
                      </div>

                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {ticket.description}
                      </p>

                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{ticket.user.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Oluşturuldu: {ticket.created}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Güncellendi: {ticket.updated}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{ticket.messages} mesaj</span>
                        </div>
                      </div>

                      {ticket.assignee && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span>Atanan: {ticket.assignee}</span>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminSupportTickets;
