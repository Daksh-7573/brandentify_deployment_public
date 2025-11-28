import { Skeleton } from "../skeleton-components";

export function PricingPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Title */}
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Toggle */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 space-y-6">
              {/* Card Header */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>

              {/* Description */}
              <Skeleton className="h-3 w-full" />

              {/* CTA Button */}
              <Skeleton className="h-10 w-full rounded-lg" />

              {/* Features */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
