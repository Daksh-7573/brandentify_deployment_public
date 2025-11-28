import { Skeleton } from "../skeleton-components";

export function ResumeParserPageSkeleton() {
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
      <div className="container mx-auto px-4 py-8 grid grid-cols-12 gap-8">
        {/* Upload Form - 5 columns */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* Upload Area */}
          <div className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-xl p-12 space-y-4">
            <Skeleton className="h-12 w-12 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-40 mx-auto" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        {/* Results Panel - 7 columns */}
        <div className="col-span-12 md:col-span-7 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 space-y-6">
          <Skeleton className="h-6 w-40" />

          {/* Result Sections */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
