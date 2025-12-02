/**
 * QuickActions Component
 *
 * Quick action buttons for moderation dashboard
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { FileText, Download, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function QuickActions() {
  const router = useRouter();

  const handleGenerateReport = () => {
    toast.info('Rapor oluşturma özelliği yakında eklenecek');
    // Future: Navigate to /admin/reports/generate
  };

  const handleExportData = () => {
    toast.info('Veri dışa aktarma özelliği yakında eklenecek');
    // Future: Trigger export modal or download
  };

  const handleOpenSettings = () => {
    router.push('/admin/settings/moderation');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleGenerateReport}
        >
          <FileText className="mr-2 h-4 w-4" />
          Rapor Oluştur
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleExportData}
        >
          <Download className="mr-2 h-4 w-4" />
          Verileri Dışa Aktar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleOpenSettings}
        >
          <Settings className="mr-2 h-4 w-4" />
          Moderasyon Ayarları
        </Button>
      </CardContent>
    </Card>
  );
}
