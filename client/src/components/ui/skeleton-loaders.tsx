import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for the TimelineStoryteller portfolio template
 */
export function TimelineStorytellerSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="overflow-hidden">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 min-h-screen">
          <div className="max-w-6xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col-reverse md:flex-row md:items-center min-h-[65vh]">
              <div className="w-full md:w-1/2 space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                </div>
                <div className="flex gap-4 pt-4">
                  <Skeleton className="h-12 w-32 rounded-md" />
                  <Skeleton className="h-12 w-32 rounded-md" />
                </div>
              </div>
              <div className="w-full md:w-1/2 flex justify-center md:justify-end md:pl-8 mb-12 md:mb-0">
                <div className="w-64 h-64">
                  <Skeleton className="w-full h-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Skeleton */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-y">
          <div className="max-w-5xl mx-auto">
            <div className="flex overflow-x-auto py-2 px-4 gap-4 no-scrollbar">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-md flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
        
        {/* About Me Section Skeleton */}
        <div className="py-24 px-8 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Career Path Skeleton */}
        <div className="py-24 px-8 bg-gradient-to-b from-indigo-50 to-pink-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="relative">
              <div className="h-full w-3 bg-gray-100 absolute left-6 top-0"></div>
              <div className="space-y-16">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 bg-white rounded-lg shadow-md p-6 border border-indigo-100">
                      <div className="flex justify-between items-start mb-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-28" />
                      </div>
                      <Skeleton className="h-4 w-32 mb-4" />
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Education Skeleton */}
        <div className="py-24 px-8 bg-gradient-to-b from-pink-50 to-indigo-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="relative">
              <div className="h-full w-3 bg-gray-100 absolute left-6 top-0"></div>
              <div className="space-y-16">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 bg-white rounded-lg shadow-md p-6 border border-indigo-100">
                      <div className="flex justify-between items-start mb-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-28" />
                      </div>
                      <Skeleton className="h-4 w-32 mb-4" />
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                      <div className="space-y-4">
                        <Skeleton className="h-20 w-full rounded-md" />
                        <Skeleton className="h-20 w-full rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Projects Skeleton */}
        <div className="py-24 px-8 bg-gradient-to-b from-indigo-50 to-purple-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="grid grid-cols-1 gap-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden border border-purple-100">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-48 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-6" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Skills Skeleton */}
        <div className="py-24 px-8 bg-gradient-to-b from-purple-50 to-white min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Skeleton className="h-6 w-20 mb-2" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100">
                  <div className="h-2 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <Skeleton className="h-10 w-10 rounded-full mr-4" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full rounded-full mb-1" />
                    <Skeleton className="h-3 w-8 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for the Corporate Executive portfolio template
 */
export function CorporateExecutiveSkeleton() {
  return (
    <div className="corporate-executive-template bg-white min-h-screen font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
          <div className="w-40 h-40 rounded-xl">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="space-y-4">
              <Skeleton className="h-8 w-72 mx-auto md:mx-0" />
              <Skeleton className="h-6 w-48 mx-auto md:mx-0" />
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Skeleton className="h-7 w-24 rounded-md" />
                <Skeleton className="h-7 w-32 rounded-md" />
              </div>
              <div className="space-y-2 max-w-xl pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Skeleton */}
        <div className="mb-12 border-b pb-4">
          <div className="flex overflow-x-auto space-x-8 no-scrollbar">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </div>
        
        {/* About Me Section Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
        
        {/* Experience Section Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Education Section Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Skills Section Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Projects Section Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Services Section Skeleton */}
        <div>
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <div className="space-y-2 py-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for the Profile page
 */
export function ProfilePageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      
      {/* Profile Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
              <div className="w-full flex justify-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="pt-4 border-t border-gray-100">
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          {/* About Me Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
          
          {/* Skills Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-2 w-40" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Work Experience Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border-b pb-6">
                  <div className="flex justify-between mb-2">
                    <div>
                      <Skeleton className="h-6 w-48 mb-1" />
                      <Skeleton className="h-5 w-40 mb-2" />
                    </div>
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Projects Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}