/**
 * Portfolio Reorder Page
 * Sprint 17: Portfolio Management System
 *
 * Dedicated page for reordering portfolio items via drag & drop
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { usePortfolio } from '@/hooks/business/portfolio';
import { PortfolioReorderList } from '@/components/domains/portfolio';

export const dynamic = 'force-dynamic';

export default function PortfolioReorderPage() {
  const router = useRouter();
  const { portfolios, isLoading: _isLoading } = usePortfolio();
  const [showReorderModal, setShowReorderModal] = useState(true);

  const handleBack = () => {
    router.push('/dashboard/portfolio');
  };

  const handleModalClose = () => {
    setShowReorderModal(false);
    handleBack();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Portfolyo Sıralama
            </h1>
            <p className="mt-2 text-gray-600">
              Portfolyo öğelerinizi sürükleyip bırakarak sıralayın
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <Save className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Otomatik Kayıt</h3>
            <p className="text-sm text-blue-700">
              Yaptığınız değişiklikler otomatik olarak kaydedilir. Herhangi bir
              kaydet butonuna basmaya gerek yok.
            </p>
          </div>
        </div>
      </Card>

      {/* Reorder List Modal */}
      <PortfolioReorderList
        portfolios={portfolios}
        isOpen={showReorderModal}
        onClose={handleModalClose}
      />
    </div>
  );
}
