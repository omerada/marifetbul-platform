/**
 * JobCard Component
 * Displays a job listing in card format
 */

'use client';

import { memo } from 'react';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import type { JobResponse } from '@/types/backend-aligned';
import {
  formatBudget,
  getExperienceLevelLabel,
  getJobStatusColor,
  isDeadlineApproaching,
  isDeadlinePassed,
  getDaysUntilDeadline,
} from '@/lib/api/jobs';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface JobCardProps {
  job: JobResponse;
  onClick?: (jobId: string) => void;
  showActions?: boolean;
}

export const JobCard = memo(function JobCard({
  job,
  onClick,
  showActions = false,
}: JobCardProps) {
  const deadlineDays = getDaysUntilDeadline(job);
  const isApproaching = isDeadlineApproaching(job);
  const isPassed = isDeadlinePassed(job);

  const handleClick = () => {
    if (onClick) {
      onClick(job.id);
    }
  };

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-semibold text-gray-900 hover:text-blue-600">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.category.name}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {job.employerName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(job.postedAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`bg-${getJobStatusColor(job.status)}-100 text-${getJobStatusColor(job.status)}-700`}
          >
            {job.status}
          </Badge>
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

        {/* Details */}
        <div className="mb-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm md:grid-cols-4">
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
            <div className="mb-1 text-gray-600">Teklifler</div>
            <div className="font-semibold text-gray-900">
              {job.proposalCount} teklif
            </div>
          </div>
        </div>

        {/* Deadline Warning */}
        {job.deadline && (
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
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
            {isApproaching && !isPassed && (
              <AlertCircle className="ml-auto h-4 w-4" />
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                // Handle action
              }}
            >
              Teklif Ver
            </button>
          </div>
        )}
      </div>
    </Card>
  );
});

JobCard.displayName = 'JobCard';
