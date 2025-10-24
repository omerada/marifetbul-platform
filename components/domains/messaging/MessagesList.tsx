'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MessageSquare, Search, Archive, Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Conversation } from '@/types/business/features/messaging';
import { ConversationItem } from './ConversationItem';
import {
  ConfirmArchiveModal,
  ConfirmUnarchiveModal,
  ConfirmDeleteModal,
} from './ConversationConfirmModals';
import type { ConversationFilter } from '@/hooks/business/messaging/useMessages';

interface MessagesListProps {
  conversations?: Conversation[];
  isLoading?: boolean;
  filter?: ConversationFilter;
  onFilterChange?: (filter: ConversationFilter) => void;
  onArchive?: (conversationId: string) => Promise<boolean>;
  onUnarchive?: (conversationId: string) => Promise<boolean>;
  onDelete?: (conversationId: string) => Promise<boolean>;
}

export function MessagesList({
  conversations = [],
  isLoading = false,
  filter = 'all',
  onFilterChange,
  onArchive,
  onUnarchive,
  onDelete,
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
      console.error('Error performing action:', error);
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
        <Card className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="mx-auto h-8 w-3/4 rounded bg-gray-200"></div>
            <div className="mx-auto h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </Card>
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
          {conversations.length > 0 && (
            <div className="text-sm text-gray-600">
              {conversations.filter((c) => c.unreadCount > 0).length} okunmamış
            </div>
          )}
        </div>

        {/* Search */}
        {conversations.length > 0 && (
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Konuşmalarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

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
