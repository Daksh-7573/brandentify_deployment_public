import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Authentication Callback Handler
 * Handles Google OAuth redirect results and creates/updates Brandentifier user accounts
 */
export function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 AuthCallback: Processing authentication callback...');
        console.log('🔄 Current URL:', window.location.href);
        console.log('🔄 URL params:', window.location.search);
        
        // Check if this looks like an OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const hasAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('authuser');
        console.log('🔄 Has OAuth params:', hasAuthParams);
        
        // Only proceed if we're actually in a callback scenario
        if (!hasAuthParams && !window.location.pathname.includes('callback')) {
          console.log('🔄 Not an OAuth callback, skipping...');
          setStatus('error');
          setMessage('Not an authentication callback');
          return;
        }
        
        // Firebase imports removed - using custom OAuth only
        console.log('🔄 Custom OAuth callback handler started...');
        
        // Check if user is already authenticated via custom OAuth
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        let result = null;
        if (response.ok) {
          result = { user: await response.json() };
          console.log('🔄 Custom OAuth user found:', result.user ? 'User data available' : 'No result');
        } else {
          console.log('🔄 No authenticated user found via custom OAuth');
        }

        if (result && result.user) {
          console.log('Custom OAuth authentication successful:', result.user.email);
          setMessage('Accessing your Brandentifier account...');

          // User data from custom OAuth
          const userData = result.user;

          console.log('User already authenticated via custom OAuth:', userData.email);

          // Store authentication data
          sessionStorage.setItem('user_authenticated', 'true');
          sessionStorage.setItem('brandentifier_user', JSON.stringify(userData));
          localStorage.setItem('auth_success', 'true');

          setStatus('success');
          setMessage(`Welcome to Brandentifier, ${userData.name || userData.email}!`);

          toast({
            title: 'Welcome to Brandentifier!',
            description: 'Your account has been created successfully.',
          });

          // Redirect to dashboard or onboarding
          const returnUrl = userData.profileCompleted < 95 ? '/onboarding-flow' : (sessionStorage.getItem('auth_return_url') || '/industry-pulse');
          setTimeout(() => {
            window.location.href = returnUrl;
          }, 2000);

        } else {
          // No redirect result - check if this was an intended auth callback
          console.log('No redirect result found');
          
          const authInitiated = sessionStorage.getItem('auth_initiated');
          const authTimestamp = sessionStorage.getItem('auth_timestamp');
          
          if (authInitiated && authTimestamp) {
            const timeSinceAuth = Date.now() - new Date(authTimestamp).getTime();
            
            if (timeSinceAuth < 300000) { // 5 minutes
              // Recent auth attempt failed
              setStatus('error');
              setMessage('Google authentication was cancelled or failed. Please try again.');
              
              // Clear auth flags
              sessionStorage.removeItem('auth_initiated');
              sessionStorage.removeItem('auth_timestamp');
              
              setTimeout(() => {
                window.location.href = '/auth';
              }, 3000);
              return;
            }
          }
          
          // Check if user is already authenticated via custom OAuth
          const authCheck = await fetch('/api/auth/me', { credentials: 'include' });
          if (authCheck.ok) {
            console.log('User already authenticated via custom OAuth, redirecting...');
            window.location.href = '/industry-pulse';
            return;
          }
          
          // No authentication found, redirect to auth page
          console.log('No authentication found, redirecting to auth page');
          window.location.href = '/auth';
        }

      } catch (error: any) {
        console.error('Auth callback error:', error);
        
        setStatus('error');
        setMessage(error.message || 'Authentication failed. Please try again.');
        
        toast({
          title: 'Authentication Failed',
          description: error.message || 'Something went wrong during authentication.',
          variant: 'destructive'
        });

        // Redirect to auth page after delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <h2 className="text-xl font-semibold text-center">Processing Authentication</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h2 className="text-xl font-semibold text-center text-green-600">Success!</h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-8 w-8 text-red-600" />
              <h2 className="text-xl font-semibold text-center text-red-600">Authentication Failed</h2>
            </>
          )}
          
          <p className="text-center text-gray-600">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-center text-gray-500">
              Redirecting to your dashboard...
            </p>
          )}
          
          {status === 'error' && (
            <p className="text-sm text-center text-gray-500">
              Redirecting to login page...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}