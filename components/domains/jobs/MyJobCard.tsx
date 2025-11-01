/**
 * MyJobCard Component
 * Displays employer's own job with management actions
 */

'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { JobResponse } from '@/types/backend-aligned';
import {
  formatBudget,
  getExperienceLevelLabel,
  getJobStatusLabel,
  isDeadlineApproaching,
  isDeadlinePassed,
  getDaysUntilDeadline,
  canEditJob,
  canDeleteJob,
  canCloseJob,
  canReopenJob,
} from '@/lib/api/jobs';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface MyJobCardProps {
  job: JobResponse;
  onView: (jobId: string) => void;
  onEdit: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onClose: (jobId: string) => void;
  onReopen: (jobId: string) => void;
  onViewProposals: (jobId: string) => void;
}

export function MyJobCard({
  job,
  onView,
  onEdit,
  onDelete,
  onClose,
  onReopen,
  onViewProposals,
}: MyJobCardProps) {
  const _toast = useToast();
  const isApproaching = isDeadlineApproaching(job);
  const isPassed = isDeadlinePassed(job);
  const deadlineDays = getDaysUntilDeadline(job);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      case 'OPEN':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-700';
      case 'CLOSED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {job.title}
              </h3>
              <Badge className={getStatusColor(job.status)}>
                {getJobStatusLabel(job.status)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.category.name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(job.postedAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {job.viewCount} görüntülenme
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-gray-700">{job.description}</p>

        {/* Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {job.requiredSkills.slice(0, 5).map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-100 text-gray-700"
              >
                {skill}
              </Badge>
            ))}
            {job.requiredSkills.length > 5 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                +{job.requiredSkills.length - 5} daha
              </Badge>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4 border-y py-4 text-sm md:grid-cols-4">
          {/* Budget */}
          <div>
            <div className="mb-1 flex items-center gap-1 text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Bütçe</span>
            </div>
            <div className="font-semibold text-gray-900">
              {formatBudget(job)}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <div className="mb-1 text-gray-600">Seviye</div>
            <div className="font-semibold text-gray-900">
              {getExperienceLevelLabel(job.experienceLevel)}
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="mb-1 flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Konum</span>
            </div>
            <div className="font-semibold text-gray-900">
              {job.isRemote ? 'Uzaktan' : job.location || 'Belirtilmemiş'}
            </div>
          </div>

          {/* Proposals */}
          <div>
            <div className="mb-1 flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span>Teklifler</span>
            </div>
            <div className="font-semibold text-gray-900">
              {job.proposalCount} teklif
            </div>
          </div>
        </div>

        {/* Deadline Warning */}
        {job.deadline && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
              isPassed
                ? 'bg-red-50 text-red-700'
                : isApproaching
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-gray-50 text-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>
              Son tarih:{' '}
              {isPassed
                ? `${Math.abs(deadlineDays!)} gün önce geçti`
                : deadlineDays !== null
                  ? `${deadlineDays} gün kaldı`
                  : 'Belirtilmemiş'}
            </span>
            {(isApproaching || isPassed) && (
              <AlertCircle className="ml-auto h-4 w-4" />
            )}
          </div>
        )}

        {/* Proposal Button */}
        {job.proposalCount > 0 && (
          <Button
            variant="outline"
            className="mb-4 w-full"
            onClick={() => onViewProposals?.(job.id)}
          >
            <Users className="mr-2 h-4 w-4" />
            {job.proposalCount} Teklifi Görüntüle
          </Button>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* View Details */}
          <Button variant="outline" size="sm" onClick={() => onView?.(job.id)}>
            <Eye className="mr-1 h-4 w-4" />
            Detaylar
          </Button>

          {/* Edit */}
          {canEditJob(job) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(job.id)}
            >
              <Edit className="mr-1 h-4 w-4" />
              Düzenle
            </Button>
          )}

          {/* Close */}
          {canCloseJob(job) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClose?.(job.id)}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Kapat
            </Button>
          )}

          {/* Reopen */}
          {canReopenJob(job) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReopen?.(job.id)}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Yeniden Aç
            </Button>
          )}

          {/* Delete */}
          {canDeleteJob(job) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(job.id)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Sil
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
