/**/**

 * Updated TouchCards using Card component * Updated TouchCards using Card component

 * Eliminates duplicate card patterns by using ui/Card system * Eliminates duplicate card patterns by using ui/Card system

 */ */



'use client';'use client';



import React from 'react';import React from 'react';

import { Card } from '@/components/ui/Card';import { Card } from '@/components/ui/Card';



// Legacy interface support// Legacy interface support

interface TouchJobCardProps {interface TouchJobCardProps {

  job: {  job: {

    id: string;    id: string;

    title: string;     title: string;

    description: string;    description: string;

    budget: {    budget: {

      min: number;      min: number;

      max: number;      max: number;

      currency: string;      currency: string;

    };    };

    deadline: string;    deadline: string;

    skills: string[];    skills: string[];

    employer: {    employer: {

      name: string;      name: string;

      avatar?: string;      avatar?: string;

      rating: number;      rating: number;

      location: string;      location: string;

    };    };

    postedAt: string;    postedAt: string;

    proposalCount: number;    proposalCount: number;

    isFeatured: boolean;    isFeatured: boolean;

  };  };

  onSelect?: (jobId: string) => void;  onLike?: (jobId: string) => void;

  onLike?: (jobId: string) => void;  onBookmark?: (jobId: string) => void;

  onBookmark?: (jobId: string) => void;  onShare?: (jobId: string) => void;

  onShare?: (jobId: string) => void;}

}

interface TouchServiceCardProps {

interface TouchServiceCardProps {  service: {

  service: {    id: string;

    id: string;    title: string;

    title: string;    description: string;

    description: string;    price: {

    price: {      amount: number;

      amount: number;      currency: string;

      currency: string;    };

    };    rating: number;

    rating: number;    reviewCount: number;

    reviewCount: number;    deliveryTime: string;

    deliveryTime: string;    tags: string[];

    tags: string[];    freelancer: {

    freelancer: {      name: string;

      name: string;      level: string;

      level: string;    };

    };    images: string[];

    images: string[];    category: string;

    category: string;  };

  };  onLike?: (serviceId: string) => void;

  onSelect?: (serviceId: string) => void;  onBookmark?: (serviceId: string) => void;

  onLike?: (serviceId: string) => void;}

  onBookmark?: (serviceId: string) => void;

}// Export touch-optimized card variants using UnifiedCard

export function TouchJobCard({

// Export touch-optimized card variants using Card  job,

export function TouchJobCard({  onLike,

  job,  onBookmark,

  onSelect,  onShare,

  onLike,}: TouchJobCardProps) {

  onBookmark,  return (

  onShare,    <UnifiedCard className="space-y-3 p-4" variant="elevated" hover clickable>

}: TouchJobCardProps) {      <div className="flex items-start justify-between">

  return (        <div className="flex-1">

    <Card           <h3 className="mb-1 text-lg font-semibold text-gray-900">

      className="space-y-3 p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"            {job.title}

      onClick={() => onSelect?.(job.id)}          </h3>

    >          <p className="mb-2 text-sm text-gray-600">

      <div className="flex items-start justify-between">            {job.employer.name} • {job.employer.location}

        <div className="flex-1">          </p>

          <h3 className="mb-1 text-lg font-semibold text-gray-900">          <p className="line-clamp-2 text-sm text-gray-700">

            {job.title}            {job.description}

          </h3>          </p>

          <p className="mb-2 text-sm text-gray-600">        </div>

            {job.employer.name} • {job.employer.location}        {job.isFeatured && (

          </p>          <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">

          <p className="line-clamp-2 text-sm text-gray-700">            Öne Çıkan

            {job.description}          </span>

          </p>        )}

        </div>      </div>

        {job.isFeatured && (

          <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">      <div className="flex items-center justify-between">

            Öne Çıkan        <div className="text-sm">

          </span>          <span className="font-semibold text-green-600">

        )}            ₺{job.budget.min}-{job.budget.max} {job.budget.currency}

      </div>          </span>

        </div>

      <div className="flex items-center justify-between">        <div className="flex space-x-2">

        <div className="text-sm">          {onLike && (

          <span className="font-semibold text-green-600">            <button

            ₺{job.budget.min}-{job.budget.max} {job.budget.currency}              onClick={() => onLike(job.id)}

          </span>              className="rounded-full p-2 hover:bg-gray-100"

        </div>            >

        <div className="flex space-x-2">              ❤️

          {onLike && (            </button>

            <button          )}

              onClick={(e) => {          {onBookmark && (

                e.stopPropagation();            <button

                onLike(job.id);              onClick={() => onBookmark(job.id)}

              }}              className="rounded-full p-2 hover:bg-gray-100"

              className="rounded-full p-2 hover:bg-gray-100"            >

            >              🔖

              ❤️            </button>

            </button>          )}

          )}          {onShare && (

          {onBookmark && (            <button

            <button              onClick={() => onShare(job.id)}

              onClick={(e) => {              className="rounded-full p-2 hover:bg-gray-100"

                e.stopPropagation();            >

                onBookmark(job.id);              📤

              }}            </button>

              className="rounded-full p-2 hover:bg-gray-100"          )}

            >        </div>

              🔖      </div>

            </button>    </UnifiedCard>

          )}  );

          {onShare && (}

            <button

              onClick={(e) => {export function TouchServiceCard({

                e.stopPropagation();  service,

                onShare(job.id);  onLike,

              }}  onBookmark,

              className="rounded-full p-2 hover:bg-gray-100"}: TouchServiceCardProps) {

            >  return (

              📤    <UnifiedCard className="space-y-3 p-4" variant="elevated" hover clickable>

            </button>      <div className="flex items-start justify-between">

          )}        <div className="flex-1">

        </div>          <h3 className="mb-1 text-lg font-semibold text-gray-900">

      </div>            {service.title}

    </Card>          </h3>

  );          <p className="mb-2 text-sm text-gray-600">

}            {service.freelancer.name} • {service.freelancer.level}

          </p>

export function TouchServiceCard({          <p className="line-clamp-2 text-sm text-gray-700">

  service,            {service.description}

  onSelect,          </p>

  onLike,        </div>

  onBookmark,      </div>

}: TouchServiceCardProps) {

  return (      <div className="flex items-center justify-between">

    <Card         <div className="text-sm">

      className="space-y-3 p-4 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"          <span className="font-semibold text-green-600">

      onClick={() => onSelect?.(service.id)}            ₺{service.price.amount} {service.price.currency}

    >          </span>

      <div className="flex items-start justify-between">        </div>

        <div className="flex-1">        <div className="flex space-x-2">

          <h3 className="mb-1 text-lg font-semibold text-gray-900">          {onLike && (

            {service.title}            <button

          </h3>              onClick={() => onLike(service.id)}

          <p className="mb-2 text-sm text-gray-600">              className="rounded-full p-2 hover:bg-gray-100"

            {service.freelancer.name} • {service.freelancer.level}            >

          </p>              ❤️

          <p className="line-clamp-2 text-sm text-gray-700">            </button>

            {service.description}          )}

          </p>          {onBookmark && (

        </div>            <button

      </div>              onClick={() => onBookmark(service.id)}

              className="rounded-full p-2 hover:bg-gray-100"

      <div className="flex items-center justify-between">            >

        <div className="text-sm">              🔖

          <span className="font-semibold text-green-600">            </button>

            ₺{service.price.amount} {service.price.currency}          )}

          </span>        </div>

        </div>      </div>

        <div className="flex space-x-2">    </UnifiedCard>

          {onLike && (  );

            <button}

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