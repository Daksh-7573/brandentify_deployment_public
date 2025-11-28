import { Skeleton } from "../skeleton-components";

export function CreatePulsePageSkeleton() {
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
        {/* Form Section - 6 columns */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <div className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-xl p-8">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-11 flex-1 rounded-lg" />
            <Skeleton className="h-11 flex-1 rounded-lg" />
          </div>
        </div>

        {/* Preview Section - 6 columns */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
            <Skeleton className="h-5 w-32" />

            {/* Preview Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
              {/* User Header */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Preview Content */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Preview Media */}
              <Skeleton className="h-48 w-full rounded-lg" />

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
