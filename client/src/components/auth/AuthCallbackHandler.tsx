import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

/**
 * Simple callback handler for Google OAuth
 * Processes Firebase redirect results and creates Brandentifier accounts
 */
export function AuthCallbackHandler() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        
        // Check if this is actually a callback URL
        const urlParams = new URLSearchParams(window.location.search);
        const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('authuser');
        
        if (!hasOAuthParams) {
          console.log('No OAuth parameters found');
          return;
        }

        console.log('OAuth parameters detected, processing with Firebase...');

        // Dynamic Firebase imports
        const [
          { initializeApp },
          { getAuth, getRedirectResult, GoogleAuthProvider }
        ] = await Promise.all([
          import('firebase/app'),
          import('firebase/auth')
        ]);

        // Firebase config
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        };

        // Initialize Firebase with consistent app name
        const app = initializeApp(firebaseConfig, 'brandentifier-auth-main');
        const auth = getAuth(app);

        // Get the redirect result
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          console.log('✅ Google authentication successful:', result.user.email);
          
          // Create Brandentifier account
          const userData = {
            firebaseUid: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || 'Google User',
            photoURL: result.user.photoURL || '',
            googleId: result.user.uid,
            authProvider: 'google',
            emailVerified: result.user.emailVerified
          };

          // Call backend to create/get user
          const response = await fetch('/api/auth/google-signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          const data = await response.json();
          
          if (data.success) {
            // Sign in to our auth context
            signIn(data.user);
            
            toast({
              title: 'Welcome to Brandentifier!',
              description: `Signed in as ${data.user.name}`
            });

            // Navigate to intended page
            const returnUrl = sessionStorage.getItem('auth_return_url') || '/industry-pulse';
            sessionStorage.removeItem('auth_return_url');
            navigate(returnUrl);
          } else {
            throw new Error(data.message || 'Account creation failed');
          }
        } else {
          console.log('No redirect result found');
        }

      } catch (error: any) {
        console.error('OAuth callback error:', error);
        toast({
          title: 'Authentication Failed',
          description: error.message,
          variant: 'destructive'
        });
        navigate('/auth');
      }
    };

    // Only run on mount
    handleCallback();
  }, []);

  return null;
}