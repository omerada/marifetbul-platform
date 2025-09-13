'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Paperclip,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Eye,
  Download,
} from 'lucide-react';
import { useSupportTicket } from '@/hooks/useSupport';
import { cn } from '@/lib/utils';

interface TicketDetailProps {
  ticketId: string;
  onBack?: () => void;
  className?: string;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticketId,
  onBack,
  className,
}) => {
  const router = useRouter();
  const {
    ticket,
    loading: ticketLoading,
    error: ticketError,
    reload: fetchTicketById,
    addResponse,
  } = useSupportTicket(ticketId);

  const [responseText, setResponseText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSatisfactionForm, setShowSatisfactionForm] = React.useState(false);
  const [satisfactionRating, setSatisfactionRating] = React.useState<
    number | null
  >(null);
  const [satisfactionComment, setSatisfactionComment] = React.useState('');

  React.useEffect(() => {
    if (!ticket && !ticketLoading) {
      fetchTicketById();
    }
  }, [ticket, ticketLoading, fetchTicketById]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/dashboard/support');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'closed':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() || !ticket) return;

    setIsSubmitting(true);
    try {
      await addResponse({
        ticketId: ticket.id,
        content: responseText,
        isPublic: true,
        attachments: [],
      });
      setResponseText('');
      // Refresh ticket data
      await fetchTicketById();
    } catch (error) {
      console.error('Response submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSatisfaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || satisfactionRating === null) return;

    try {
      // This would normally submit satisfaction feedback
      console.log('Satisfaction feedback:', {
        rating: satisfactionRating,
        comment: satisfactionComment,
      });
      setShowSatisfactionForm(false);
      setSatisfactionRating(null);
      setSatisfactionComment('');
    } catch (error) {
      console.error('Failed to submit satisfaction feedback:', error);
    }
  };

  if (ticketLoading) {
    return (
      <div className={cn('p-8', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          </div>
          <div className="h-32 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (ticketError || !ticket) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <div className="space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900">
            Destek talebi bulunamadı
          </h3>
          <p className="text-gray-600">
            {ticketError ||
              'Bu destek talebi mevcut değil veya erişim izniniz yok.'}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('mx-auto max-w-4xl', className)}>
      {/* Header */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium',
                  getStatusColor(ticket.status)
                )}
              >
                {getStatusIcon(ticket.status)}
                {ticket.status === 'open' && 'Açık'}
                {ticket.status === 'in_progress' && 'İşlemde'}
                {ticket.status === 'resolved' && 'Çözümlendi'}
                {ticket.status === 'closed' && 'Kapatıldı'}
              </span>

              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-sm font-medium',
                  getPriorityColor(ticket.priority)
                )}
              >
                {ticket.priority === 'urgent' && 'Kritik'}
                {ticket.priority === 'high' && 'Yüksek'}
                {ticket.priority === 'medium' && 'Orta'}
                {ticket.priority === 'low' && 'Düşük'}
              </span>
            </div>
          </div>

          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            {ticket.subject}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {ticket.user.firstName} {ticket.user.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{ticket.responses?.length || 0} yanıt</span>
            </div>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">
              {ticket.description}
            </p>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium text-gray-900">
                Ek Dosyalar ({ticket.attachments.length})
              </h4>
              <div className="space-y-2">
                {ticket.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {attachment.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {attachment.size} • {attachment.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 transition-colors hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 transition-colors hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responses */}
      {ticket.responses && ticket.responses.length > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Yanıtlar ({ticket.responses.length})
            </h3>
          </div>
          <div className="space-y-6 p-6">
            {ticket.responses.map((response) => (
              <div
                key={response.id}
                className="border-l-4 border-gray-200 pl-6"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {response.author?.role === 'agent'
                          ? 'Destek Temsilcisi'
                          : `${ticket.user.firstName} ${ticket.user.lastName}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(response.createdAt).toLocaleDateString(
                          'tr-TR',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </div>
                      {response.author?.role === 'agent' && (
                        <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          Resmi Yanıt
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 transition-colors hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="whitespace-pre-wrap">{response.content}</p>
                </div>

                {/* Response Attachments */}
                {response.attachments && response.attachments.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {response.attachments.map((attachment, attachIndex) => (
                      <div
                        key={attachIndex}
                        className="flex items-center gap-3 rounded border bg-gray-50 p-2"
                      >
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          <span className="text-gray-700">
                            {attachment.name}
                          </span>
                          <span className="ml-2 text-gray-500">
                            ({attachment.size})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Response Actions */}
                {response.author?.role === 'agent' && (
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className="flex items-center gap-1 transition-colors hover:text-gray-700">
                      <ThumbsUp className="h-4 w-4" />
                      Yararlı
                    </button>
                    <button className="flex items-center gap-1 transition-colors hover:text-gray-700">
                      <ThumbsDown className="h-4 w-4" />
                      Yararlı değil
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Form */}
      {ticket.status !== 'closed' && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Yanıt Ekle</h3>
          </div>
          <form onSubmit={handleSubmitResponse} className="p-6">
            <div className="mb-4">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Yanıtınızı buraya yazın..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                  <Paperclip className="h-4 w-4" />
                  Dosya Ekle
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !responseText.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Gönder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Satisfaction Survey */}
      {ticket.status === 'resolved' && !showSatisfactionForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Memnuniyet Anketi
                </h3>
                <p className="text-gray-600">
                  Bu destek talebindeki hizmetimizi değerlendirin
                </p>
              </div>
              <button
                onClick={() => setShowSatisfactionForm(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Değerlendir
              </button>
            </div>
          </div>
        </div>
      )}

      {showSatisfactionForm && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Memnuniyet Anketi
            </h3>
          </div>
          <form onSubmit={handleSubmitSatisfaction} className="p-6">
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Hizmet kalitemizi nasıl değerlendirirsiniz?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setSatisfactionRating(rating)}
                    className={cn(
                      'rounded-lg p-2 transition-colors',
                      satisfactionRating === rating
                        ? 'bg-yellow-50 text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-500'
                    )}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ek yorumlarınız (isteğe bağlı)
              </label>
              <textarea
                value={satisfactionComment}
                onChange={(e) => setSatisfactionComment(e.target.value)}
                placeholder="Hizmetimiz hakkında düşüncelerinizi paylaşın..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={satisfactionRating === null}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Gönder
              </button>
              <button
                type="button"
                onClick={() => setShowSatisfactionForm(false)}
                className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
