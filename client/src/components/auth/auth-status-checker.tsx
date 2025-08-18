import { useEffect } from 'react';

/**
 * Authentication Status Checker
 * Checks for existing authentication on page load
 */
export function AuthStatusChecker() {
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 AuthStatusChecker: Checking authentication status...');
        
        // Check session storage first
        const sessionUser = sessionStorage.getItem('firebase_user');
        const isAuthenticated = sessionStorage.getItem('user_authenticated');
        
        console.log('Session storage check:', {
          hasUser: !!sessionUser,
          isAuthenticated: isAuthenticated === 'true'
        });
        
        if (sessionUser && isAuthenticated === 'true') {
          const userData = JSON.parse(sessionUser);
          console.log('Found authenticated user in session:', userData.email);
          
          // User is already authenticated, redirect to Industry Pulse
          console.log('Redirecting authenticated user to Industry Pulse...');
          window.location.href = '/industry-pulse';
          return;
        }
        
        // Check local storage as backup
        const localAuthSuccess = localStorage.getItem('auth_success');
        const localUser = localStorage.getItem('last_user');
        
        if (localAuthSuccess === 'true' && localUser) {
          const userData = JSON.parse(localUser);
          console.log('Found auth success in local storage for:', userData.email);
          
          // Restore session storage
          sessionStorage.setItem('firebase_user', localUser);
          sessionStorage.setItem('user_authenticated', 'true');
          
          console.log('Redirecting to Industry Pulse...');
          window.location.href = '/industry-pulse';
          return;
        }
        
        // Try Firebase current user as last resort
        const { initializeApp, getApps } = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');
        
        const existingApps = getApps();
        if (existingApps.length > 0) {
          const auth = getAuth(existingApps[0]);
          
          if (auth.currentUser) {
            console.log('Found Firebase current user:', auth.currentUser.email);
            
            const userData = {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              displayName: auth.currentUser.displayName,
              photoURL: auth.currentUser.photoURL,
              authenticated: true,
              timestamp: new Date().toISOString()
            };
            
            // Store user data
            sessionStorage.setItem('firebase_user', JSON.stringify(userData));
            sessionStorage.setItem('user_authenticated', 'true');
            
            console.log('Redirecting Firebase user to Industry Pulse...');
            window.location.href = '/industry-pulse';
            return;
          }
        }
        
        console.log('No authenticated user found, staying on auth page');
        
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    // Run check after component mounts
    const timeout = setTimeout(checkAuthStatus, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  return null; // This component doesn't render anything
}