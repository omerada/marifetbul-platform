'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { useSupport } from '@/hooks/useSupport';
import { cn } from '@/lib/utils';

interface SupportLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  showCreateButton?: boolean;
  onCreateTicket?: () => void;
}

export const SupportLayout: React.FC<SupportLayoutProps> = ({
  children,
  showCreateButton = true,
  onCreateTicket,
}) => {
  const router = useRouter();
  const { tickets, ticketsLoading, fetchTickets } = useSupport();

  React.useEffect(() => {
    if (tickets.length === 0 && !ticketsLoading) {
      fetchTickets();
    }
  }, [tickets.length, ticketsLoading, fetchTickets]);

  const handleCreateTicket = () => {
    if (onCreateTicket) {
      onCreateTicket();
    } else {
      router.push('/help/support/create');
    }
  };

  const handleBack = () => {
    router.push('/help');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const recentTickets = tickets.slice(0, 5);
  const ticketStats = {
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    total: tickets.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Navigation */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Yardım Merkezi
                </button>
                <div className="h-5 w-px bg-gray-300" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Destek Sistemi
                </h1>
              </div>

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

            {/* Description */}
            <p className="mb-6 text-gray-600">
              Teknik destek taleplerinizi oluşturun, takip edin ve çözüm
              sürecini yönetin
            </p>

            {/* Quick Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Toplam
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {ticketStats.total}
                </div>
              </div>

              <div className="rounded-lg bg-yellow-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    Açık
                  </span>
                </div>
                <div className="text-2xl font-bold text-yellow-900">
                  {ticketStats.open}
                </div>
              </div>

              <div className="rounded-lg bg-orange-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">
                    İşlemde
                  </span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {ticketStats.inProgress}
                </div>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Çözülmüş
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {ticketStats.resolved}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <div className="flex-shrink-0 lg:w-80">
            {/* Quick Actions */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Hızlı İşlemler
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleCreateTicket}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Yeni Talep Oluştur
                    </div>
                    <div className="text-sm text-gray-600">
                      Destek talebi gönder
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/help/support/tickets')}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Taleplerim</div>
                    <div className="text-sm text-gray-600">
                      Geçmiş taleplerinizi görün
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/help/chat')}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Canlı Destek
                    </div>
                    <div className="text-sm text-gray-600">
                      Anında yardım alın
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                İletişim
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">destek@marifeto.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">0850 123 45 67</span>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Çalışma Saatleri:</p>
                  <p>Pazartesi - Cuma: 09:00 - 18:00</p>
                  <p>Cumartesi: 10:00 - 16:00</p>
                </div>
              </div>
            </div>

            {/* Recent Tickets */}
            {recentTickets.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Son Talepler
                </h3>
                <div className="space-y-3">
                  {recentTickets.map((ticket) => {
                    const StatusIcon = getStatusIcon(ticket.status);
                    return (
                      <button
                        key={ticket.id}
                        onClick={() =>
                          router.push(`/help/support/ticket/${ticket.id}`)
                        }
                        className="w-full rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-gray-300 hover:bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          <StatusIcon
                            className={cn(
                              'mt-0.5 h-4 w-4 flex-shrink-0',
                              getPriorityColor(ticket.priority)
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {ticket.subject}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                  getStatusColor(ticket.status)
                                )}
                              >
                                {getStatusText(ticket.status)}
                              </span>
                              <span className="text-xs text-gray-500">
                                #{ticket.id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {tickets.length > 5 && (
                  <button
                    onClick={() => router.push('/help/support/tickets')}
                    className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Tümünü Görüntüle ({tickets.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default SupportLayout;
