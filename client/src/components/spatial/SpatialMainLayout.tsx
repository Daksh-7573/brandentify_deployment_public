import React, { ReactNode } from 'react';
import { SpatialPortalLayout } from './SpatialPortalLayout';
import { useLocation } from 'wouter';

/**
 * This component serves as the main layout wrapper for the application.
 * It decides whether to render the page with the spatial layout or
 * let it render normally based on a feature flag or user preference.
 * 
 * When Spatial UI is disabled, it still applies Vision Pro-inspired effects to regular layouts.
 */
interface SpatialMainLayoutProps {
  children: ReactNode;
  enableSpatialUI?: boolean;
}

// Define page titles based on route
const pageTitles: Record<string, string> = {
  '/': 'Brandentifier',
  '/dashboard': 'Dashboard',
  '/industry-pulse': 'Industry Pulse',
  '/career-capsule': 'Career Capsule',
  '/brand-quests': 'Brand Quests',
  '/career-quests': 'Brand Quests',
  '/portfolio-builder': 'Portfolio Builder',
  '/profile': 'Your Profile',
  '/smart-connect': 'Smart Connect',
  '/resume': 'Resume',
  '/resume-editor': 'Resume Editor',
  '/resume-cv': 'CV Builder',
  '/services': 'Services',
  '/personal-details': 'Personal Details',
  '/edit-profile': 'Edit Profile',
  '/unified-profile': 'Profile',
  '/onboarding': 'Onboarding',
  '/search': 'Search Results',
  '/nowboard': 'Nowboard',
  '/news-sources': 'News Sources',
  '/musk-match': 'Musk Match',
  '/spatial-test': 'Spatial UI Test',
  '/spatial-industry-pulse': 'Industry Pulse',
  '/spatial-career-capsule': 'Career Capsule',
  '/spatial-brand-quests': 'Brand Quests',
};

export const SpatialMainLayout: React.FC<SpatialMainLayoutProps> = ({ 
  children,
  enableSpatialUI = false, // Default to non-spatial layout with Vision Pro effects
}) => {
  const [location] = useLocation();
  
  // Routes that should NEVER have any spatial effects
  // Landing page, auth, static pages, etc.
  const nonSpatialRoutes = [
    '/',
    '/auth',
    '/verify-email',
    '/shared-card',
    '/login',
    '/signup',
    '/profile/card',
  ];
  
  // Routes that already have their own spatial UI implementation
  // These actually use the SpatialPortalLayout directly
  const spatialSpecificRoutes = [
    '/spatial-test', 
    '/spatial-industry-pulse', 
    '/spatial-career-capsule',
    '/spatial-brand-quests',
  ];
  
  // Combined list of all routes to exclude
  const excludedRoutes = [...nonSpatialRoutes, ...spatialSpecificRoutes];
  
  // Check if the current route should be excluded from any spatial effects
  const shouldExclude = excludedRoutes.some(route => location.startsWith(route));
  
  // Check if we're on a dedicated spatial route which implements its own UI
  const isDedicatedSpatialRoute = spatialSpecificRoutes.some(route => location.startsWith(route));
  
  // If we're on a dedicated spatial route, or enableSpatialUI is true and we're not on an excluded route
  if ((enableSpatialUI && !shouldExclude) || isDedicatedSpatialRoute) {
    // Get the page title based on the current route, or use a default
    const title = pageTitles[location] || 'Brandentifier';
    
    // Wrap the content in the full spatial layout
    return (
      <SpatialPortalLayout title={title}>
        {children}
      </SpatialPortalLayout>
    );
  }
  
  // If we're on a completely excluded route (landing, auth, etc.)
  if (shouldExclude) {
    return <>{children}</>;
  }
  
  // For regular routes with Vision Pro styling but not full spatial UI
  return (
    <div className="vision-enhanced-layout relative">
      {/* Apply Vision Pro-inspired styles to standard layout */}
      <div className="vision-bg min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default SpatialMainLayout;