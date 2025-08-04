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
    const checkForRedirectResult = async () => {
      // Only check if we have a redirect attempt flag
      const hasRedirectAttempt = sessionStorage.getItem('redirect_auth_attempt') === 'true';
      if (!hasRedirectAttempt) {
        return;
      }
      
      console.log("🔍 DomainAuthHelper: Checking for Google redirect result...");
      
      try {
        const { getRedirectResult } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        
        if (!auth) {
          console.log("❌ Firebase auth not available");
          return;
        }
        
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("🎉 SUCCESS: Google redirect result found in DomainAuthHelper:", result.user.email);
          
          // Clear the redirect attempt flags
          sessionStorage.removeItem('redirect_auth_attempt');
          sessionStorage.removeItem('redirect_auth_time');
          
          // Set success flag  
          sessionStorage.setItem('authSuccess', 'true');
          sessionStorage.setItem('user_authenticated', 'true');
          
          // Navigate to dashboard after short delay
          setTimeout(() => {
            console.log("✅ Navigating to dashboard after successful Google auth");
            setLocation('/dashboard');
          }, 1000);
          
        } else {
          console.log("❌ No redirect result found in DomainAuthHelper");
          
          // Clear stale attempt flags
          sessionStorage.removeItem('redirect_auth_attempt');
          sessionStorage.removeItem('redirect_auth_time');
        }
        
      } catch (error: any) {
        console.error("❌ Error in DomainAuthHelper redirect check:", error);
        
        // Clear attempt flags on error
        sessionStorage.removeItem('redirect_auth_attempt');
        sessionStorage.removeItem('redirect_auth_time');
      }
    };
    
    // Check immediately on mount, then periodically if redirect flag exists
    checkForRedirectResult();
    
    // Also check periodically in case the redirect result arrives after initial load
    const interval = setInterval(() => {
      const hasRedirectAttempt = sessionStorage.getItem('redirect_auth_attempt') === 'true';
      if (hasRedirectAttempt) {
        checkForRedirectResult();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [setLocation]);
  
  return null; // This component doesn't render anything
}