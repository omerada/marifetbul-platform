/**
 * ModerationLoadingState Component
 *
 * Skeleton UI for moderation dashboard while loading
 */

export function ModerationLoadingState() {
  return (
    <div className="space-y-6 p-6">
      <div className="animate-pulse">
        <div className="mb-6 h-8 w-1/4 rounded bg-gray-200"></div>
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-96 rounded-lg bg-gray-200 lg:col-span-2"></div>
          <div className="h-96 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
