/**
 * ================================================
 * JOB POSTING WIZARD - STEP 4: REVIEW & PUBLISH
 * ================================================
 * Review and publish job posting
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @created November 8, 2025
 *
 * Sprint: Job Posting Wizard Implementation
 * Task: T1.6 - Step 4 Review Implementation
 */

'use client';

import React from 'react';
import {
  ChevronLeft,
  Edit,
  CheckCircle2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Award,
} from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';

import type { StepFourProps } from './types';
import {
  CATEGORY_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  BUDGET_TYPE_OPTIONS,
} from './types';

// ================================================
// COMPONENT
// ================================================

export function StepFour({
  data,
  onPublish,
  onBack,
  onEdit,
  isSubmitting,
}: StepFourProps) {
  // Get display labels
  const categoryLabel =
    CATEGORY_OPTIONS.find((opt) => opt.value === data.category)?.label ||
    data.category;

  const experienceLevelLabel =
    EXPERIENCE_LEVEL_OPTIONS.find((opt) => opt.value === data.experienceLevel)
      ?.label || data.experienceLevel;

  const budgetTypeLabel =
    BUDGET_TYPE_OPTIONS.find((opt) => opt.value === data.budgetType)?.label ||
    data.budgetType;

  // Format budget display
  const budgetDisplay = (() => {
    if (data.budgetType === 'HOURLY' && data.hourlyRate) {
      return `${data.hourlyRate} TL/saat`;
    }
    if (data.budgetType === 'FIXED') {
      if (data.budgetMin && data.budgetMax) {
        return `${data.budgetMin} - ${data.budgetMax} TL`;
      }
      if (data.budgetMin) {
        return `${data.budgetMin}+ TL`;
      }
      if (data.budgetMax) {
        return `${data.budgetMax} TL&apos;ye kadar`;
      }
    }
    return 'Belirtilmedi';
  })();

  // Format deadline
  const deadlineDisplay = data.deadline
    ? new Date(data.deadline).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Belirtilmedi';

  const handlePublish = () => {
    onPublish(data);
  };

  // ==================== RENDER ====================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>İlan Önizleme</CardTitle>
            <p className="text-muted-foreground text-sm">
              İlanınızı kontrol edin ve yayınlayın
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Yayına Hazır
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Temel Bilgiler
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
            >
              <Edit className="mr-1 h-4 w-4" />
              Düzenle
            </Button>
          </div>

          <div className="bg-muted space-y-3 rounded-lg p-4">
            <div>
              <h4 className="mb-1 text-xl font-bold">
                {data.title || 'Başlık yok'}
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">{categoryLabel}</Badge>
                {data.location && !data.isRemote && (
                  <div className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {data.location}
                  </div>
                )}
                {data.isRemote && (
                  <Badge
                    variant="outline"
                    className="border-green-500 text-green-700"
                  >
                    🌍 Uzaktan
                  </Badge>
                )}
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {data.description || 'Açıklama yok'}
              </p>
            </div>
          </div>
        </section>

        {/* Skills & Requirements Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <Award className="h-5 w-5 text-purple-600" />
              Beceriler & Gereksinimler
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
            >
              <Edit className="mr-1 h-4 w-4" />
              Düzenle
            </Button>
          </div>

          <div className="bg-muted space-y-3 rounded-lg p-4">
            {/* Experience Level */}
            <div>
              <p className="mb-2 text-sm font-medium">Deneyim Seviyesi:</p>
              <Badge variant="secondary">{experienceLevelLabel}</Badge>
            </div>

            {/* Required Skills */}
            <div>
              <p className="mb-2 text-sm font-medium">Gerekli Beceriler:</p>
              <div className="flex flex-wrap gap-2">
                {data.requiredSkills && data.requiredSkills.length > 0 ? (
                  data.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Beceri belirtilmedi
                  </p>
                )}
              </div>
            </div>

            {/* Additional Requirements */}
            {data.requirements && data.requirements.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Ek Gereksinimler:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {data.requirements.map((req, index) => (
                    <li key={index} className="text-muted-foreground">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Budget & Timeline Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <DollarSign className="h-5 w-5 text-green-600" />
              Bütçe & Zaman
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
            >
              <Edit className="mr-1 h-4 w-4" />
              Düzenle
            </Button>
          </div>

          <div className="bg-muted grid gap-3 rounded-lg p-4 md:grid-cols-2">
            {/* Budget */}
            <div>
              <p className="mb-1 text-xs font-medium text-gray-600">Bütçe</p>
              <p className="font-semibold">{budgetTypeLabel}</p>
              <p className="text-sm text-green-600">{budgetDisplay}</p>
            </div>

            {/* Duration */}
            {data.duration && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-600">
                  Proje Süresi
                </p>
                <p className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {data.duration}
                </p>
              </div>
            )}

            {/* Deadline */}
            {data.deadline && (
              <div className="md:col-span-2">
                <p className="mb-1 text-xs font-medium text-gray-600">
                  Son Başvuru Tarihi
                </p>
                <p className="text-sm font-medium text-orange-600">
                  📅 {deadlineDisplay}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Important Notice */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900">
            ℹ️ Yayınlamadan Önce
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• İlan bilgilerini dikkatlice kontrol edin</li>
            <li>• Yayınlandıktan sonra bazı alanlar düzenlenemez</li>
            <li>• Freelancer&apos;lar tekliflerini göndermeye başlayacak</li>
            <li>• E-posta bildirimleri almaya başlayacaksınız</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Geri
          </Button>

          <Button
            onClick={handlePublish}
            disabled={isSubmitting}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Yayınlanıyor...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                İlanı Yayınla
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default StepFour;
