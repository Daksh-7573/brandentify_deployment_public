import { Skeleton } from "../skeleton-components";

export function SearchPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Filters Sidebar - 3 columns */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-3 w-full" />
              ))}
            </div>
          ))}
        </div>

        {/* Results Grid - 9 columns */}
        <div className="col-span-12 md:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <div className="space-y-2 text-center">
                  <Skeleton className="h-4 w-24 mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
