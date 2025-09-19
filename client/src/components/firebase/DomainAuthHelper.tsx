import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * This component shows alerts when the current domain is not authorized in Firebase
 * It's designed to help developers and users troubleshoot Firebase authentication issues
 * 
 * NOTE: This component is currently disabled as per user request
 */
export function DomainAuthHelper() {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Firebase is disabled - skip auth redirect handler completely
    console.log('🚫 DomainAuthHelper: Firebase disabled, skipping auth redirect handler');
  }, []);
  
  return null; // This component doesn't render anything
}