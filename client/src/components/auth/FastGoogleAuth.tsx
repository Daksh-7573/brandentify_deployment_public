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
      
      // DEBUG: Always log iframe detection result
      console.log('🔍 [AUTH-METHOD-DETECTION] Starting authentication method detection...');
      console.log('🔍 [IFRAME-CHECK] window.top !== window.self:', isInIframe);
      console.log('🔍 [MOBILE-CHECK] isMobile:', isMobile);
      console.log('🔍 [USER-ACTIVATION-CHECK] hasUserActivation:', hasUserActivation);
      
      if (isInIframe) {
        console.log('🖼️ IFRAME DETECTED - Google blocks iframe authentication, forcing popup-only method');
        console.log('🔧 Popup authentication bypasses Google X-Frame-Options blocking in Replit preview');
        console.log('💡 This fixes "accounts.google.com refused to connect" and invalid_state errors');
        setAuthMethod('popup');
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
      
      console.log('✅ [AUTH-METHOD-DETECTION] Final method selected:', isInIframe ? 'popup (iframe-required)' : isMobile ? 'redirect (mobile)' : 'popup');
    };

    detectAuthMethod();
  }, []);

  // PostMessage listener for popup communication with cross-domain support
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      // SECURITY: Strict origin verification - only allow specific trusted domains
      const allowedOrigins = [
        window.location.origin,
        'https://accounts.google.com',
        'https://brandentifier.replit.app', // Stable OAuth domain
        'https://brandentifier.com'
      ];
      
      // SECURITY: For Replit domains, only allow the specific stable OAuth domain
      // Removed generic *.replit.* allowance to prevent open-redirect attacks
      if (!allowedOrigins.includes(event.origin)) {
        console.log('🚫 [SECURITY] Ignored postMessage from unauthorized origin:', event.origin);
        return;
      }

      const { type, success, error, crossDomain, sessionExchangeCode, user } = event.data || {};
      
      if (type === 'GOOGLE_AUTH_COMPLETE') {
        console.log('✅ Received authentication completion message', {
          success,
          crossDomain,
          origin: event.origin,
          hasSessionCode: !!sessionExchangeCode
        });
        
        if (success) {
          setLoadingMessage('Authentication successful! Redirecting...');
          
          setTimeout(() => {
            if (crossDomain && sessionExchangeCode) {
              // SECURITY: Construct session accept URL locally to prevent open-redirect attacks
              // Never trust URLs provided in postMessage from cross-origin sources
              const localSessionAcceptUrl = `${window.location.origin}/auth/accept-session?code=${sessionExchangeCode}`;
              
              console.log('🔄 [CROSS-DOMAIN-AUTH] Initiating secure session transfer');
              console.log('🔗 [CROSS-DOMAIN-AUTH] Local session accept URL:', localSessionAcceptUrl);
              
              // Store user data temporarily for quick access
              if (user) {
                sessionStorage.setItem('auth_pending_user', JSON.stringify(user));
              }
              
              // Redirect to locally constructed session acceptance URL
              window.location.href = localSessionAcceptUrl;
            } else {
              // Same domain - direct redirect
              console.log('✅ [SAME-DOMAIN-AUTH] Direct redirect to dashboard');
              window.location.href = '/dashboard';
            }
          }, 1000);
        } else {
          // Handle authentication failure
          setIsLoading(false);
          setLoadingMessage('');
          
          console.error('❌ [AUTH-FAILURE] Authentication failed:', {
            error,
            crossDomain,
            origin: event.origin
          });
          
          let errorMessage = error || 'Authentication was not completed successfully.';
          
          // Provide more specific error messages
          if (error?.includes('popup')) {
            errorMessage = 'Popup authentication failed. Please ensure popups are enabled and try again.';
          } else if (error?.includes('cross-domain') || error?.includes('domain')) {
            errorMessage = 'Cross-domain authentication issue. Please try again or contact support.';
          } else if (error?.includes('refused to connect')) {
            errorMessage = 'Authentication service temporarily unavailable. Please try again in a moment.';
          }
          
          toast({
            title: 'Authentication Failed',
            description: errorMessage,
            variant: 'destructive'
          });
        }
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
      
      // For redirect method, get URL and redirect immediately (mobile only)
      if (authMethod === 'redirect') {
        setLoadingMessage('Getting authentication URL...');
        console.log('🚀 Using direct redirect method (mobile)');
        
        const response = await fetch('/api/auth/google/url', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get OAuth URL');
        }
        
        const data = await response.json();
        setLoadingMessage('Redirecting to Google...');
        
        // Redirect for mobile contexts
        setTimeout(() => {
          window.location.href = data.oauthUrl;
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
        toast({
          title: 'Popup Blocked',
          description: 'Your browser blocked the authentication popup. Using redirect method instead.',
          variant: 'default'
        });
        
        // Fallback to redirect method with enhanced error handling
        try {
          const response = await fetch('/api/auth/google/url', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to get OAuth URL');
          }
          
          const data = await response.json();
          setLoadingMessage('Redirecting to Google...');
          
          setTimeout(() => {
            window.location.href = data.oauthUrl;
          }, 1000);
          
          return;
        } catch (fallbackError: any) {
          console.error('❌ Fallback redirect method failed:', fallbackError);
          throw new Error(`Authentication service unavailable: ${fallbackError.message}`);
        }
      }
      
      // Step 3: Get OAuth URL and redirect the pre-opened popup
      setLoadingMessage('Getting authentication URL...');
      
      const response = await fetch('/api/auth/google/url?popup=true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        popup?.close();
        throw new Error('Failed to get OAuth URL');
      }
      
      const data = await response.json();
      
      // Step 4: Redirect the popup to Google OAuth
      setLoadingMessage('Connecting to Google...');
      console.log('✅ Got OAuth URL, redirecting popup window');
      
      try {
        if (popup) {
          popup.location.href = data.oauthUrl;
        }
      } catch (popupRedirectError) {
        console.log('🚫 Failed to redirect popup - falling back to redirect method');
        popup?.close();
        
        setLoadingMessage('Switching to redirect method...');
        setTimeout(() => {
          window.location.href = data.oauthUrl;
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
          if (popup?.closed) {
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
        if (popup && !popup.closed) {
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
      
      {/* Authentication method indicator and iframe-specific messaging */}
      {!isLoading && authMethod !== 'detecting' && (
        <div className="text-xs text-center text-gray-500 space-y-1">
          <div className="flex items-center justify-center gap-1">
            {authMethod === 'popup' ? (
              <>
                <AlertCircle className="h-3 w-3" />
                {window.top !== window.self ? 'Popup method (required for iframe)' : 'Popup method (with redirect fallback)'}
              </>
            ) : (
              <>
                <ExternalLink className="h-3 w-3" />
                Redirect method (mobile-optimized)
              </>
            )}
          </div>
          
          {/* Special iframe-specific messaging */}
          {window.top !== window.self && (
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Popup Authentication Required</div>
                  <div className="text-blue-600 mt-1">
                    This app is running in preview mode. Please allow popups for authentication.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}