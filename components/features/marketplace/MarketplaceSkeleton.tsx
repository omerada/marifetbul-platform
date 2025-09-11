import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <div className="container mx-auto space-y-8 px-4 py-8">
        {/* Hero Header Skeleton */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-12 w-96 bg-white/20" />
              <Skeleton className="h-6 w-64 bg-white/15" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row">
              <Skeleton className="h-14 flex-1 bg-white/20" />
              <Skeleton className="h-14 w-40 bg-blue-500/30" />
            </div>

            {/* Mode Toggle Skeleton */}
            <div className="flex justify-center">
              <div className="flex rounded-xl bg-white/10 p-1">
                <Skeleton className="h-10 w-32 bg-white/25" />
                <Skeleton className="h-10 w-32 bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar Skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg"
            >
              <CardContent className="p-6 text-center">
                <Skeleton className="mx-auto mb-2 h-8 w-8 rounded-full bg-blue-100" />
                <Skeleton className="mx-auto mb-1 h-6 w-12 bg-blue-100" />
                <Skeleton className="mx-auto h-4 w-16 bg-gray-100" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card className="border-0 bg-gradient-to-br from-white to-blue-50/20 shadow-xl">
          <CardHeader className="border-b border-blue-100/60">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32 bg-blue-100" />
              <Skeleton className="h-8 w-24 bg-blue-100" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-11 w-full rounded-lg bg-blue-50"
                />
              ))}
            </div>

            {/* Quick Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8 w-20 rounded-full bg-blue-100"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-gray-200" />
            <Skeleton className="h-5 w-48 bg-gray-100" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 bg-blue-100" />
            <div className="flex rounded-lg border border-blue-200 bg-white">
              <Skeleton className="h-10 w-10 bg-blue-50" />
              <Skeleton className="h-10 w-10 bg-blue-50" />
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card
              key={i}
              className="group overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/20 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/30"
            >
              {/* Image Skeleton */}
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                <Skeleton className="h-full w-full bg-blue-100" />
              </div>

              <CardHeader className="space-y-3 p-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-5/6 bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full bg-blue-100" />
                    <Skeleton className="h-4 w-24 bg-gray-100" />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Skeleton
                      key={starIndex}
                      className="h-4 w-4 bg-yellow-100"
                    />
                  ))}
                  <Skeleton className="ml-2 h-4 w-12 bg-gray-100" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-6 pt-0">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-100" />
                  <Skeleton className="h-4 w-4/5 bg-gray-100" />
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-blue-100" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full bg-gray-100" />
                    <Skeleton className="h-3 w-3/4 bg-gray-100" />
                    <Skeleton className="h-3 w-5/6 bg-gray-100" />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-6 w-16 rounded-full bg-blue-100" />
                  <Skeleton className="h-6 w-20 rounded-full bg-blue-100" />
                  <Skeleton className="h-6 w-14 rounded-full bg-blue-100" />
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between border-t border-blue-100/50 pt-4">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20 bg-green-100" />
                    <Skeleton className="h-3 w-16 bg-gray-100" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg bg-blue-100" />
                    <Skeleton className="h-8 w-24 rounded-lg bg-blue-500/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Skeleton */}
        <div className="flex justify-center pt-8">
          <Skeleton className="h-12 w-48 rounded-xl bg-blue-100" />
        </div>
      </div>
    </div>
  );
}
