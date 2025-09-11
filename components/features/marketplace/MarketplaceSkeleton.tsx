import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function MarketplaceSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Results Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />

              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-18" />
              </div>

              <div className="flex items-center justify-between pt-3">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}
