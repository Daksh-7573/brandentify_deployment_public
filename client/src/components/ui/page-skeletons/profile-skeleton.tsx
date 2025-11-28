import { Skeleton } from "../skeleton-components";

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Cover Photo */}
      <Skeleton className="w-full h-48 rounded-none" />

      {/* Profile Header */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Info Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-end gap-6">
            <Skeleton className="h-24 w-24 rounded-full -mt-16" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>

          {/* Bio & Stats */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-6 w-12 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="space-y-4">
          {/* Tab Navigation Skeleton */}
          <div className="flex gap-4 border-b border-white/10 pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>

          {/* Skills Section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-full" />
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-4 mt-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
