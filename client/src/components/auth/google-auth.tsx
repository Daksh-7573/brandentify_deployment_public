import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { DomainAuthHelper } from "@/components/firebase/DomainAuthHelper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

/**
 * Google Authentication button component with enhanced error handling
 * Uses a popup sign-in with redirect as primary method
 */
export function GoogleAuth() {
  const { signInWithGoogle, isLoading } = useAuth();
  const [showFirebaseHelp, setShowFirebaseHelp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleSignIn = async () => {
    try {
      // Reset error states
      setShowFirebaseHelp(false);
      setErrorMessage(null);
      
      // Log the click for debugging
      console.log("User clicked Google sign-in button");
      
      // Show toast to indicate we're initiating sign-in
      toast({
        title: "Initiating Google Sign-in",
        description: "Please wait while we connect to Google...",
      });
      
      // Call the signInWithGoogle function with forced redirect
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      
      const errorCode = error?.code || '';
      const errorMsg = error?.message || 'Unknown error occurred';
      
      // Domain configuration issues
      if (errorCode === 'auth/unauthorized-domain' || 
          errorMsg.includes('domain') || 
          errorMsg.includes('unauthorized')) {
        
        console.log("Firebase domain configuration issue detected");
        setShowFirebaseHelp(true);
        setErrorMessage("Firebase domain not authorized. Please add this domain to your Firebase project.");
      }
      // Popup issues
      else if (errorCode === 'auth/popup-blocked') {
        console.log("Popup was blocked by browser");
        setErrorMessage("Pop-up was blocked by your browser. We're trying to redirect you automatically.");
        
        // Show a specific toast for popup blocked
        toast({
          title: "Pop-up Blocked",
          description: "Please allow pop-ups or wait for the redirect to complete.",
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
        setErrorMessage(`Authentication error: ${errorMsg}`);
      }
      
      // Always log the complete error for debugging
      console.log({
        errorCode,
        errorMessage: errorMsg,
        fullError: error
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Show error message if any */}
      {errorMessage && (
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
      
      {/* Show Firebase domain helper if needed */}
      {showFirebaseHelp && <DomainAuthHelper />}
    </div>
  );
}