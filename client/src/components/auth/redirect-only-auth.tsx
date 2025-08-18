import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * Redirect-Only Authentication
 * Bypasses popup issues by using redirect authentication exclusively
 */
export function RedirectOnlyAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkForRedirectResult();
  }, []);

  const checkForRedirectResult = async () => {
    setIsCheckingRedirect(true);
    
    try {
      console.log('🔍 Checking for redirect result...');
      
      // Check URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('scope');
      const hasHashParams = window.location.hash.includes('access_token') || window.location.hash.includes('id_token');
      
      console.log('URL has auth params:', hasAuthParams);
      console.log('URL has hash params:', hasHashParams);
      console.log('Current URL:', window.location.href);
      
      const { initializeApp, getApps } = await import('firebase/app');
      const { getAuth, getRedirectResult } = await import('firebase/auth');
      
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
      
      let app;
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
        console.log('Using existing Firebase app');
      } else {
        app = initializeApp(firebaseConfig, 'redirect-check');
        console.log('Initialized new Firebase app');
      }
      
      const auth = getAuth(app);
      console.log('Getting redirect result...');
      
      const result = await getRedirectResult(auth);
      console.log('Redirect result:', result);
      
      if (result && result.user) {
        console.log('🎉 Redirect authentication successful!');
        console.log('User email:', result.user.email);
        console.log('User name:', result.user.displayName);
        
        // Store user data in multiple locations for reliability
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          authenticated: true,
          timestamp: new Date().toISOString(),
          authMethod: 'redirect'
        };
        
        // Store in session and local storage
        sessionStorage.setItem('firebase_user', JSON.stringify(userData));
        sessionStorage.setItem('user_authenticated', 'true');
        localStorage.setItem('auth_success', 'true');
        localStorage.setItem('last_user', JSON.stringify(userData));
        
        console.log('User data stored successfully');
        
        // Clear URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('URL cleaned:', cleanUrl);
        
        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${result.user.displayName || result.user.email}!`,
        });
        
        // Redirect to Industry Pulse after a short delay
        console.log('Redirecting to Industry Pulse in 2 seconds...');
        setTimeout(() => {
          console.log('Executing redirect to /industry-pulse');
          window.location.href = '/industry-pulse';
        }, 2000);
        
        return true; // Indicate success
      } else {
        console.log('No redirect result found or no user in result');
        console.log('Auth current user:', auth.currentUser);
        return false;
      }
      
    } catch (error: any) {
      console.error('Error checking redirect result:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return false;
    } finally {
      setIsCheckingRedirect(false);
    }
  };

  const handleRedirectAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting redirect-only authentication...');
      
      const { initializeApp, getApps } = await import('firebase/app');
      const { getAuth, GoogleAuthProvider, signInWithRedirect } = await import('firebase/auth');
      
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
      
      console.log('Firebase config valid:', {
        hasApiKey: !!firebaseConfig.apiKey,
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain
      });
      
      // Initialize Firebase
      let app;
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
        console.log('Using existing Firebase app');
      } else {
        app = initializeApp(firebaseConfig, 'redirect-auth');
        console.log('Initialized new Firebase app');
      }
      
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      // Configure provider
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Initiating redirect to Google...');
      
      toast({
        title: 'Redirecting to Google',
        description: 'You will be redirected to sign in with Google...',
      });
      
      // Start redirect authentication
      await signInWithRedirect(auth, provider);
      
      // This code won't run because the page will redirect
      
    } catch (error: any) {
      console.error('Redirect authentication failed:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google authentication.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingRedirect) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-400">Checking authentication status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleRedirectAuth}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white"
        size="lg"
      >
        {/* Google Icon */}
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        
        {isLoading ? 'Redirecting...' : 'Sign in with Google (Redirect)'}
      </Button>
      
      <div className="text-xs text-gray-400 text-center">
        <p>Uses redirect authentication (no popups)</p>
        <p>Most reliable method - you'll be taken to Google's sign-in page</p>
      </div>
    </div>
  );
}