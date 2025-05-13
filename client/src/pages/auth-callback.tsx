import { useEffect, useState } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
    const handleRedirect = async () => {
      try {
        console.log("Auth Callback: Processing redirect result");
        
        // Get the redirect result
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
          window.location.href = '/';
        } else {
          console.log("Auth Callback: No redirect result found");
          setError("No authentication data found. You may need to sign in again.");
          // Redirect to home after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (err: any) {
        console.error("Auth Callback Error:", err);
        setError(`Authentication error: ${err.message}`);
        
        toast({
          title: "Authentication failed",
          description: "There was a problem signing you in. Please try again.",
          variant: "destructive"
        });
        
        // Redirect to home after error
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
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
          </div>
        )}
        
        {error && (
          <div className="p-4 border border-destructive bg-destructive/10 rounded-md text-center">
            <p className="text-destructive">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">Redirecting you to the home page...</p>
          </div>
        )}
        
        {!processingRedirect && !error && (
          <div className="p-4 border border-primary bg-primary/10 rounded-md text-center">
            <p className="text-primary">Authentication successful!</p>
            <p className="mt-2 text-sm text-muted-foreground">Redirecting you to the home page...</p>
          </div>
        )}
      </div>
    </div>
  );
}