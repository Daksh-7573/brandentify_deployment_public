import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Google Authentication Component - Simplified Custom OAuth Only
 * 
 * FIXES APPLIED:
 * 1. Uses postMessage listener instead of popup.closed detection
 * 2. Verifies session before redirecting (prevents double-login)
 * 3. Adds delay for cookie propagation before reload
 */
export function FastGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const popupRef = useRef<Window | null>(null);
  const checkClosedIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'oauth_success') {
        console.log('✅ [FastGoogleAuth] Received oauth_success postMessage');
        const sessionData = event.data.user;
        
        if (checkClosedIntervalRef.current) {
          clearInterval(checkClosedIntervalRef.current);
          checkClosedIntervalRef.current = null;
        }

        setIsLoading(true);
        
        console.log('🔄 [FastGoogleAuth] Waiting for cookie propagation...');
        await new Promise(resolve => setTimeout(resolve, 700));
        
        const maxRetries = 5;
        let sessionVerified = false;
        
        for (let i = 0; i < maxRetries; i++) {
          console.log(`🔍 [FastGoogleAuth] Verifying session (attempt ${i + 1}/${maxRetries})...`);
          
          try {
            const sessionResponse = await fetch('/api/auth/session', {
              method: 'GET',
              credentials: 'include',
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              if (sessionData.success && sessionData.user) {
                console.log('✅ [FastGoogleAuth] Session verified! User:', sessionData.user.email);
                sessionVerified = true;
                break;
              }
            }
          } catch (error) {
            console.log(`⚠️ [FastGoogleAuth] Session check attempt ${i + 1} failed:`, error);
          }
          
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        }

        if (sessionVerified) {
          console.log('🚀 [FastGoogleAuth] Session verified, dispatching event and redirecting...');
          // Dispatch event to trigger auth context refresh
          window.dispatchEvent(new CustomEvent('googleAuthSuccess', { 
            detail: { user: sessionData } 
          }));
          // Give auth context time to update before redirecting
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        } else {
          console.log('⚠️ [FastGoogleAuth] Session verification failed after retries, reloading page...');
          window.location.reload();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      if (checkClosedIntervalRef.current) {
        clearInterval(checkClosedIntervalRef.current);
      }
    };
  }, []);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting Google authentication...');
      console.log('🚀 Using custom OAuth flow for all domains');
      
      const response = await fetch('/api/auth/google/url', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get OAuth URL');
      }
      
      const data = await response.json();
      console.log('✅ Got OAuth URL, redirecting...');
      
      try {
        const popup = window.open(
          data.oauthUrl,
          'google-auth',
          'width=500,height=600,left=' + 
          (window.screen.width / 2 - 250) + 
          ',top=' + (window.screen.height / 2 - 300) + 
          ',scrollbars=yes,resizable=yes'
        );
        
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          console.log('Popup blocked, using redirect method');
          window.location.href = data.oauthUrl;
          return;
        }
        
        popupRef.current = popup;
        
        checkClosedIntervalRef.current = setInterval(async () => {
          if (popup.closed) {
            clearInterval(checkClosedIntervalRef.current!);
            checkClosedIntervalRef.current = null;
            
            console.log('🔄 [FastGoogleAuth] Popup closed, waiting for cookie propagation...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log('🔍 [FastGoogleAuth] Checking session after popup close...');
            
            try {
              const sessionResponse = await fetch('/api/auth/session', {
                method: 'GET',
                credentials: 'include',
                headers: { 
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                }
              });

              if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                if (sessionData.success && sessionData.user) {
                  console.log('✅ [FastGoogleAuth] Session found after popup close! Dispatching event and redirecting...');
                  // Dispatch event to trigger auth context refresh
                  window.dispatchEvent(new CustomEvent('googleAuthSuccess', { 
                    detail: { user: sessionData.user } 
                  }));
                  // Give auth context time to update before redirecting
                  setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 100);
                  return;
                }
              }
            } catch (error) {
              console.log('⚠️ [FastGoogleAuth] Session check after popup close failed:', error);
            }
            
            setIsLoading(false);
            window.location.reload();
          }
        }, 1000);
        
        return;
        
      } catch (popupError) {
        console.log('Popup failed, using redirect method:', popupError);
        window.location.href = data.oauthUrl;
        return;
      }
      
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.message.includes('Failed to get OAuth URL')) {
        errorMessage = 'Unable to start authentication. Please try again.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'The authentication request took too long. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Showing error to user:', errorMessage);
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
      size="lg"
      data-testid="button-google-auth"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  );
}
