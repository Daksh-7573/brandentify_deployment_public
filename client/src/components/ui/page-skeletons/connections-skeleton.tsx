import { Skeleton } from "../skeleton-components";

export function ConnectionsPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 pb-4 border-b border-white/10 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Connections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-6 w-6" />
              </div>

              {/* Info */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>

              {/* Mutual Connections */}
              <div className="flex items-center gap-2 py-2 border-y border-white/10">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
