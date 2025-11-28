import { Skeleton } from "../skeleton-components";

export function BrandScorePageSkeleton() {
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
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Score Display */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12">
          <div className="flex flex-col items-center space-y-6">
            {/* Circular Score */}
            <Skeleton className="h-40 w-40 rounded-full" />
            
            {/* Score Label */}
            <div className="text-center space-y-2">
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-3 w-40 mx-auto" />
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
