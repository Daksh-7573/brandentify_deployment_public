import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

/**
 * Authentication Redirect Guard
 * Prevents authenticated users from accessing the auth page
 * and ensures proper redirection to the main app
 */
export function AuthRedirectGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  
  useEffect(() => {
    console.log("🛡️ AuthRedirectGuard check:", { 
      location, 
      isAuthenticated, 
      isLoading, 
      hasUser: !!user 
    });
    
    // Only redirect if truly authenticated and on auth pages (but NOT on debug pages)
    const shouldRedirect = isAuthenticated && !isLoading && user && 
      (location === '/' || location === '/auth' || location === '/login') &&
      !location.includes('/auth-debug'); // Don't redirect from debug pages
      
    if (shouldRedirect) {
      console.log("🚀 AuthRedirectGuard: Redirecting authenticated user from", location, "to Industry Pulse");
      // Use a longer delay to ensure auth state is fully settled
      setTimeout(() => {
        window.location.replace('/industry-pulse');
      }, 1000);
    }
  }, [isAuthenticated, isLoading, location, user]);
  
  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return <>{children}</>;
}