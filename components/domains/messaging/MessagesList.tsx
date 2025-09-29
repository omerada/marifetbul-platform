'use client';

import { Card } from '@/components/ui/Card';
import { MessageSquare, Mail } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { useRouter } from 'next/navigation';

export function MessagesList() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
      </div>

      <Card className="p-8 text-center">
        <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Mesajlaşma Sistemi
        </h2>
        <p className="mb-6 text-gray-600">
          Mesajlaşma sistemi şu anda geliştirme aşamasında. 
          İletişim için destek sistemini kullanabilirsiniz.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => router.push('/support')}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Destek Talebi Oluştur
          </Button>
          <Button
            onClick={() => router.push('/contact')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            İletişim Formu
          </Button>
        </div>
      </Card>
    </div>
  );
}