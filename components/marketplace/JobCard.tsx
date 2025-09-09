'use client';

import React from 'react';
import { Job } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, MapPin, User, Star } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
  onSaveJob?: (job: Job) => void;
  className?: string;
}

export function JobCard({
  job,
  onViewDetails,
  onSaveJob,
  className,
}: JobCardProps) {
  const formatBudget = (budget: Job['budget']) => {
    if (budget.type === 'fixed') {
      return `₺${budget.amount.toLocaleString('tr-TR')}`;
    } else {
      const maxAmount = budget.maxAmount ? `-₺${budget.maxAmount.toLocaleString('tr-TR')}` : '';
      return `₺${budget.amount.toLocaleString('tr-TR')}${maxAmount}/saat`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} hafta önce`;
  };

  return (
    <Card
      className={`cursor-pointer p-6 transition-shadow hover:shadow-lg ${className}`}
    >
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 transition-colors hover:text-blue-600">
              {job.title}
            </h3>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {formatTimeAgo(job.createdAt)}
              </span>
              <span className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {job.isRemote ? 'Uzaktan' : job.location}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatBudget(job.budget)}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {job.budget.type}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-3 text-gray-700">{job.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              +{job.skills.length - 4} daha
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              {job.proposalsCount} teklif
            </span>
            <span className="flex items-center">
              <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
              {job.employer.rating.toFixed(1)}
            </span>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 capitalize">
              {job.experienceLevel}
            </span>
          </div>

          <div className="flex space-x-2">
            {onSaveJob && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveJob(job);
                }}
              >
                Kaydet
              </Button>
            )}
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(job);
              }}
            >
              Detayları Gör
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
