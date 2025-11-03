/**
 * ================================================
 * MODERATOR TICKET QUEUE COMPONENT
 * ================================================
 * Dedicated component for moderator ticket/support management
 * Separated from admin to avoid duplicate and maintain clean architecture
 *
 * Features:
 * - Ticket list with filters
 * - Assign to moderators
 * - Resolve/close actions
 * - Priority management
 * - Bulk operations
 * - Real-time stats
 *
 * Sprint 1 - Story 1.2: Ticket Management System
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  Flag,
  ArrowUpCircle,
} from 'lucide-react';
import { UnifiedButton, Badge, Pagination, Loading } from '@/components/ui';
import { useTicketModeration } from '@/hooks/business/moderation/useTicketModeration';
import type {
  SupportTicket,
  TicketStatus,
} from '@/types/business/features/support';

// ============================================================================
// TYPES
// ============================================================================

interface ModeratorTicketQueueProps {
  initialStatus?: TicketStatus;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModeratorTicketQueue({
  initialStatus = 'open',
}: ModeratorTicketQueueProps) {
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>(
    initialStatus
  );
  const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(
    null
  );
  const [resolutionText, setResolutionText] = useState('');
  const [showResolveModal, setShowResolveModal] = useState<string | null>(null);

  // Use our dedicated hook
  const {
    tickets,
    stats,
    pagination,
    isLoading,
    isProcessing,
    selectedTickets,
    assignTicket,
    resolveTicket,
    closeTicket,
    bulkAssign,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    goToPage,
  } = useTicketModeration({
    autoFetch: true,
    filters: {
      status: filterStatus === 'all' ? undefined : filterStatus,
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAssign = async (ticketId: string) => {
    const success = await assignTicket(ticketId);
    if (success && viewingTicket?.id === ticketId) {
      setViewingTicket(null);
    }
  };

  const handleResolve = async (ticketId: string) => {
    if (!resolutionText || resolutionText.length < 10) {
      return;
    }

    const success = await resolveTicket(ticketId, resolutionText);
    if (success) {
      setShowResolveModal(null);
      setResolutionText('');
      if (viewingTicket?.id === ticketId) {
        setViewingTicket(null);
      }
    }
  };

  const handleClose = async (ticketId: string) => {
    const success = await closeTicket(ticketId);
    if (success && viewingTicket?.id === ticketId) {
      setViewingTicket(null);
    }
  };

  const handleBulkAssign = async () => {
    await bulkAssign(selectedTickets, 'CURRENT_MODERATOR');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { variant: 'warning' as const, label: 'Açık' },
      pending: { variant: 'default' as const, label: 'Beklemede' },
      in_progress: { variant: 'default' as const, label: 'İşlemde' },
      waiting_for_customer: {
        variant: 'default' as const,
        label: 'Müşteri Bekliyor',
      },
      resolved: { variant: 'success' as const, label: 'Çözüldü' },
      closed: { variant: 'secondary' as const, label: 'Kapatıldı' },
      escalated: { variant: 'destructive' as const, label: 'Yükseltildi' },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      urgent: {
        variant: 'destructive' as const,
        label: 'Acil',
        icon: AlertCircle,
      },
      high: {
        variant: 'warning' as const,
        label: 'Yüksek',
        icon: ArrowUpCircle,
      },
      normal: { variant: 'default' as const, label: 'Normal', icon: Flag },
      low: { variant: 'secondary' as const, label: 'Düşük', icon: Flag },
    };

    const config =
      priorityMap[priority as keyof typeof priorityMap] || priorityMap.normal;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      account: 'Hesap',
      billing: 'Fatura',
      payment: 'Ödeme',
      technical: 'Teknik',
      dispute: 'Anlaşmazlık',
      feature_request: 'Özellik İsteği',
      bug_report: 'Hata Raporu',
      general: 'Genel',
      abuse: 'Kötüye Kullanım',
      refund: 'İade',
      report_user: 'Kullanıcı Şikayeti',
    };

    return categoryMap[category] || category;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading size="lg" text="Ticketlar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-sm font-medium text-gray-600">Açık</div>
            <div className="mt-1 text-2xl font-bold text-blue-700">
              {stats.open}
            </div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="text-sm font-medium text-gray-600">Bekleyen</div>
            <div className="mt-1 text-2xl font-bold text-yellow-700">
              {stats.pending}
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="text-sm font-medium text-gray-600">İşlemde</div>
            <div className="mt-1 text-2xl font-bold text-purple-700">
              {stats.inProgress}
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-sm font-medium text-gray-600">Çözüldü</div>
            <div className="mt-1 text-2xl font-bold text-green-700">
              {stats.resolved}
            </div>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <div className="text-sm font-medium text-gray-600">
              Yanıt Bekleyen
            </div>
            <div className="mt-1 text-2xl font-bold text-red-700">
              {stats.needingResponse}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setFilterStatus('open')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'open'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Açık
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Bekleyen
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'in_progress'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          İşlemde
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tümü
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-4">
          <span className="text-sm font-medium text-gray-900">
            {selectedTickets.length} ticket seçildi
          </span>
          <div className="flex gap-2">
            <UnifiedButton
              variant="primary"
              size="sm"
              onClick={handleBulkAssign}
              disabled={isProcessing}
            >
              <User className="mr-1 h-4 w-4" />
              Tümünü Ata
            </UnifiedButton>
            <UnifiedButton variant="ghost" size="sm" onClick={clearSelection}>
              Temizle
            </UnifiedButton>
          </div>
          {tickets.length === selectedTickets.length ? (
            <span className="ml-auto text-xs text-gray-500">
              Tüm ticketlar seçili
            </span>
          ) : (
            <button
              onClick={selectAll}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700"
            >
              Tümünü Seç
            </button>
          )}
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Ticket Bulunamadı
            </h3>
            <p className="text-sm text-gray-500">
              {filterStatus === 'open'
                ? 'Açık ticket yok'
                : filterStatus === 'pending'
                  ? 'Bekleyen ticket yok'
                  : 'Henüz ticket yok'}
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`rounded-lg border bg-white p-4 transition-all ${
                isSelected(ticket.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected(ticket.id)}
                  onChange={() => toggleSelection(ticket.id)}
                  className="mt-1"
                />

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        #{ticket.ticketNumber}
                      </span>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <Badge variant="outline">
                        {getCategoryLabel(ticket.category)}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Subject & Description */}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {ticket.subject}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {ticket.description}
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>
                        {ticket.user.firstName} {ticket.user.lastName}
                      </span>
                    </div>
                    {ticket.messages && ticket.messages.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{ticket.messages.length} mesaj</span>
                      </div>
                    )}
                    {ticket.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>
                          Atanan: {ticket.assignee.firstName}{' '}
                          {ticket.assignee.lastName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <UnifiedButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingTicket(ticket)}
                    >
                      Detay
                    </UnifiedButton>

                    {!ticket.assignee && (
                      <UnifiedButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleAssign(ticket.id)}
                        disabled={isProcessing}
                      >
                        <User className="mr-1 h-3 w-3" />
                        Bana Ata
                      </UnifiedButton>
                    )}

                    {ticket.status === 'open' || ticket.status === 'pending' ? (
                      <UnifiedButton
                        variant="success"
                        size="sm"
                        onClick={() => setShowResolveModal(ticket.id)}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Çöz
                      </UnifiedButton>
                    ) : null}

                    {ticket.status === 'resolved' && (
                      <UnifiedButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleClose(ticket.id)}
                        disabled={isProcessing}
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Kapat
                      </UnifiedButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page + 1}
          totalPages={pagination.totalPages}
          onPageChange={(page) => goToPage(page - 1)}
        />
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">Ticketı Çöz</h3>
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Çözüm açıklaması (en az 10 karakter)..."
              className="mb-4 min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-sm"
            />
            <div className="flex justify-end gap-2">
              <UnifiedButton
                variant="ghost"
                onClick={() => {
                  setShowResolveModal(null);
                  setResolutionText('');
                }}
              >
                İptal
              </UnifiedButton>
              <UnifiedButton
                variant="success"
                onClick={() => handleResolve(showResolveModal)}
                disabled={resolutionText.length < 10 || isProcessing}
              >
                Çöz
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  Ticket #{viewingTicket.ticketNumber}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusBadge(viewingTicket.status)}
                  {getPriorityBadge(viewingTicket.priority)}
                </div>
              </div>
              <button
                onClick={() => setViewingTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  {viewingTicket.subject}
                </h4>
                <p className="mt-2 text-sm text-gray-600">
                  {viewingTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Kullanıcı:</span>
                  <p className="text-gray-600">
                    {viewingTicket.user.firstName} {viewingTicket.user.lastName}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Kategori:</span>
                  <p className="text-gray-600">
                    {getCategoryLabel(viewingTicket.category)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Tarih:</span>
                  <p className="text-gray-600">
                    {new Date(viewingTicket.createdAt).toLocaleDateString(
                      'tr-TR'
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Durum:</span>
                  <p className="text-gray-600">{viewingTicket.status}</p>
                </div>
              </div>

              {viewingTicket.messages && viewingTicket.messages.length > 0 && (
                <div>
                  <span className="font-medium">Mesajlar:</span>
                  <div className="mt-2 space-y-2">
                    {viewingTicket.messages.slice(0, 3).map((msg) => (
                      <div
                        key={msg.id}
                        className="rounded-lg bg-gray-50 p-3 text-sm"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-medium">
                            {msg.sender.firstName} {msg.sender.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleDateString(
                              'tr-TR'
                            )}
                          </span>
                        </div>
                        <p className="text-gray-600">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t pt-4">
                {!viewingTicket.assignee && (
                  <UnifiedButton
                    variant="primary"
                    onClick={() => handleAssign(viewingTicket.id)}
                    disabled={isProcessing}
                  >
                    <User className="mr-1 h-4 w-4" />
                    Bana Ata
                  </UnifiedButton>
                )}
                <UnifiedButton
                  variant="success"
                  onClick={() => {
                    setShowResolveModal(viewingTicket.id);
                    setViewingTicket(null);
                  }}
                  disabled={isProcessing}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Çöz
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
