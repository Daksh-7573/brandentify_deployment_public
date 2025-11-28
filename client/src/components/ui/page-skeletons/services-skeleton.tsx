import { Skeleton } from "../skeleton-components";

export function ServicesPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Title */}
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 space-y-4 group hover:border-white/20 transition-colors">
              {/* Icon */}
              <Skeleton className="h-12 w-12 rounded-lg" />

              {/* Title */}
              <Skeleton className="h-5 w-32" />

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/5" />
              </div>

              {/* Features */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Skeleton className="h-9 w-full rounded-lg mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
