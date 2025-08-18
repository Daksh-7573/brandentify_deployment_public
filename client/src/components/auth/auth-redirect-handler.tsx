import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Authentication Redirect Handler
 * Handles Google OAuth redirects after user completes authentication
 */
export function AuthRedirectHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirectResult = async () => {
      // Only check if we initiated an auth attempt
      const authAttempt = sessionStorage.getItem('google_auth_attempt');
      const authTimestamp = sessionStorage.getItem('auth_timestamp');
      
      if (!authAttempt) {
        return; // No auth attempt in progress
      }

      // Check if auth attempt is recent (within last 10 minutes)
      if (authTimestamp && Date.now() - parseInt(authTimestamp) > 600000) {
        console.log('Auth attempt too old, cleaning up...');
        sessionStorage.removeItem('google_auth_attempt');
        sessionStorage.removeItem('auth_timestamp');
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
        
        const app = initializeApp(firebaseConfig, `redirect-handler-${Date.now()}`);
        const auth = getAuth(app);
        
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
          console.log('Redirect authentication successful:', result.user.email);
          
          // Process the authentication result
          await processAuthResult(result.user);
        } else {
          console.log('No redirect result found');
          
          // Clear auth flags if no result after reasonable time
          setTimeout(() => {
            sessionStorage.removeItem('google_auth_attempt');
            sessionStorage.removeItem('auth_timestamp');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Error handling redirect result:', error);
        
        // Clean up auth flags on error
        sessionStorage.removeItem('google_auth_attempt');
        sessionStorage.removeItem('auth_timestamp');
        
        if (error.code !== 'auth/no-current-user') {
          toast({
            title: 'Authentication Error',
            description: 'Failed to complete authentication. Please try again.',
            variant: 'destructive'
          });
        }
      }
    };

    const processAuthResult = async (user: any) => {
      try {
        console.log('Processing authentication result for:', user.email);
        
        // Prepare user data
        const userData = {
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
          googleId: user.uid,
          provider: 'google'
        };

        // Send to backend
        console.log('Sending user data to backend...');
        const response = await fetch('/api/auth/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Backend authentication result:', result);

        // Store authentication success
        sessionStorage.setItem('user_authenticated', 'true');
        sessionStorage.setItem('user_data', JSON.stringify(result.user));
        
        // Clear auth flags
        sessionStorage.removeItem('google_auth_attempt');
        sessionStorage.removeItem('auth_timestamp');

        toast({
          title: 'Welcome to Brandentifier!',
          description: `Successfully signed in as ${result.user.name}`,
        });

        // Clean up URL if needed
        if (window.location.search || window.location.hash) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        // Redirect to dashboard after brief delay
        setTimeout(() => {
          console.log('Redirecting to Industry Pulse...');
          window.location.href = '/industry-pulse';
        }, 2000);

      } catch (error: any) {
        console.error('Error processing authentication:', error);
        
        // Clean up on error
        sessionStorage.removeItem('google_auth_attempt');
        sessionStorage.removeItem('auth_timestamp');
        
        toast({
          title: 'Authentication Error',
          description: 'Failed to complete login. Please try again.',
          variant: 'destructive'
        });
      }
    };

    // Run the handler
    handleRedirectResult();
  }, [toast]);

  return null; // This component doesn't render anything
}