/**
 * QuickActions Component
 *
 * Card with quick action buttons
 */

import { Ban, UserX, MessageCircle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import type { QuickActionsProps } from '../types/moderationDashboardTypes';

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => onAction?.('bulk_ban')}
        >
          <Ban className="mr-2 h-4 w-4" />
          Toplu Engelleme
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => onAction?.('user_history')}
        >
          <UserX className="mr-2 h-4 w-4" />
          Kullanıcı Geçmişi
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => onAction?.('send_warning')}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Uyarı Mesajı Gönder
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => onAction?.('generate_report')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Rapor Oluştur
        </Button>
      </CardContent>
    </Card>
  );
}
