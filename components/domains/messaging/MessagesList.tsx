'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { MessageSquare, Archive, Inbox, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Conversation } from '@/types/business/features/messaging';
import { ConversationItem } from './ConversationItem';
import { ConversationListHeader } from './ConversationListHeader';
import { ConversationListSkeleton } from './ConversationListSkeleton';
import {
  ConfirmArchiveModal,
  ConfirmUnarchiveModal,
  ConfirmDeleteModal,
} from './ConversationConfirmModals';
import type { ConversationFilter } from '@/hooks/business/messaging/useMessages';
import { useWebSocket } from '@/hooks/infrastructure/websocket/useWebSocket';
import { useMessagingStore } from '@/lib/core/store/domains/messaging/MessagingStore';
import { useInfiniteScroll } from '@/hooks/shared/useInfiniteScroll';
import logger from '@/lib/infrastructure/monitoring/logger';

interface MessagesListProps {
  /**
   * Legacy: Direct conversation list (for backward compatibility)
   * Use fetchPage callback for infinite scroll pagination
   */
  conversations?: Conversation[];
  /**
   * Legacy: Loading state (for backward compatibility)
   * Use useInfiniteScroll loading state with fetchPage
   */
  isLoading?: boolean;
  filter?: ConversationFilter;
  onFilterChange?: (filter: ConversationFilter) => void;
  onArchive?: (conversationId: string) => Promise<boolean>;
  onUnarchive?: (conversationId: string) => Promise<boolean>;
  onDelete?: (conversationId: string) => Promise<boolean>;
  /**
   * Fetch page callback for infinite scroll pagination
   * @param page - Page number (0-indexed)
   * @param pageSize - Number of items per page
   * @returns Promise with data, hasMore flag, and optional total count
   */
  fetchPage?: (
    page: number,
    pageSize: number
  ) => Promise<{
    data: Conversation[];
    hasMore: boolean;
    total?: number;
  }>;
  /**
   * Page size for infinite scroll (default: 20)
   */
  pageSize?: number;
  /**
   * Enable infinite scroll pagination (default: false for backward compatibility)
   */
  enableInfiniteScroll?: boolean;
}

export function MessagesList({
  conversations: legacyConversations = [],
  isLoading: legacyIsLoading = false,
  filter = 'all',
  onFilterChange,
  onArchive,
  onUnarchive,
  onDelete,
  fetchPage,
  pageSize = 20,
  enableInfiniteScroll = false,
}: MessagesListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState<{
    type: 'archive' | 'unarchive' | 'delete' | null;
    conversationId: string | null;
    isLoading: boolean;
  }>({
    type: null,
    conversationId: null,
    isLoading: false,
  });

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    autoConnect: true,
    enableStoreIntegration: true,
  });

  // Get total unread count from store
  const totalUnreadCount = useMessagingStore((state) => state.totalUnreadCount);

  // Infinite scroll pagination (optional)
  const infiniteScrollResult = useInfiniteScroll<Conversation>({
    fetchPage:
      fetchPage || (() => Promise.resolve({ data: [], hasMore: false })),
    pageSize,
    enabled: enableInfiniteScroll && !!fetchPage,
  });

  // Choose data source: infinite scroll or legacy props
  const conversations = enableInfiniteScroll
    ? infiniteScrollResult.data
    : legacyConversations;
  const isLoading = enableInfiniteScroll
    ? infiniteScrollResult.isLoading
    : legacyIsLoading;

  // Log WebSocket connection status
  useEffect(() => {
    if (isConnected) {
      logger.info('WebSocket connected - real-time updates enabled');
    }
  }, [isConnected]);

  // Memoized filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;

    const searchLower = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const participantNames = conv.participants
        .map((p) => `${p.firstName} ${p.lastName}`.toLowerCase())
        .join(' ');
      const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';
      const contextTitle = conv.contextData?.title?.toLowerCase() || '';

      return (
        participantNames.includes(searchLower) ||
        lastMessageContent.includes(searchLower) ||
        contextTitle.includes(searchLower)
      );
    });
  }, [conversations, searchQuery]);

  const handleConversationClick = useCallback(
    (conversationId: string) => {
      router.push(`/messages/${conversationId}`);
    },
    [router]
  );

  const handleArchiveClick = useCallback((conversationId: string) => {
    setModalState({
      type: 'archive',
      conversationId,
      isLoading: false,
    });
  }, []);

  const handleUnarchiveClick = useCallback((conversationId: string) => {
    setModalState({
      type: 'unarchive',
      conversationId,
      isLoading: false,
    });
  }, []);

  const handleDeleteClick = useCallback((conversationId: string) => {
    setModalState({
      type: 'delete',
      conversationId,
      isLoading: false,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!modalState.conversationId || !modalState.type) return;

    setModalState((prev) => ({ ...prev, isLoading: true }));

    try {
      let success = false;
      if (modalState.type === 'archive' && onArchive) {
        success = await onArchive(modalState.conversationId);
      } else if (modalState.type === 'unarchive' && onUnarchive) {
        success = await onUnarchive(modalState.conversationId);
      } else if (modalState.type === 'delete' && onDelete) {
        success = await onDelete(modalState.conversationId);
      }

      if (success) {
        setModalState({ type: null, conversationId: null, isLoading: false });
      }
    } catch (error) {
      logger.error(
        'Error performing action',
        error instanceof Error ? error : undefined,
        { conversationId: modalState.conversationId, type: modalState.type }
      );
    } finally {
      setModalState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [
    modalState.conversationId,
    modalState.type,
    onArchive,
    onUnarchive,
    onDelete,
  ]);

  const handleCloseModal = useCallback(() => {
    if (!modalState.isLoading) {
      setModalState({ type: null, conversationId: null, isLoading: false });
    }
  }, [modalState.isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
        </div>
        <ConversationListSkeleton count={5} />
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      <ConfirmArchiveModal
        open={modalState.type === 'archive'}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        isLoading={modalState.isLoading}
      />
      <ConfirmUnarchiveModal
        open={modalState.type === 'unarchive'}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        isLoading={modalState.isLoading}
      />
      <ConfirmDeleteModal
        open={modalState.type === 'delete'}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        isLoading={modalState.isLoading}
      />
      <div className="space-y-6">
        {/* Header with connection status and unread count */}
        <ConversationListHeader
          totalConversations={conversations.length}
          unreadCount={totalUnreadCount}
          isConnected={isConnected}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={conversations.length > 0}
        />

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              {searchQuery ? 'Sonuç bulunamadı' : 'Henüz mesaj yok'}
            </h2>
            <p className="text-gray-600">
              {searchQuery
                ? 'Arama kriterlerinize uygun konuşma bulunamadı.'
                : 'İlk mesajınızı göndererek başlayın.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isArchived={filter === 'archived'}
                onClick={handleConversationClick}
                onArchive={handleArchiveClick}
                onUnarchive={handleUnarchiveClick}
                onDelete={handleDeleteClick}
              />
            ))}

            {/* Infinite Scroll Trigger & Loading More Indicator */}
            {enableInfiniteScroll && infiniteScrollResult.hasMore && (
              <div
                ref={infiniteScrollResult.observerRef}
                className="flex items-center justify-center py-4"
              >
                {infiniteScrollResult.isLoadingMore ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Daha fazla konuşma yüklemek için aşağı kaydırın
                  </div>
                )}
              </div>
            )}

            {/* No More Items Indicator */}
            {enableInfiniteScroll &&
              !infiniteScrollResult.hasMore &&
              conversations.length > 0 && (
                <div className="py-4 text-center text-sm text-gray-500">
                  Tüm konuşmalar yüklendi
                </div>
              )}
          </div>
        )}

        {/* Filter Tabs */}
        {onFilterChange && (
          <div className="mt-6 flex gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={() => onFilterChange('all')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Inbox className="h-4 w-4" />
                Tümü
              </span>
            </button>
            <button
              onClick={() => onFilterChange('active')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Aktif
              </span>
            </button>
            <button
              onClick={() => onFilterChange('archived')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                filter === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Archive className="h-4 w-4" />
                Arşiv
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
