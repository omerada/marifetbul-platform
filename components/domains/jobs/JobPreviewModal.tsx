'use client';

/**
 * ================================================
 * JOB PREVIEW MODAL COMPONENT
 * ================================================
 * Preview job before publishing/updating
 *
 * Features:
 * - Read-only view of job details
 * - Highlight changes (for edit mode)
 * - Publish or cancel actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Job Management Workflow
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import type { JobPostingFormData } from '@/lib/core/validations/jobs';

// ================================================
// TYPES
// ================================================

export interface JobPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobData: JobPostingFormData;
  isPublishing?: boolean;
  mode?: 'create' | 'edit';
}

// ================================================
// COMPONENT
// ================================================

export function JobPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  jobData,
  isPublishing = false,
  mode = 'create',
}: JobPreviewModalProps) {
  // ==================== RENDER ====================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            İş İlanı Önizleme
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <Card className="p-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {jobData.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{jobData.experienceLevel}</span>
              </div>
              {jobData.isRemote && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Uzaktan</span>
                </div>
              )}
              {jobData.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{jobData.location}</span>
                </div>
              )}
              {jobData.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{jobData.duration}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Budget */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-green-600" />
              Bütçe
            </h3>
            <div className="text-gray-700">
              {jobData.budgetType === 'FIXED' && (
                <p className="text-2xl font-bold text-green-600">
                  {jobData.budgetMin?.toLocaleString('tr-TR')} -{' '}
                  {jobData.budgetMax?.toLocaleString('tr-TR')} TL
                </p>
              )}
              {jobData.budgetType === 'HOURLY' && (
                <p className="text-2xl font-bold text-green-600">
                  {jobData.hourlyRate?.toLocaleString('tr-TR')} TL/saat
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {jobData.budgetType === 'FIXED'
                  ? 'Sabit ücret'
                  : 'Saatlik ücret'}
              </p>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-5 w-5 text-blue-600" />
              İş Açıklaması
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{jobData.description}</p>
            </div>
          </Card>

          {/* Skills */}
          {jobData.requiredSkills && jobData.requiredSkills.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Tag className="h-5 w-5 text-purple-600" />
                Gerekli Yetenekler
              </h3>
              <div className="flex flex-wrap gap-2">
                {jobData.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Deadline */}
          {jobData.deadline && (
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-orange-600" />
                Son Başvuru Tarihi
              </h3>
              <p className="text-gray-700">
                {new Date(jobData.deadline).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPublishing}>
            İptal
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={isPublishing}
            disabled={isPublishing}
          >
            {mode === 'create' ? 'Yayınla' : 'Güncelle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
