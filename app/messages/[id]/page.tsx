'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { Loading } from '@/components/ui';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { Card } from '@/components/ui/Card';
import { MessageSquare } from 'lucide-react';

export default function ConversationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuthStore();

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
          <Loading size="lg" text="Sayfa yükleniyor..." />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Mesajlaşma Özelliği
            </h2>
            <p className="text-gray-600">
              Mesajlaşma sistemi şu anda geliştirme aşamasında. İletişim için
              destek sistemini kullanabilirsiniz.
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
