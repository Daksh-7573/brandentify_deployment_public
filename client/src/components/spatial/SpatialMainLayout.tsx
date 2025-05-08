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
  '/spatial-test': 'Spatial UI Test',
  '/spatial-industry-pulse': 'Industry Pulse',
  '/spatial-career-capsule': 'Career Capsule',
};

export const SpatialMainLayout: React.FC<SpatialMainLayoutProps> = ({ 
  children,
  enableSpatialUI = true,
}) => {
  const [location] = useLocation();
  
  // These routes are already using the spatial layout internally
  // or should not have the portal layout
  const excludedRoutes = [
    '/spatial-test', 
    '/spatial-industry-pulse', 
    '/spatial-career-capsule',
    '/auth',
    '/verify-email',
    '/shared-card',
  ];
  
  // Check if the current route should be excluded from spatial layout
  const shouldExclude = excludedRoutes.some(route => location.startsWith(route));
  
  // If spatial UI is disabled or route is excluded, render children directly
  if (!enableSpatialUI || shouldExclude) {
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