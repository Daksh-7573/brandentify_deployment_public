import { Skeleton } from "../skeleton-components";

export function MessagingPageSkeleton() {
  return (
    <div className="min-h-screen flex">
      {/* Contacts List Sidebar */}
      <div className="w-80 border-r border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
        {/* Search Header */}
        <div className="border-b border-white/10 p-4 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto space-y-2 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Panel */}
      <div className="flex-1 flex flex-col bg-black/40">
        {/* Conversation Header */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Message from other user */}
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`other-${i}`} className="flex justify-start">
              <div className="max-w-xs space-y-2">
                <Skeleton className="h-3 w-48 rounded-lg" />
                <Skeleton className="h-3 w-40 rounded-lg" />
              </div>
            </div>
          ))}

          {/* Message from current user */}
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`current-${i}`} className="flex justify-end">
              <div className="max-w-xs space-y-2">
                <Skeleton className="h-3 w-44 rounded-lg" />
                <Skeleton className="h-3 w-36 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <div className="flex gap-2">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
