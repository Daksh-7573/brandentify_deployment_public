import { Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function GoogleAuth() {
  const { signInWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();
  const [authAttempted, setAuthAttempted] = useState(false);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);
  
  // Check if Firebase is properly configured
  useEffect(() => {
    const checkFirebaseConfig = () => {
      const hasProjectId = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const hasApiKey = !!import.meta.env.VITE_FIREBASE_API_KEY;
      const hasAppId = !!import.meta.env.VITE_FIREBASE_APP_ID;
      
      const isConfigured = hasProjectId && hasApiKey && hasAppId;
      setIsFirebaseConfigured(isConfigured);
      
      if (!isConfigured) {
        console.error("Firebase configuration is incomplete");
      }
    };
    
    checkFirebaseConfig();
  }, []);

  const handleSignIn = async () => {
    setAuthAttempted(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error in Google Auth component:", error);
    }
  };

  return (
    <div className="space-y-4">
      {!isFirebaseConfigured && (
        <div className="p-2 mb-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Firebase configuration is incomplete. Please check your environment variables.</span>
        </div>
      )}
      
      <Button
        variant="outline"
        onClick={handleSignIn}
        disabled={isLoading || !isFirebaseConfigured}
        className="w-full relative"
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
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>
      
      {authAttempted && !isLoading && (
        <div className="mt-2 text-xs text-gray-600">
          <p>If you're having trouble signing in:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Ensure you have third-party cookies enabled</li>
            <li>Try disabling any ad-blockers temporarily</li>
            <li>Make sure you're using a modern browser</li>
          </ul>
        </div>
      )}
    </div>
  );
}