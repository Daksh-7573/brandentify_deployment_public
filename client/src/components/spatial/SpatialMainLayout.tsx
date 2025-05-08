import React, { ReactNode } from 'react';
import { SpatialPortalLayout } from './SpatialPortalLayout';
import { useLocation } from 'wouter';

/**
 * This component serves as the main layout wrapper for the application.
 * It decides whether to render the page with the spatial layout or
 * let it render normally based on a feature flag or user preference.
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
  enableSpatialUI = true,
}) => {
  const [location] = useLocation();
  
  // Routes that should NEVER have the spatial layout
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
  
  // Check if the current route should be excluded from spatial layout
  const shouldExclude = excludedRoutes.some(route => location.startsWith(route));
  
  // Force spatial UI to be enabled for all routes except specified exclusions
  const forceSpatialUI = true;
  
  // Only exclude for routes that should never have spatial UI
  if (!forceSpatialUI || shouldExclude) {
    return <>{children}</>;
  }
  
  // Get the page title based on the current route, or use a default
  const title = pageTitles[location] || 'Brandentifier';
  
  // Otherwise, wrap the content in the spatial layout
  return (
    <SpatialPortalLayout title={title}>
      {children}
    </SpatialPortalLayout>
  );
};

export default SpatialMainLayout;