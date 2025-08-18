import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * Clean Google Authentication Component
 * Single button Firebase authentication connected to Brandentifier users
 */
export function CleanGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    console.log('🚀 Starting Google authentication...');

    try {
      // Import Firebase modules
      const { initializeApp } = await import('firebase/app');
      const { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult } = await import('firebase/auth');
      
      // Firebase configuration
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      console.log('Initializing Firebase with config:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain
      });

      // Initialize Firebase app
      const app = initializeApp(firebaseConfig, `clean-auth-${Date.now()}`);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      // Configure provider
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // First check if there's already a redirect result
      console.log('Checking for existing redirect result...');
      const existingResult = await getRedirectResult(auth);
      
      if (existingResult && existingResult.user) {
        console.log('Found existing authentication result:', existingResult.user.email);
        await handleAuthSuccess(existingResult.user);
        return;
      }

      // Show loading message
      toast({
        title: 'Redirecting to Google',
        description: 'You will be redirected to complete authentication...',
      });

      // Store auth attempt flag
      sessionStorage.setItem('google_auth_attempt', 'true');
      sessionStorage.setItem('auth_timestamp', Date.now().toString());

      console.log('Starting Firebase redirect authentication...');
      
      // Start redirect flow
      await signInWithRedirect(auth, provider);
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Clear auth flags on error
      sessionStorage.removeItem('google_auth_attempt');
      sessionStorage.removeItem('auth_timestamp');
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domain not authorized. Please contact support.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Please allow popups and try again.';
      }
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (user: any) => {
    try {
      console.log('Processing authentication success for:', user.email);
      
      // Prepare user data for Brandentifier
      const userData = {
        email: user.email,
        name: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL,
        googleId: user.uid,
        provider: 'google'
      };

      // Send to backend to create/update user
      console.log('Sending user data to backend...');
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);

      // Store authentication success
      sessionStorage.setItem('user_authenticated', 'true');
      sessionStorage.setItem('user_data', JSON.stringify(result.user));
      
      // Clear auth flags
      sessionStorage.removeItem('google_auth_attempt');
      sessionStorage.removeItem('auth_timestamp');

      toast({
        title: 'Authentication Successful!',
        description: `Welcome to Brandentifier, ${result.user.name}!`,
      });

      // Redirect to dashboard
      setTimeout(() => {
        console.log('Redirecting to Industry Pulse...');
        window.location.href = '/industry-pulse';
      }, 1500);

    } catch (error: any) {
      console.error('Error processing authentication:', error);
      
      toast({
        title: 'Authentication Error',
        description: 'Failed to complete login. Please try again.',
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <Button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        By continuing, you agree to create a Brandentifier account
      </p>
    </div>
  );
}