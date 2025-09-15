/**
 * Updated TouchCards using UnifiedCard
 * Eliminates duplicate card patterns by using UnifiedCard system
 */

'use client';

import React from 'react';
import { UnifiedCard } from '@/components/shared/UnifiedCard';

// Legacy interface support
interface TouchJobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    deadline: string;
    skills: string[];
    employer: {
      name: string;
      avatar?: string;
      rating: number;
      location: string;
    };
    postedAt: string;
    proposalCount: number;
    isFeatured: boolean;
  };
  onLike?: (jobId: string) => void;
  onBookmark?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
}

interface TouchServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: {
      amount: number;
      currency: string;
    };
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    tags: string[];
    freelancer: {
      name: string;
      level: string;
    };
    images: string[];
    category: string;
  };
  onLike?: (serviceId: string) => void;
  onBookmark?: (serviceId: string) => void;
}

// Export touch-optimized card variants using UnifiedCard
export function TouchJobCard({
  job,
  onLike,
  onBookmark,
  onShare,
}: TouchJobCardProps) {
  return (
    <UnifiedCard className="space-y-3 p-4" variant="elevated" hover clickable>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            {job.title}
          </h3>
          <p className="mb-2 text-sm text-gray-600">
            {job.employer.name} • {job.employer.location}
          </p>
          <p className="line-clamp-2 text-sm text-gray-700">
            {job.description}
          </p>
        </div>
        {job.isFeatured && (
          <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
            Öne Çıkan
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold text-green-600">
            ₺{job.budget.min}-{job.budget.max} {job.budget.currency}
          </span>
        </div>
        <div className="flex space-x-2">
          {onLike && (
            <button
              onClick={() => onLike(job.id)}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              ❤️
            </button>
          )}
          {onBookmark && (
            <button
              onClick={() => onBookmark(job.id)}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              🔖
            </button>
          )}
          {onShare && (
            <button
              onClick={() => onShare(job.id)}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              📤
            </button>
          )}
        </div>
      </div>
    </UnifiedCard>
  );
}

export function TouchServiceCard({
  service,
  onLike,
  onBookmark,
}: TouchServiceCardProps) {
  return (
    <UnifiedCard className="space-y-3 p-4" variant="elevated" hover clickable>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            {service.title}
          </h3>
          <p className="mb-2 text-sm text-gray-600">
            {service.freelancer.name} • {service.freelancer.level}
          </p>
          <p className="line-clamp-2 text-sm text-gray-700">
            {service.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold text-green-600">
            ₺{service.price.amount} {service.price.currency}
          </span>
        </div>
        <div className="flex space-x-2">
          {onLike && (
            <button
              onClick={() => onLike(service.id)}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              ❤️
            </button>
          )}
          {onBookmark && (
            <button
              onClick={() => onBookmark(service.id)}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              🔖
            </button>
          )}
        </div>
      </div>
    </UnifiedCard>
  );
}
