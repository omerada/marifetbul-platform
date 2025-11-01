/**
 * ================================================
 * DISPUTES PAGE
 * ================================================
 * Main page for viewing and managing user disputes
 *
 * Features:
 * - List all user disputes
 * - Filter by status
 * - View dispute details
 * - Add evidence
 * - Refresh data
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 16: Dispute System Completion
 */

'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { DisputeList } from '@/components/domains/disputes';
import { EvidenceUpload } from '@/components/domains/disputes';
import { useDisputeList } from '@/hooks/business/disputes';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import type { DisputeResponse } from '@/types/dispute';
import { AlertTriangle, HelpCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// ================================================
// COMPONENT
// ================================================

export default function DisputesPage() {
  const { disputes, isLoading, error, mutate } = useDisputeList({
    page: 0,
    size: 50,
    refreshInterval: 30000, // Auto-refresh every 30 seconds
  });

  const [selectedDispute, setSelectedDispute] =
    useState<DisputeResponse | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Handle add evidence click
  const handleAddEvidence = (dispute: DisputeResponse) => {
    setSelectedDispute(dispute);
    setShowEvidenceModal(true);
  };

  // Handle evidence upload success
  const handleEvidenceUploadSuccess = () => {
    setShowEvidenceModal(false);
    setSelectedDispute(null);
    mutate(); // Refresh disputes list
  };

  // Count active disputes
  const activeDisputesCount = disputes.filter(
    (d) => d.status !== 'RESOLVED' && d.status !== 'CLOSED'
  ).length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  İtirazlarım
                </h1>
                <p className="text-gray-600">
                  Sipariş itirazlarınızı görüntüleyin ve yönetin
                </p>
              </div>

              {/* Help Button */}
              <Link href="/support/help">
                <Button variant="outline" size="sm">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Yardım
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {disputes.length}
                    </div>
                    <div className="text-sm text-gray-600">Toplam İtiraz</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-100 p-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {activeDisputesCount}
                    </div>
                    <div className="text-sm text-gray-600">Aktif İtiraz</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-3">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {
                        disputes.filter(
                          (d) =>
                            d.status === 'RESOLVED' || d.status === 'CLOSED'
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Çözümlenmiş İtiraz
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Info Banner */}
          {disputes.length === 0 && !isLoading && (
            <Card className="mb-6 border-blue-200 bg-blue-50 p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-blue-600" />
                <div>
                  <h3 className="mb-2 font-semibold text-blue-900">
                    İtiraz Süreci Hakkında
                  </h3>
                  <p className="mb-3 text-sm text-blue-800">
                    Bir siparişle ilgili sorun yaşıyorsanız itiraz
                    açabilirsiniz. İtirazınız incelenir ve en kısa sürede çözüme
                    kavuşturulur.
                  </p>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold">•</span>
                      <span>
                        İtiraz açmak için sipariş detay sayfasından &quot;İtiraz
                        Aç&quot; butonunu kullanın
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold">•</span>
                      <span>
                        Kanıt olarak ekran görüntüleri, mesajlar veya belgeler
                        ekleyebilirsiniz
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 font-bold">•</span>
                      <span>
                        İtirazınız genellikle 24-48 saat içinde incelenir
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Disputes List */}
          <DisputeList
            disputes={disputes}
            isLoading={isLoading}
            error={error}
            onRefresh={mutate}
            onDisputeClick={handleAddEvidence}
            showFilters={true}
            emptyMessage="Henüz itirazınız bulunmuyor."
          />

          {/* Evidence Upload Modal */}
          {showEvidenceModal && selectedDispute && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Kanıt Ekle - İtiraz #{selectedDispute.id.slice(0, 8)}
                  </h2>
                  <button
                    onClick={() => setShowEvidenceModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className="mb-4 text-sm text-gray-600">
                  İtirazınızı desteklemek için ekran görüntüleri, belgeler veya
                  diğer kanıtları yükleyin.
                </p>

                <EvidenceUpload
                  files={[]}
                  onFilesChange={(_urls) => {
                    // Files uploaded successfully - update dispute with evidence
                    handleEvidenceUploadSuccess();
                  }}
                  maxFiles={5}
                  maxSizeMB={10}
                />

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEvidenceModal(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleEvidenceUploadSuccess}
                  >
                    Tamamla
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
