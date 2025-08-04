import { cn } from "@/lib/utils";

// Base Skeleton Component - matching the HTML loading screen style
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-white/10 border border-white/5 rounded-md", className)}
      style={{ animation: 'pulse 2s ease-in-out infinite' }}
      {...props}
    />
  );
}

// Pulse Card Skeleton - matching HTML loading screen style
export function PulseCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
      {/* User Info */}
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Media placeholder */}
      <Skeleton className="h-48 w-full rounded-lg" />
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex space-x-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

// User Card Skeleton
export function UserCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

// Quest Card Skeleton
export function QuestCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-5 w-20" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  );
}

// Nowboard Item Skeleton
export function NowboardItemSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Skills List Skeleton
export function SkillsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Education Item Skeleton
export function EducationItemSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      
      <div className="space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

// Experience Item Skeleton
export function ExperienceItemSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      
      <div className="space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      
      <div className="flex space-x-2">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
    </div>
  );
}

// Feed Skeleton (multiple pulse cards) - Full screen layout matching HTML loader
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(31, 41, 55, 0.9) 100%)'
      }}
    >
      {/* Header skeleton */}
      <div className="h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6">
        <Skeleton className="w-32 h-8" />
        <div className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {Array.from({ length: count }).map((_, i) => (
            <PulseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Grid Skeleton (for search results, profiles, etc.)
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Header Skeleton
export function HeaderSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Page Layout Skeleton - Full screen matching HTML loader
export function PageLayoutSkeleton() {
  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(31, 41, 55, 0.9) 100%)'
      }}
    >
      {/* Header skeleton */}
      <div className="h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6">
        <Skeleton className="w-32 h-8" />
        <div className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="w-24 h-4 mb-1" />
                <Skeleton className="w-16 h-3" />
              </div>
            </div>
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-3/4 h-4 mb-2" />
            <Skeleton className="w-1/2 h-4" />
          </div>
          
          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="w-24 h-4 mb-1" />
                <Skeleton className="w-16 h-3" />
              </div>
            </div>
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-4/5 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}