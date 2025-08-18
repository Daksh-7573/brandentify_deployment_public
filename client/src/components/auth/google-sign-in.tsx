import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle, handleRedirectResult, getCurrentUser, isAuthenticated } from '@/lib/firebase-auth';

export function GoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('Checking authentication status...');
      
      // Check if user is already authenticated
      if (isAuthenticated()) {
        const user = getCurrentUser();
        console.log('User already authenticated:', user?.email);
        // Redirect already authenticated user
        window.location.href = '/industry-pulse';
        return;
      }
      
      // Check for redirect result
      const user = await handleRedirectResult();
      if (user) {
        console.log('Authentication successful via redirect:', user.email);
        // handleRedirectResult will handle the redirect, no need to do it here
        return;
      }
      
      console.log('No authenticated user found');
    } catch (error) {
      console.error('Error checking authentication:', error);
      toast({
        title: 'Authentication Error',
        description: 'There was an issue checking your authentication status.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Removed redirectToIndustryPulse - handled directly in firebase-auth.ts

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Starting Google sign-in...');
      toast({
        title: 'Redirecting to Google',
        description: 'You will be redirected to sign in with Google...',
      });
      
      await signInWithGoogle();
      // User will be redirected to Google, then back to this page
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      let message = 'Failed to sign in with Google. Please try again.';
      if (error.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized for Google sign-in.';
      }
      
      toast({
        title: 'Sign-in Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-400">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
      >
        {/* Google Icon */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>
      
      <p className="text-center text-sm text-gray-400 mt-4">
        Sign in to access your professional dashboard
      </p>
    </div>
  );
}