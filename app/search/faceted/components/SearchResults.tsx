'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Service {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  location?: string;
  rating?: number;
  price?: number;
  priceUnit?: string;
}

interface SearchResultsProps {
  services: Service[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
}

export function SearchResults({
  services,
  pagination,
  onPageChange,
}: SearchResultsProps) {
  if (!services || services.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No services found matching your criteria
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Try adjusting your filters or search query
        </p>
      </Card>
    );
  }

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;
  const currentPage = pagination?.page || 1;

  return (
    <div className="space-y-4">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {pagination
            ? `Showing ${(currentPage - 1) * pagination.pageSize + 1}-${Math.min(currentPage * pagination.pageSize, pagination.total)} of ${pagination.total} results`
            : `${services.length} results`}
        </p>
      </div>

      {/* Service Cards */}
      <div className="space-y-4">
        {services.map((service, index) => (
          <Card
            key={service.id || index}
            className="transition-shadow hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {service.imageUrl && (
                  <div className="bg-muted relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={service.imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {service.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    {service.category && (
                      <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs">
                        {service.category}
                      </span>
                    )}
                    {service.location && (
                      <span className="text-muted-foreground text-xs">
                        📍 {service.location}
                      </span>
                    )}
                    {service.rating && (
                      <span className="text-muted-foreground text-xs">
                        ⭐ {service.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                {service.price && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-2xl font-bold">${service.price}</p>
                    {service.priceUnit && (
                      <p className="text-muted-foreground text-xs">
                        per {service.priceUnit}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </UnifiedButton>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }

              return (
                <UnifiedButton
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </UnifiedButton>
              );
            })}
          </div>

          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </UnifiedButton>
        </div>
      )}
    </div>
  );
}
