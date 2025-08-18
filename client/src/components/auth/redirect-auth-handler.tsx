import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Redirect Authentication Handler
 * Handles redirect results when users return from Google OAuth
 */
export function RedirectAuthHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirectResult = async () => {
      // Check for redirect results more broadly
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('scope');
      const hasHashParams = window.location.hash.includes('access_token') || window.location.hash.includes('id_token');
      const isAuthPage = window.location.pathname === '/' || window.location.pathname === '/auth';
      
      console.log('RedirectAuthHandler - URL check:', {
        hasAuthParams,
        hasHashParams,
        isAuthPage,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      });
      
      // Always check on auth page after a redirect
      if (!hasAuthParams && !hasHashParams && !isAuthPage) {
        console.log('No auth params and not on auth page, skipping redirect check');
        return;
      }

      console.log('Checking for Google OAuth redirect result...');

      try {
        const { getAuth, getRedirectResult } = await import('firebase/auth');
        const { initializeApp } = await import('firebase/app');
        
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        };
        
        const app = initializeApp(firebaseConfig, `redirect-${Date.now()}`);
        const auth = getAuth(app);
        
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log('Redirect authentication successful:', result.user.email);
          
          // Store user data
          const userData = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            authenticated: true,
            authTime: new Date().toISOString()
          };
          
          sessionStorage.setItem('firebase_user', JSON.stringify(userData));
          sessionStorage.setItem('user_authenticated', 'true');
          localStorage.setItem('auth_success', 'true');
          
          toast({
            title: 'Authentication Successful!',
            description: `Welcome back, ${result.user.displayName || result.user.email}`,
          });
          
          // Clean up URL parameters
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          // Redirect to Industry Pulse
          setTimeout(() => {
            console.log('Redirecting to Industry Pulse...');
            window.location.href = '/industry-pulse';
          }, 1000);
        }
      } catch (error: any) {
        console.error('Error handling redirect result:', error);
        
        if (error.code !== 'auth/no-current-user') {
          toast({
            title: 'Authentication Error',
            description: 'There was an issue completing your sign-in. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };

    // Run after component mounts
    handleRedirectResult();
  }, [toast]);

  return null; // This component doesn't render anything
}