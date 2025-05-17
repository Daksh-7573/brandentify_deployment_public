import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';

/**
 * DevLoginPage - A specialized login page for development environments
 * Uses only redirect-based authentication which is more reliable in development
 */
export default function DevLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Check if we should show this page
  const isDevelopmentDomain = window.location.hostname === "25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev";
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);
  
  // Handle direct Google sign-in with redirect
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Clear any previous auth state
      localStorage.removeItem('auth_redirect_attempt');
      localStorage.removeItem('auth_redirect_time');
      localStorage.removeItem('popup_auth_attempt');
      localStorage.removeItem('popup_auth_time');
      
      // Create a fresh Google provider for this login attempt
      const directGoogleProvider = new GoogleAuthProvider();
      
      // Add all required scopes
      directGoogleProvider.addScope('email');
      directGoogleProvider.addScope('profile');
      directGoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      directGoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
      
      // Force account selection with critical parameters
      directGoogleProvider.setCustomParameters({
        prompt: 'select_account',
        auth_type: 'reauthenticate',
        access_type: 'offline',
        include_granted_scopes: 'true'
      });
      
      // Save a flag indicating we're using redirect authentication
      localStorage.setItem('dev_auth_redirect_attempt', 'true');
      localStorage.setItem('dev_auth_redirect_time', Date.now().toString());
      
      console.log("Starting Google redirect authentication for development domain");
      
      // Start the redirect flow
      await signInWithRedirect(auth, directGoogleProvider);
      
      // This line won't execute until after redirect completes and user returns
      console.log("Redirect authentication initiated");
    } catch (error: any) {
      console.error("Error starting Google redirect authentication:", error);
      toast({
        title: "Authentication Error",
        description: `Failed to start Google authentication: ${error.message}`,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Render the regular login page on non-development domains
  if (!isDevelopmentDomain) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Development Login Page</CardTitle>
            <CardDescription>
              This page is only available on development domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center p-4 text-amber-800 rounded-lg bg-amber-50">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p>You are not on a development domain. Please use the standard login page.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline"
              onClick={() => setLocation('/login')}
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md border-amber-400 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Development Login</CardTitle>
          <CardDescription>
            This is a special login page for the development environment.
            It uses redirect-based authentication which works better with Replit domains.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          <div className="flex items-center p-4 mb-4 text-blue-800 rounded-lg bg-blue-50">
            <AlertCircle className="w-5 h-5 mr-2" />
            <div>
              <p className="font-medium">Development Environment Detected</p>
              <p className="text-sm">Using specialized authentication flow for maximum compatibility.</p>
            </div>
          </div>
          
          <Button
            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-900 flex items-center justify-center gap-2"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
          >
            <LogIn className="w-5 h-5" />
            <span>Sign in with Google (Redirect Mode)</span>
          </Button>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setLocation('/')}
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}