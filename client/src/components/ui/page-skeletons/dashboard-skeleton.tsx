import { Skeleton } from "../skeleton-components";

export function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Main Feed - 8 columns */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Feed Items */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - 4 columns */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Upcoming Quests */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
