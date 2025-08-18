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
        console.log('🔄 AuthCallbackHandler: Checking for OAuth callback...');
        console.log('🔄 Current URL:', window.location.href);
        console.log('🔄 URL search params:', window.location.search);
        
        // Check if this is actually a callback URL  
        const urlParams = new URLSearchParams(window.location.search);
        const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('authuser');
        
        console.log('🔄 Has OAuth params:', hasOAuthParams);
        console.log('🔄 Auth initiated flag:', sessionStorage.getItem('auth_initiated'));
        
        // Only process if we have OAuth params OR if auth was initiated
        const authInitiated = sessionStorage.getItem('auth_initiated') === 'true';
        
        if (!hasOAuthParams && !authInitiated) {
          console.log('No OAuth parameters and no auth initiated - skipping');
          return;
        }

        console.log('Processing OAuth callback with Firebase...');

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

        // Clear auth initiated flag first
        sessionStorage.removeItem('auth_initiated');
        
        // Get the redirect result
        console.log('🔄 Calling getRedirectResult...');
        const result = await getRedirectResult(auth);
        console.log('🔄 Redirect result:', result?.user?.email || 'No result');
        
        if (result?.user) {
          console.log('✅ Google authentication successful:', result.user.email);
          
          // Prepare user data for backend
          const userData = {
            firebaseUid: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || 'Google User',
            photoURL: result.user.photoURL || '',
            googleId: result.user.uid,
            authProvider: 'google',
            emailVerified: result.user.emailVerified
          };

          console.log('Sending user data to backend:', userData.email);

          // Call backend to create/get user (backend handles existing accounts)
          const response = await fetch('/api/auth/google-signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          const data = await response.json();
          
          if (data.success) {
            // Sign in to our auth context
            signIn(data.user);
            
            const isExistingUser = data.user.profileCompleted > 20;
            
            toast({
              title: isExistingUser ? 'Welcome back!' : 'Welcome to Brandentifier!',
              description: `Signed in as ${data.user.name}`
            });

            console.log(`User ${isExistingUser ? 'signed in' : 'account created'} successfully`);

            // Navigate to intended page
            const returnUrl = sessionStorage.getItem('auth_return_url') || '/industry-pulse';
            sessionStorage.removeItem('auth_return_url');
            navigate(returnUrl);
          } else {
            throw new Error(data.message || 'Authentication failed');
          }
        } else {
          console.log('No redirect result found - user may need to retry authentication');
          // Don't navigate away if no result - user might be on auth page legitimately
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