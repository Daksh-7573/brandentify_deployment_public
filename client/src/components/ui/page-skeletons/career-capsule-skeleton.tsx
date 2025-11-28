import { Skeleton } from "../skeleton-components";

export function CareerCapsulePageSkeleton() {
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
        {/* Header Section */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Timeline with Cards */}
        <div className="space-y-6">
          {/* Timeline Start */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />

            {/* Timeline Items */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-6 mb-6 relative">
                {/* Timeline Dot */}
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0 mt-2" />

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>

                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="text-center space-y-1">
                        <Skeleton className="h-5 w-8 mx-auto" />
                        <Skeleton className="h-2 w-12 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
