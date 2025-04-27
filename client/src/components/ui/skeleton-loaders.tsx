import { Skeleton } from "@/components/ui/skeleton";

/* 
  Common skeleton loader components that can be used throughout the app
  for consistent loading states.
*/

// Simple text block with multiple lines
export function TextBlockSkeleton({ lines = 3, className = "" }: { lines?: number, className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 w-${i === lines - 1 && lines > 1 ? '2/3' : 'full'}`} 
        />
      ))}
    </div>
  );
}

// Skeleton for a profile card or user info section
export function ProfileSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-5 w-28 mx-auto" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
    </div>
  );
}

// Skeleton for a typical card with header and content
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="pt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for a list item with avatar and content
export function ListItemSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-4 py-3 ${className}`}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

// Skeleton for a table row
export function TableRowSkeleton({ columns = 4, className = "" }: { columns?: number, className?: string }) {
  return (
    <div className={`flex items-center space-x-4 py-4 ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === 0 ? 'w-1/6' : i === columns - 1 ? 'w-1/12' : 'w-1/4'}`} 
        />
      ))}
    </div>
  );
}

// Skeleton for a service card
export function ServiceCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-2 flex justify-between items-center">
          <Skeleton className="h-5 w-20" /> 
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for an experience/education item
export function ExperienceItemSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-3 py-3 ${className}`}>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// Skeleton for a project card
export function ProjectCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-md" /> {/* Image placeholder */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex space-x-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

// Section skeleton with title and multiple cards
export function SectionSkeleton({ 
  title = true, 
  itemCount = 3, 
  itemHeight = "h-48", 
  className = "" 
}: { 
  title?: boolean, 
  itemCount?: number, 
  itemHeight?: string, 
  className?: string 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <Skeleton className="h-7 w-1/4 mb-6" />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <Skeleton key={i} className={`${itemHeight} w-full rounded-md`} />
        ))}
      </div>
    </div>
  );
}

// Full profile page skeleton
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header with profile info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-60" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-5/6 max-w-xl" />
            <Skeleton className="h-4 w-2/3 max-w-xl" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Sections */}
      <div className="space-y-12">
        {/* Skills section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
        
        {/* Experience section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="divide-y">
            {Array.from({ length: 2 }).map((_, i) => (
              <ExperienceItemSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* Education section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="divide-y">
            {Array.from({ length: 2 }).map((_, i) => (
              <ExperienceItemSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* Projects section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-28" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* Services section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-28" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}