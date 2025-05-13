import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { DomainAuthHelper } from "@/components/firebase/DomainAuthHelper";
import { DomainAuthAlert } from "@/components/auth/domain-auth-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { logAuthError, checkFirebaseConfig, getFriendlyAuthErrorMessage } from "@/utils/auth-diagnostics";

/**
 * Google Authentication button component with enhanced error handling
 * Uses a popup sign-in with redirect as primary method
 */
export function GoogleAuth() {
  const { signInWithGoogle, isLoading } = useAuth();
  const [showFirebaseHelp, setShowFirebaseHelp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [configIssues, setConfigIssues] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Check Firebase configuration on component mount
  useEffect(() => {
    const config = checkFirebaseConfig();
    // We'll log issues but no longer block sign-in attempts
    if (!config.isConfigured) {
      console.warn("Firebase configuration issues detected:", config);
      // Only show issues but don't disable the button
      setConfigIssues(config.issues);
    }
  }, []);
  
  const handleSignIn = async () => {
    try {
      // Reset error states
      setShowFirebaseHelp(false);
      setErrorMessage(null);
      
      // We'll log issues but no longer block sign-in attempts
      const config = checkFirebaseConfig();
      console.log("Firebase configuration status:", config);
      
      // Get the current domain for diagnostic purposes
      const currentDomain = window.location.hostname;
      const isProblemDomain = currentDomain === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";
      console.log(`User clicked Google sign-in button on domain: ${currentDomain}`);
      
      // For the problematic domain, suggest using the preview URL instead
      if (isProblemDomain) {
        const usePreviewUrl = window.confirm(
          "Authentication may not work correctly on this direct URL. Would you like to use the Replit preview URL instead, where authentication works reliably?"
        );
        
        if (usePreviewUrl) {
          // Store this in sessionStorage so we know the user was redirected for auth
          sessionStorage.setItem('auth_redirect_from_problem_domain', 'true');
          window.location.href = window.location.origin;
          return;
        }
      }
      
      // Show toast to indicate we're initiating sign-in
      toast({
        title: "Initiating Google Sign-in",
        description: "Please wait while we connect to Google...",
      });
      
      // Call the signInWithGoogle function
      await signInWithGoogle();
      
      console.log("Google sign-in completed successfully");
    } catch (error: any) {
      // Use our diagnostic utility for comprehensive error logging
      logAuthError(error, "GoogleAuth.handleSignIn");
      
      // Get user-friendly error message
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      
      const errorCode = error?.code || '';
      const errorMsg = error?.message || 'Unknown error occurred';
      
      console.log(`Google auth error: ${errorCode} - ${errorMsg}`);
      
      // Domain configuration issues - most likely root cause of redirect loop
      if (errorCode === 'auth/unauthorized-domain' || 
          errorMsg.includes('domain') || 
          errorMsg.includes('unauthorized')) {
        
        console.log("Firebase domain configuration issue detected");
        // Domain messages removed per user request
        setErrorMessage("Authentication error. Please try again later.");
        
        // Show a generic toast instead of domain-specific one
        toast({
          title: "Authentication Error",
          description: "There was a problem signing in. Please try again later.",
          variant: "destructive"
        });
      }
      // Popup issues - should fall back to redirect automatically
      else if (errorCode === 'auth/popup-blocked') {
        console.log("Popup was blocked by browser - should try redirect automatically");
        setErrorMessage("Pop-up was blocked by your browser. The app is trying to redirect you automatically instead.");
        
        toast({
          title: "Pop-up Blocked",
          description: "Trying alternative sign-in method automatically...",
          variant: "destructive"
        });
      }
      else if (errorCode === 'auth/popup-closed-by-user') {
        console.log("User closed the popup");
        setErrorMessage("You closed the sign-in window. Please try again.");
      }
      // Generic network or initialization issues
      else if (errorCode === 'auth/network-request-failed' || errorMsg.includes('network')) {
        setErrorMessage("Network error. Please check your internet connection and try again.");
      }
      // Firebase not initialized or configuration issues
      else if (errorCode === 'auth/internal-error' || errorMsg.includes('initialization')) {
        setShowFirebaseHelp(true);
        setErrorMessage("Firebase authentication error. Please check your Firebase configuration.");
      }
      // Default error case
      else {
        console.log("Showing generic error and Firebase helper");
        setShowFirebaseHelp(true);
        setErrorMessage(friendlyMessage || `Authentication error: ${errorMsg}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Show domain auth alert for problematic domain */}
      <DomainAuthAlert />
      
      {/* Show configuration issues if any */}
      {configIssues.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div>
            <AlertTitle>Firebase Configuration Issues</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                {configIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </div>
        </Alert>
      )}
      
      {/* Show error message if any */}
      {errorMessage && !configIssues.length && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <Button
        variant="outline"
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
        )}
        Continue with Google
      </Button>
      
      {/* Diagnostic info to help with debugging */}
      <div className="text-xs text-gray-500 mt-1 text-center">
        {navigator.onLine ? (
          <span className="text-green-600">✓ Connected to Internet</span>
        ) : (
          <span className="text-red-600">✗ No Internet Connection</span>
        )}
        {' • '}
        <span className="font-mono">{window.location.hostname}</span>
      </div>
      
      {/* Firebase domain helper removed per user request */}
      
      {/* Link to test auth in Firebase */}
      {configIssues.length === 0 && (
        <div className="text-center mt-2">
          <Button
            variant="link"
            className="text-xs text-blue-600 h-auto p-0"
            onClick={() => window.open('https://console.firebase.google.com/project/_/authentication/providers', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open Firebase Authentication Settings
          </Button>
        </div>
      )}
    </div>
  );
}