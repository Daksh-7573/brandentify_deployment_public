import { Skeleton } from "../skeleton-components";

export function ChatPageSkeleton() {
  return (
    <div className="min-h-screen flex">
      {/* Chat List Sidebar */}
      <div className="w-72 border-r border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 p-4 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 space-y-2 p-4 overflow-y-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-32 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`space-y-2 ${i % 2 === 0 ? 'mr-12' : 'ml-12'}`}>
                <Skeleton className="h-3 w-32 rounded-lg" />
                <Skeleton className="h-3 w-40 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-4">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
