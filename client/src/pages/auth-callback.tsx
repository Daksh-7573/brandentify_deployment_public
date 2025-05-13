import { useEffect, useState } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { logOAuthFlowDetails, logDetailedAuthError } from '@/utils/auth-error-logger';

/**
 * Auth Callback Page to handle Google authentication redirects
 * This page is specifically designed to handle the redirect flow
 * when a user is redirected back from Google authentication.
 */
export default function AuthCallback() {
  const { refreshUserData } = useAuth();
  const [processingRedirect, setProcessingRedirect] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Log detailed OAuth flow information for debugging
    logOAuthFlowDetails();
    
    const handleRedirect = async () => {
      try {
        console.log("Auth Callback: Processing redirect result at", window.location.pathname);
        console.log("URL params:", window.location.search);
        
        // Look for error params in URL (Firebase might include these on error)
        const urlParams = new URLSearchParams(window.location.search);
        const urlError = urlParams.get('error');
        
        if (urlError) {
          console.error("Error parameter found in URL:", urlError);
          const errorMsg = urlParams.get('error_description') || urlError;
          setError(`Auth error from redirect: ${errorMsg}`);
          
          toast({
            title: "Authentication error",
            description: errorMsg,
            variant: "destructive"
          });
          
          setProcessingRedirect(false);
          return;
        }
        
        // Get the redirect result from Firebase
        const result = await getRedirectResult(auth);
        
        if (result) {
          console.log("Auth Callback: Redirect result found", result.user.uid);
          
          // Refresh user data in context
          await refreshUserData();
          
          toast({
            title: "Authentication successful",
            description: "You've been successfully signed in.",
          });
          
          // Redirect to home after successful login
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          console.log("Auth Callback: No redirect result found");
          
          // Check if we have other auth indicators in localStorage
          const authAttempt = localStorage.getItem('authAttemptInProgress');
          const authAttemptTime = localStorage.getItem('authAttemptTime');
          
          if (authAttempt) {
            console.log("Previous auth attempt found from:", authAttemptTime);
            setError("Authentication process didn't complete. You may need to sign in again.");
            localStorage.removeItem('authAttemptInProgress');
            localStorage.removeItem('authAttemptTime');
          } else {
            setError("No authentication data found. This page should only be accessed after signing in.");
          }
          
          // Redirect to home after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      } catch (err: any) {
        console.error("Auth Callback Error:", err);
        
        // Log detailed error information for debugging
        logDetailedAuthError(err, "auth-callback");
        
        setError(`Authentication error: ${err.message}`);
        
        toast({
          title: "Authentication failed",
          description: "There was a problem signing you in. Please try again.",
          variant: "destructive"
        });
        
        // Redirect to home after error
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } finally {
        setProcessingRedirect(false);
      }
    };

    handleRedirect();
  }, [refreshUserData, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-xl font-semibold text-center">
          {processingRedirect ? "Processing Authentication..." : error ? "Authentication Error" : "Authentication Complete"}
        </h1>
        
        {processingRedirect && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-center text-muted-foreground">
              Please wait while we complete your authentication...
            </p>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Path: {window.location.pathname}
              <br />
              Hostname: {window.location.hostname}
            </p>
          </div>
        )}
        
        {error && (
          <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-destructive mr-2 mt-0.5" />
              <div>
                <p className="text-destructive font-medium">{error}</p>
                <p className="mt-2 text-sm text-muted-foreground">Please try signing in again from the homepage.</p>
                <p className="mt-1 text-sm text-muted-foreground">Redirecting you to the home page...</p>
                
                <div className="mt-4 p-2 bg-card rounded border border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Debug Info:</strong>
                    <br />
                    Path: {window.location.pathname}
                    <br />
                    Params: {window.location.search}
                    <br />
                    Hostname: {window.location.hostname}
                  </p>
                </div>
                
                <button 
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!processingRedirect && !error && (
          <div className="p-4 border border-primary bg-primary/10 rounded-md text-center">
            <p className="text-primary font-medium">Authentication successful!</p>
            <p className="mt-2 text-sm text-muted-foreground">Redirecting you to the home page...</p>
            
            <button 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </button>
          </div>
        )}
        
        <div className="text-xs text-center text-muted-foreground mt-6">
          Having trouble? Try the <a href="/auth-debug" className="text-primary hover:underline">auth debugging page</a>.
        </div>
      </div>
    </div>
  );
}