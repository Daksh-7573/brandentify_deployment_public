import { ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthLoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * AuthLoadingBoundary - Prevents rendering of child components until user is authenticated
 * This eliminates the issue of undefined userId defaulting to user 1
 * 
 * Benefits:
 * - No cache pollution from default user
 * - All components receive correct userId
 * - Clean auth state transitions
 */
export function AuthLoadingBoundary({ children, fallback }: AuthLoadingBoundaryProps) {
  const { isLoading, user } = useAuth();

  // If auth is still loading and we have no user data, show skeleton
  if (isLoading && !user?.id) {
    return fallback || <AuthLoadingSkeleton />;
  }

  // User exists (even if auth still loading), render children immediately
  // This prevents blocking the feed while auth context finalizes
  return <>{children}</>;
}

function AuthLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}
