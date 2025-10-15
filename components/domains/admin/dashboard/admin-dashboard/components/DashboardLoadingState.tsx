/**
 * DashboardLoadingState Component
 *
 * Skeleton UI for dashboard while loading
 */

export function DashboardLoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-3">
            <div className="h-8 w-64 rounded-lg bg-gray-200"></div>
            <div className="h-4 w-96 rounded bg-gray-200"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-32 rounded-lg bg-gray-200"></div>
            <div className="h-10 w-24 rounded-lg bg-gray-200"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-lg bg-white shadow" />
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-lg bg-white shadow lg:col-span-2" />
          <div className="h-80 rounded-lg bg-white shadow" />
        </div>
      </div>
    </div>
  );
}
