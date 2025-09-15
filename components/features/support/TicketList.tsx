'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useSupport } from '@/hooks';
import { cn } from '@/lib/utils';
import type { SupportTicket } from '@/types';

interface TicketListProps {
  status?: 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';
  showCreateButton?: boolean;
  onTicketClick?: (ticket: SupportTicket) => void;
  className?: string;
}

export const TicketList: React.FC<TicketListProps> = ({
  status = 'all',
  showCreateButton = true,
  onTicketClick,
  className,
}) => {
  const router = useRouter();
  const {
    tickets,
    ticketsLoading,
    ticketsError,
    ticketsPagination,
    fetchTickets,
  } = useSupport();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>(status);
  const [sortBy, setSortBy] = React.useState<
    'created' | 'updated' | 'priority'
  >('updated');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    if (tickets.length === 0 && !ticketsLoading) {
      fetchTickets();
    }
  }, [tickets.length, ticketsLoading, fetchTickets]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll just call fetchTickets
    // In a real implementation, this would call a search function
    await fetchTickets();
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    if (onTicketClick) {
      onTicketClick(ticket);
    } else {
      router.push(`/help/support/ticket/${ticket.id}`);
    }
  };

  const handleCreateTicket = () => {
    router.push('/help/support/create');
  };

  const handleRefresh = () => {
    fetchTickets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return AlertCircle;
      case 'in_progress':
        return Clock;
      case 'resolved':
        return CheckCircle;
      case 'closed':
        return XCircle;
      default:
        return MessageSquare;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Açık';
      case 'in_progress':
        return 'İşlemde';
      case 'resolved':
        return 'Çözülmüş';
      case 'closed':
        return 'Kapalı';
      default:
        return 'Bilinmiyor';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'urgent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Düşük';
      case 'medium':
        return 'Orta';
      case 'high':
        return 'Yüksek';
      case 'urgent':
        return 'Acil';
      default:
        return 'Normal';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus === 'all') return true;
    return ticket.status === filterStatus;
  });

  const renderTicketCard = (ticket: SupportTicket) => {
    const StatusIcon = getStatusIcon(ticket.status);

    if (viewMode === 'grid') {
      return (
        <div
          key={ticket.id}
          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md"
          onClick={() => handleTicketClick(ticket)}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon
                className={cn('h-5 w-5', getPriorityColor(ticket.priority))}
              />
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
                  getStatusColor(ticket.status)
                )}
              >
                {getStatusText(ticket.status)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              #{ticket.id.slice(-6)}
            </span>
          </div>

          <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
            {ticket.subject}
          </h3>

          <p className="mb-4 line-clamp-3 text-sm text-gray-600">
            {ticket.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {ticket.user.firstName} {ticket.user.lastName}
              </span>
              <span
                className={cn('font-medium', getPriorityColor(ticket.priority))}
              >
                {getPriorityText(ticket.priority)}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(ticket.updatedAt)}
            </span>
          </div>
        </div>
      );
    }

    // List view
    return (
      <div
        key={ticket.id}
        className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm"
        onClick={() => handleTicketClick(ticket)}
      >
        <div className="flex items-center gap-4">
          <StatusIcon
            className={cn(
              'h-5 w-5 flex-shrink-0',
              getPriorityColor(ticket.priority)
            )}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate font-medium text-gray-900">
                {ticket.subject}
              </h3>
              <span className="text-xs text-gray-500">
                #{ticket.id.slice(-6)}
              </span>
            </div>
            <p className="line-clamp-1 text-sm text-gray-600">
              {ticket.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
                getStatusColor(ticket.status)
              )}
            >
              {getStatusText(ticket.status)}
            </span>

            <span
              className={cn('font-medium', getPriorityColor(ticket.priority))}
            >
              {getPriorityText(ticket.priority)}
            </span>

            <span className="text-xs">{formatDate(ticket.updatedAt)}</span>
          </div>

          <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Search and Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Talep numarası, konu veya açıklama ara..."
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={ticketsLoading}
              className="rounded-lg border border-gray-300 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
            >
              <RefreshCw
                className={cn('h-5 w-5', ticketsLoading && 'animate-spin')}
              />
            </button>

            {showCreateButton && (
              <button
                onClick={handleCreateTicket}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Yeni Talep
              </button>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="open">Açık</option>
              <option value="in_progress">İşlemde</option>
              <option value="resolved">Çözülmüş</option>
              <option value="closed">Kapalı</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('_');
                setSortBy(sort as typeof sortBy);
                setSortOrder(order as typeof sortOrder);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated_desc">Son Güncelleme</option>
              <option value="created_desc">En Yeni</option>
              <option value="created_asc">En Eski</option>
              <option value="priority_desc">Öncelik (Yüksek)</option>
              <option value="priority_asc">Öncelik (Düşük)</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                showFilters
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              <Filter className="h-4 w-4" />
              Filtreler
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showFilters && 'rotate-180'
                )}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Results count */}
            <span className="text-sm text-gray-600">
              {filteredTickets.length} talep
            </span>

            {/* View mode toggle */}
            <div className="flex items-center rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-l-lg p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-r-lg p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {ticketsLoading && filteredTickets.length === 0 ? (
          <div className="py-12 text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Talepler yükleniyor...</p>
          </div>
        ) : ticketsError ? (
          <div className="py-12 text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Hata Oluştu
            </h3>
            <p className="mb-4 text-gray-600">
              Talepler yüklenirken bir hata oluştu.
            </p>
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchQuery ? 'Sonuç Bulunamadı' : 'Henüz Talep Yok'}
            </h3>
            <p className="mb-4 text-gray-600">
              {searchQuery
                ? 'Arama kriterlerinize uygun talep bulunamadı.'
                : 'Henüz hiç destek talebi oluşturmamışsınız.'}
            </p>
            {showCreateButton && !searchQuery && (
              <button
                onClick={handleCreateTicket}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                İlk Talebinizi Oluşturun
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTickets.map(renderTicketCard)}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map(renderTicketCard)}
              </div>
            )}

            {/* Pagination */}
            {ticketsPagination && ticketsPagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={!ticketsPagination.hasPrev}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Önceki
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {ticketsPagination.page} / {ticketsPagination.totalPages}
                </span>
                <button
                  disabled={!ticketsPagination.hasNext}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TicketList;
