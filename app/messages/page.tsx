'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { Loading } from '@/components/ui';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { MessagesList } from '@/components/domains/messaging';
import {
  useConversations,
  type ConversationFilter,
} from '@/hooks/business/messaging/useMessages';

export default function MessagesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuthStore();
  const [filter, setFilter] = useState<ConversationFilter>('all');

  const {
    conversations,
    isLoading: conversationsLoading,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
  } = useConversations(filter);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <AppLayout showFooter={false}>
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" text="Mesajlar yükleniyor..." />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
            <p className="mt-1 text-gray-600">
              Müşterileriniz ve işverenlerinizle iletişim kurun
            </p>
          </div>

          <MessagesList
            conversations={conversations}
            isLoading={conversationsLoading}
            filter={filter}
            onFilterChange={setFilter}
            onArchive={archiveConversation}
            onUnarchive={unarchiveConversation}
            onDelete={deleteConversation}
          />
        </div>
      </div>
    </AppLayout>
  );
}
