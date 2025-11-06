'use client';

import { useEffect } from 'react';
import { useSupport } from '@/hooks';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/shared/utils/date';
import { TicketChat } from './TicketChat';
import logger from '@/lib/infrastructure/monitoring/logger';

interface TicketDetailProps {
  ticketId: string;
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const support = useSupport();
  const {
    currentTicket: ticket,
    currentTicketLoading: loading,
    currentTicketError: error,
    fetchTicketById,
    closeTicket,
  } = support;

  useEffect(() => {
    if (ticketId) {
      fetchTicketById(ticketId);
    }
  }, [ticketId, fetchTicketById]);

  const handleCloseTicket = async () => {
    try {
      await closeTicket(ticketId);
    } catch (error) {
      logger.error(
        'Ticket kapatılırken hata',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <p>{error}</p>
      </Alert>
    );
  }

  if (!ticket) {
    return (
      <Alert>
        <p>Destek talebi bulunamadı.</p>
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {ticket.subject}
              </h1>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status === 'open' && 'Açık'}
                {ticket.status === 'in_progress' && 'İşlemde'}
                {ticket.status === 'closed' && 'Kapalı'}
              </Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority === 'high' && 'Yüksek'}
                {ticket.priority === 'medium' && 'Orta'}
                {ticket.priority === 'low' && 'Düşük'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
              <div>
                <span className="font-medium">ID:</span> {ticket.id}
              </div>
              <div>
                <span className="font-medium">Kategori:</span> {ticket.category}
              </div>
              <div>
                <span className="font-medium">Oluşturulma:</span>{' '}
                {formatDate(ticket.createdAt)}
              </div>
            </div>
          </div>

          {ticket.status !== 'closed' && (
            <Button
              variant="outline"
              onClick={handleCloseTicket}
              className="ml-4"
            >
              Talebi Kapat
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Talep Detayı</h2>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-gray-700">
            {ticket.description}
          </p>
        </div>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <>
            <div className="my-4 border-t" />
            <div>
              <h3 className="text-md mb-2 font-medium">Ekler</h3>
              <div className="space-y-2">
                {ticket.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center rounded bg-gray-50 p-2"
                  >
                    <span className="text-sm text-gray-600">
                      {attachment.name || `Ek ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Mesajlar</h2>
        <TicketChat ticketId={ticketId} />
      </Card>
    </div>
  );
}

export default TicketDetail;
