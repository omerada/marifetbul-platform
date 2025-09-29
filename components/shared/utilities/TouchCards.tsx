/**
 * Touch-optimized card components using the unified Card system
 * These components are deprecated and will be replaced by direct Card usage
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

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
  onSelect?: (jobId: string) => void;
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
  onSelect?: (serviceId: string) => void;
  onLike?: (serviceId: string) => void;
  onBookmark?: (serviceId: string) => void;
}

// Export touch-optimized card variants using Card
export function TouchJobCard({
  job,
  onSelect,
  onLike,
  onBookmark,
  onShare,
}: TouchJobCardProps) {
  return (
    <Card
      className="cursor-pointer space-y-3 p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg"
      onClick={() => onSelect?.(job.id)}
    >
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
              onClick={(e) => {
                e.stopPropagation();
                onLike(job.id);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              ❤️
            </button>
          )}
          {onBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(job.id);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              🔖
            </button>
          )}
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(job.id);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              📤
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function TouchServiceCard({
  service,
  onSelect,
  onLike,
  onBookmark,
}: TouchServiceCardProps) {
  return (
    <Card
      className="cursor-pointer space-y-3 p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg"
      onClick={() => onSelect?.(service.id)}
    >
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
              onClick={(e) => {
                e.stopPropagation();
                onLike(service.id);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              ❤️
            </button>
          )}
          {onBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(service.id);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              🔖
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
