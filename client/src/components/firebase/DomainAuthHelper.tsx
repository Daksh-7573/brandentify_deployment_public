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
    // Import and initialize the redirect handler
    const initHandler = async () => {
      const { initializeRedirectHandler } = await import('@/utils/auth-redirect-handler');
      initializeRedirectHandler();
    };
    
    initHandler();
  }, []);
  
  return null; // This component doesn't render anything
}