'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { Loading } from '@/components/ui';
import useAuthStore from '@/lib/core/store/auth';
import { ChatInterface } from '@/components/domains/messaging';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuthStore();
  const conversationId = params.id as string;

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
          <Loading size="lg" text="Konuşma yükleniyor..." />
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
        <ChatInterface conversationId={conversationId} currentUser={user} />
      </div>
    </AppLayout>
  );
}
