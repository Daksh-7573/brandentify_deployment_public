import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Google Authentication Component - Modern OAuth with Pre-open Popup Pattern
 * Implements browser security policy compliance and automatic fallback strategies
 */
export function FastGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'popup' | 'redirect' | 'detecting'>('detecting');
  const [loadingMessage, setLoadingMessage] = useState('Starting authentication...');
  const { toast } = useToast();

  // Detect optimal authentication method on component mount
  useEffect(() => {
    const detectAuthMethod = () => {
      // IFRAME DETECTION: Check if we're running inside an iframe (e.g., Replit app preview)
      const isInIframe = window.top !== window.self;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasUserActivation = 'userActivation' in navigator;
      
      if (isInIframe) {
        console.log('🖼️ IFRAME DETECTED - Google blocks iframe authentication, forcing top-level redirect method');
        console.log('🔧 This fixes the "accounts.google.com refused to connect" and 403 errors in Replit app preview');
        setAuthMethod('redirect');
      } else if (isMobile) {
        console.log('📱 Mobile device detected - using redirect method');
        setAuthMethod('redirect');
      } else if (hasUserActivation && (navigator.userActivation as any).isActive !== undefined) {
        console.log('🖥️ Desktop with user activation API - popup method preferred');
        setAuthMethod('popup');
      } else {
        console.log('🖥️ Desktop without user activation API - popup method with fallback');
        setAuthMethod('popup');
      }
    };

    detectAuthMethod();
  }, []);

  // PostMessage listener for popup communication
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      // Verify origin for security
      const allowedOrigins = [
        window.location.origin,
        'https://accounts.google.com'
      ];
      
      if (!allowedOrigins.some(origin => event.origin.startsWith(origin.split('//')[0] + '//'))) {
        console.log('🚫 Ignored postMessage from unauthorized origin:', event.origin);
        return;
      }

      const { type, success, error } = event.data || {};
      
      if (type === 'GOOGLE_AUTH_COMPLETE') {
        console.log('✅ Received authentication completion message');
        setLoadingMessage('Authentication successful! Redirecting...');
        
        setTimeout(() => {
          if (success) {
            window.location.href = '/dashboard';
          } else {
            setIsLoading(false);
            toast({
              title: 'Authentication Failed',
              description: error || 'Authentication was not completed successfully.',
              variant: 'destructive'
            });
          }
        }, 1000);
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, [toast]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setLoadingMessage('Starting authentication...');
    
    try {
      console.log('🔄 Starting Google authentication with method:', authMethod);
      
      // For redirect method, get URL and redirect immediately
      if (authMethod === 'redirect') {
        setLoadingMessage('Getting authentication URL...');
        
        // IFRAME-SAFE AUTHENTICATION: Check if we're in iframe context
        const isInIframe = window.top !== window.self;
        if (isInIframe) {
          console.log('🚀 Using iframe-safe redirect method (top-level navigation)');
        } else {
          console.log('🚀 Using direct redirect method (most reliable)');
        }
        
        const response = await fetch('/api/auth/google/url', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get OAuth URL');
        }
        
        const data = await response.json();
        setLoadingMessage('Redirecting to Google...');
        
        // Small delay to show loading message
        setTimeout(() => {
          if (isInIframe) {
            // IFRAME FIX: Navigate the top-level window to break out of iframe
            console.log('🔧 Breaking out of iframe for authentication');
            window.top!.location.href = data.oauthUrl;
          } else {
            // Normal redirect for non-iframe contexts
            window.location.href = data.oauthUrl;
          }
        }, 500);
        
        return;
      }
      
      // Pre-open popup pattern for popup method
      console.log('🚀 Using pre-open popup pattern for better browser compatibility');
      setLoadingMessage('Opening authentication window...');
      
      // Step 1: Open blank popup immediately on user click (avoids blocking)
      const popupFeatures = [
        'width=500',
        'height=600',
        `left=${Math.round(window.screen.width / 2 - 250)}`,
        `top=${Math.round(window.screen.height / 2 - 300)}`,
        'scrollbars=yes',
        'resizable=yes',
        'status=yes',
        'toolbar=no',
        'menubar=no',
        'location=yes'
      ].join(',');
      
      const popup = window.open('about:blank', 'google-auth', popupFeatures);
      
      // Step 2: Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        console.log('🚫 Popup was blocked - falling back to redirect method');
        setLoadingMessage('Popup blocked - switching to redirect method...');
        
        // Fallback to redirect method
        const response = await fetch('/api/auth/google/url', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get OAuth URL');
        }
        
        const data = await response.json();
        setLoadingMessage('Redirecting to Google...');
        
        setTimeout(() => {
          const isInIframe = window.top !== window.self;
          if (isInIframe) {
            window.top!.location.href = data.oauthUrl;
          } else {
            window.location.href = data.oauthUrl;
          }
        }, 1000);
        
        return;
      }
      
      // Step 3: Get OAuth URL and redirect the pre-opened popup
      setLoadingMessage('Getting authentication URL...');
      
      const response = await fetch('/api/auth/google/url?popup=true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        popup.close();
        throw new Error('Failed to get OAuth URL');
      }
      
      const data = await response.json();
      
      // Step 4: Redirect the popup to Google OAuth
      setLoadingMessage('Connecting to Google...');
      console.log('✅ Got OAuth URL, redirecting popup window');
      
      try {
        popup.location.href = data.oauthUrl;
      } catch (popupRedirectError) {
        console.log('🚫 Failed to redirect popup - falling back to redirect method');
        popup.close();
        
        setLoadingMessage('Switching to redirect method...');
        setTimeout(() => {
          const isInIframe = window.top !== window.self;
          if (isInIframe) {
            window.top!.location.href = data.oauthUrl;
          } else {
            window.location.href = data.oauthUrl;
          }
        }, 1000);
        return;
      }
      
      // Step 5: Monitor popup for completion or closure
      setLoadingMessage('Waiting for authentication...');
      
      let popupCheckInterval: NodeJS.Timeout;
      let authTimeout: NodeJS.Timeout;
      
      const cleanup = () => {
        if (popupCheckInterval) clearInterval(popupCheckInterval);
        if (authTimeout) clearTimeout(authTimeout);
      };
      
      // Check popup status every second
      popupCheckInterval = setInterval(() => {
        try {
          if (popup.closed) {
            console.log('🔄 Popup closed - checking authentication status');
            cleanup();
            setLoadingMessage('Checking authentication status...');
            
            // Small delay then refresh to check auth state
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } catch (error) {
          // Popup might be on different origin, can't access .closed property
          console.log('🔄 Popup cross-origin - monitoring via postMessage');
        }
      }, 1000);
      
      // Timeout after 5 minutes
      authTimeout = setTimeout(() => {
        cleanup();
        if (!popup.closed) {
          popup.close();
        }
        setIsLoading(false);
        
        toast({
          title: 'Authentication Timeout',
          description: 'The authentication process took too long. Please try again.',
          variant: 'destructive'
        });
      }, 5 * 60 * 1000);
      
    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Authentication failed. Please try again.';
      let errorTitle = 'Authentication Error';
      
      if (error.message.includes('Failed to get OAuth URL')) {
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to authentication service. Please check your internet connection and try again.';
      } else if (error.name === 'AbortError') {
        errorTitle = 'Request Timeout';
        errorMessage = 'The authentication request took too long. Please try again.';
      } else if (error.message.includes('Network')) {
        errorTitle = 'Network Error';
        errorMessage = 'Network connection issue. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Showing error to user:', { errorTitle, errorMessage });
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGoogleAuth()}
          >
            Retry
          </Button>
        )
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <Button
        onClick={handleGoogleAuth}
        disabled={isLoading || authMethod === 'detecting'}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 transition-all duration-200"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">
              {loadingMessage}
            </span>
          </>
        ) : authMethod === 'detecting' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Detecting optimal method...
          </>
        ) : (
          <>
            {/* Google Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
            {authMethod === 'redirect' && (
              <ExternalLink className="h-4 w-4 ml-1 opacity-70" />
            )}
          </>
        )}
      </Button>
      
      {/* Authentication method indicator */}
      {!isLoading && authMethod !== 'detecting' && (
        <div className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
          {authMethod === 'popup' ? (
            <>
              <AlertCircle className="h-3 w-3" />
              Popup method (with redirect fallback)
            </>
          ) : (
            <>
              <ExternalLink className="h-3 w-3" />
              {window.top !== window.self ? 'Iframe-safe redirect method' : 'Redirect method (mobile-optimized)'}
            </>
          )}
        </div>
      )}
    </div>
  );
}