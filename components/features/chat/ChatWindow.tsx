'use client';

import React from 'react';
import {
  X,
  Minimize2,
  Maximize2,
  MoreVertical,
  User,
  Bot,
  Phone,
  Video,
  Info,
  Star,
  Archive,
  Trash2,
  Flag,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  conversationId: string;
  isOpen: boolean;
  isMinimized: boolean;
  position?: 'center' | 'side' | 'fullscreen';
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

interface Conversation {
  id: string;
  title: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    role: 'user' | 'agent' | 'bot';
    status: 'online' | 'offline' | 'busy' | 'away';
    lastSeen?: string;
  };
  status: 'active' | 'waiting' | 'ended' | 'archived';
  unreadCount: number;
  lastActivity: string;
  tags?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department?: string;
  metadata?: {
    source: 'website' | 'mobile' | 'email' | 'social';
    browser?: string;
    location?: string;
    referrer?: string;
  };
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  isOpen,
  isMinimized,
  position = 'center',
  onClose,
  onMinimize,
  onMaximize,
  className,
}) => {
  const [conversation, setConversation] = React.useState<Conversation | null>(
    null
  );
  const [showInfo, setShowInfo] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);
  const [rating, setRating] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load conversation data
  React.useEffect(() => {
    const loadConversation = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock conversation data
        const mockConversation: Conversation = {
          id: conversationId,
          title: 'Müşteri Destek Görüşmesi',
          participant: {
            id: 'user-123',
            name: 'Ahmet Yılmaz',
            avatar: undefined,
            role: 'user',
            status: 'online',
            lastSeen: new Date().toISOString(),
          },
          status: 'active',
          unreadCount: 0,
          lastActivity: new Date().toISOString(),
          tags: ['billing', 'urgent'],
          priority: 'high',
          department: 'Customer Support',
          metadata: {
            source: 'website',
            browser: 'Chrome',
            location: 'İstanbul, TR',
            referrer: 'google.com',
          },
        };

        setConversation(mockConversation);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  const getPositionClasses = () => {
    switch (position) {
      case 'side':
        return 'fixed right-0 top-0 bottom-0 w-96 h-full';
      case 'fullscreen':
        return 'fixed inset-0 w-full h-full';
      default:
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-[600px]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleEndConversation = () => {
    if (conversation) {
      setConversation((prev) => (prev ? { ...prev, status: 'ended' } : null));
    }
  };

  const handleArchiveConversation = () => {
    if (conversation) {
      setConversation((prev) =>
        prev ? { ...prev, status: 'archived' } : null
      );
    }
  };

  const handleRateConversation = (newRating: number) => {
    setRating(newRating);
    // Here you would typically send the rating to your backend
    console.log('Conversation rated:', newRating);
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Şimdi aktif';
    if (diffMins < 60) return `${diffMins} dakika önce görüldü`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce görüldü`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün önce görüldü`;
  };

  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
          getPositionClasses(),
          className
        )}
      >
        <div className="p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Görüşme yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div
        className={cn(
          'z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
          getPositionClasses(),
          className
        )}
      >
        <div className="p-8 text-center">
          <p className="text-gray-600">Görüşme bulunamadı</p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Kapat
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'z-50 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
        getPositionClasses(),
        isMinimized ? 'h-16' : '',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              {conversation.participant.role === 'bot' ? (
                <Bot className="h-5 w-5 text-blue-600" />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div
              className={cn(
                'absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white',
                getStatusColor(conversation.participant.status)
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium text-gray-900">
              {conversation.participant.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>
                {conversation.participant.status === 'online'
                  ? 'Çevrimiçi'
                  : formatLastSeen(conversation.participant.lastSeen || '')}
              </span>
              {conversation.priority !== 'low' && (
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-xs font-medium',
                    getPriorityColor(conversation.priority)
                  )}
                >
                  {conversation.priority === 'urgent' && 'Acil'}
                  {conversation.priority === 'high' && 'Yüksek'}
                  {conversation.priority === 'medium' && 'Orta'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              /* Handle voice call */
            }}
            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <Phone className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              /* Handle video call */
            }}
            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <Video className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <Info className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute top-8 right-0 z-10 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => setShowActions(false)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Flag className="h-4 w-4" />
                  Görüşmeyi İşaretle
                </button>
                <button
                  onClick={() => {
                    handleArchiveConversation();
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Archive className="h-4 w-4" />
                  Arşivle
                </button>
                <button
                  onClick={() => {
                    handleEndConversation();
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Görüşmeyi Sonlandır
                </button>
              </div>
            )}
          </div>

          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}

          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex min-h-0 flex-1">
            {/* Main Chat Area */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <MessageList conversationId={conversationId} />
              </div>

              {/* Rating Section - Show if conversation is ended */}
              {conversation.status === 'ended' && rating === null && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-sm text-gray-700">
                    Görüşme kalitesini değerlendirin:
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRateConversation(star)}
                        className="p-1 text-gray-400 transition-colors hover:text-yellow-500"
                      >
                        <Star className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Thank You */}
              {rating !== null && (
                <div className="border-t border-gray-200 bg-green-50 p-4">
                  <p className="flex items-center gap-2 text-sm text-green-700">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    Değerlendirmeniz için teşekkürler! ({rating}/5)
                  </p>
                </div>
              )}

              {/* Message Input */}
              {conversation.status === 'active' && (
                <MessageInput
                  conversationId={conversationId}
                  disabled={conversation.status !== 'active'}
                />
              )}

              {/* Conversation Ended Message */}
              {conversation.status === 'ended' && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-600">
                    Görüşme sonlandırılmıştır.
                  </p>
                </div>
              )}
            </div>

            {/* Info Sidebar */}
            {showInfo && (
              <div className="w-80 overflow-y-auto border-l border-gray-200 bg-gray-50 p-4">
                <h4 className="mb-4 font-medium text-gray-900">
                  Görüşme Bilgileri
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Katılımcı
                    </label>
                    <p className="text-sm text-gray-900">
                      {conversation.participant.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Durum
                    </label>
                    <p className="text-sm text-gray-900">
                      {conversation.status === 'active' && 'Aktif'}
                      {conversation.status === 'waiting' && 'Bekliyor'}
                      {conversation.status === 'ended' && 'Sonlandı'}
                      {conversation.status === 'archived' && 'Arşivlendi'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Öncelik
                    </label>
                    <span
                      className={cn(
                        'mt-1 inline-block rounded-full border px-2 py-1 text-xs font-medium',
                        getPriorityColor(conversation.priority)
                      )}
                    >
                      {conversation.priority === 'urgent' && 'Acil'}
                      {conversation.priority === 'high' && 'Yüksek'}
                      {conversation.priority === 'medium' && 'Orta'}
                      {conversation.priority === 'low' && 'Düşük'}
                    </span>
                  </div>

                  {conversation.department && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Departman
                      </label>
                      <p className="text-sm text-gray-900">
                        {conversation.department}
                      </p>
                    </div>
                  )}

                  {conversation.tags && conversation.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Etiketler
                      </label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {conversation.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {conversation.metadata && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Teknik Bilgiler
                      </label>
                      <div className="mt-1 space-y-1 text-sm text-gray-900">
                        {conversation.metadata.source && (
                          <p>Kaynak: {conversation.metadata.source}</p>
                        )}
                        {conversation.metadata.browser && (
                          <p>Tarayıcı: {conversation.metadata.browser}</p>
                        )}
                        {conversation.metadata.location && (
                          <p>Konum: {conversation.metadata.location}</p>
                        )}
                        {conversation.metadata.referrer && (
                          <p>Referans: {conversation.metadata.referrer}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Son Aktivite
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(conversation.lastActivity).toLocaleString(
                        'tr-TR'
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4">
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
                    <Settings className="h-4 w-4" />
                    Görüşme Ayarları
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
