/**
 * ================================================
 * EMPTY ANALYTICS STATE COMPONENT
 * ================================================
 * Displayed when employer has no job postings
 *
 * Features:
 * - Friendly illustration/icon
 * - Helpful message
 * - Clear call-to-action
 * - Tips for first-time users
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-24
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Briefcase, TrendingUp, Plus, Info } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

interface EmptyAnalyticsStateProps {
  /**
   * Custom message to display (optional)
   */
  message?: string;
  /**
   * Show tips section
   */
  showTips?: boolean;
  /**
   * Custom CTA text
   */
  ctaText?: string;
  /**
   * Custom CTA action
   */
  onCtaClick?: () => void;
}

export function EmptyAnalyticsState({
  message = 'Henüz hiç iş ilanı oluşturmadınız',
  showTips = true,
  ctaText = 'İlk İş İlanınızı Oluşturun',
  onCtaClick,
}: EmptyAnalyticsStateProps) {
  const router = useRouter();

  const handleCreateJob = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      router.push('/marketplace/jobs/create');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-3xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-50 p-6">
            <BarChart3 className="h-16 w-16 text-blue-600" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="mb-3 text-2xl font-bold text-gray-900">
          İş İlanı Analitiği
        </h2>

        {/* Message */}
        <p className="mb-6 text-lg text-gray-600">{message}</p>

        <p className="mb-8 text-gray-500">
          İş ilanı oluşturduğunuzda, performans metriklerini burada
          görebilirsiniz
        </p>

        {/* CTA Button */}
        <div className="mb-8 flex justify-center gap-4">
          <Button
            onClick={handleCreateJob}
            size="lg"
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {ctaText}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/dashboard/my-jobs')}
          >
            İşlerime Dön
          </Button>
        </div>

        {/* Preview of what they'll see */}
        {showTips && (
          <>
            <div className="mb-6 border-t pt-6">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Ne tür veriler göreceğim?
                </h3>
              </div>

              <div className="grid gap-4 text-left md:grid-cols-3">
                {/* Stat Preview 1 */}
                <Card className="border-2 border-dashed border-gray-200 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Toplam İş İlanı
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">0</div>
                  <p className="text-xs text-gray-400">0 aktif ilan</p>
                </Card>

                {/* Stat Preview 2 */}
                <Card className="border-2 border-dashed border-gray-200 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Toplam Teklif
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">0</div>
                  <p className="text-xs text-gray-400">
                    Ortalama 0 teklif/ilan
                  </p>
                </Card>

                {/* Stat Preview 3 */}
                <Card className="border-2 border-dashed border-gray-200 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Görüntülenme
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">0</div>
                  <p className="text-xs text-gray-400">
                    Ortalama 0 görüntülenme
                  </p>
                </Card>
              </div>
            </div>

            {/* Tips Section */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-left">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="default" className="bg-blue-600">
                  İpucu
                </Badge>
              </div>
              <h4 className="mb-3 font-semibold text-gray-900">
                Etkili bir iş ilanı nasıl oluşturulur?
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600">•</span>
                  <span>
                    <strong>Detaylı açıklama:</strong> İş kapsamını net şekilde
                    belirtin
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600">•</span>
                  <span>
                    <strong>Gerçekçi bütçe:</strong> Piyasa koşullarına uygun
                    bütçe belirleyin
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600">•</span>
                  <span>
                    <strong>Doğru beceriler:</strong> İhtiyaç duyduğunuz
                    becerileri ekleyin
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600">•</span>
                  <span>
                    <strong>Hızlı yanıt:</strong> Gelen teklifleri hızlıca
                    değerlendirin
                  </span>
                </li>
              </ul>
            </Card>
          </>
        )}
      </Card>
    </div>
  );
}

/**
 * ================================================
 * LOADING STATE COMPONENT
 * ================================================
 */

export function AnalyticsLoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 animate-pulse">
        <div className="mb-2 h-8 w-64 rounded bg-gray-200"></div>
        <div className="h-4 w-96 rounded bg-gray-200"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="mb-2 h-8 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * ================================================
 * ERROR STATE COMPONENT
 * ================================================
 */

interface AnalyticsErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function AnalyticsErrorState({
  error,
  onRetry,
}: AnalyticsErrorStateProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-50 p-6">
            <BarChart3 className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-bold text-gray-900">
          Veriler Yüklenemedi
        </h2>

        <p className="mb-6 text-gray-600">
          {error?.message ||
            'İş ilanı analitiği yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'}
        </p>

        <div className="flex justify-center gap-4">
          {onRetry && (
            <Button onClick={onRetry} size="lg">
              Tekrar Dene
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/dashboard/my-jobs')}
          >
            İşlerime Dön
          </Button>
        </div>
      </Card>
    </div>
  );
}
