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
    
    // If user is authenticated and on auth page, redirect immediately
    if (isAuthenticated && !isLoading && location === '/') {
      console.log("🚀 AuthRedirectGuard: Redirecting authenticated user to Industry Pulse");
      window.location.replace('/industry-pulse');
    }
    
    // Also handle auth-specific routes
    if (isAuthenticated && !isLoading && (location === '/auth' || location === '/login')) {
      console.log("🚀 AuthRedirectGuard: Redirecting from auth routes to Industry Pulse");
      window.location.replace('/industry-pulse');
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