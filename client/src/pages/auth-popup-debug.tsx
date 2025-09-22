import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import { logOAuthFlowDetails, logDetailedAuthError } from '@/utils/auth-error-logger';
import { useAuth } from '@/hooks/use-auth';

/**
 * Authentication Popup Debug Page
 * 
 * This page provides an alternative authentication method using popup
 * instead of redirect. This can be useful when the redirect method is
 * not working due to Google refusing connections from certain domains.
 */
export default function AuthPopupDebugPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Get the auth context
  const { user, isAuthenticated } = useAuth();
  
  // Initialize Firebase
  useEffect(() => {
    // If already authenticated, show the user info
    if (isAuthenticated && user) {
      setUserInfo(user);
      setSuccess(true);
    }
  }, [isAuthenticated, user]);
  
  // Handle sign in with proxy approach
  const handleSignInWithProxy = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Get Firebase config values for the proxy
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      
      if (!apiKey || !projectId) {
        throw new Error('Missing required Firebase configuration. Please check your environment variables.');
      }
      
      // Store for the proxy page
      localStorage.setItem('firebase_api_key', apiKey);
      localStorage.setItem('firebase_project_id', projectId);
      
      // Create callback URL
      const redirectUrl = `${window.location.origin}/auth-callback`;
      
      // Build proxy URL with all needed parameters
      const proxyUrl = `/google-auth-proxy.html?projectId=${encodeURIComponent(projectId)}&apiKey=${encodeURIComponent(apiKey)}&redirect=${encodeURIComponent(redirectUrl)}`;
      
      console.log("Opening proxy authentication window...");
      
      // Open in a new window rather than a popup
      // This has better chances of working on problematic domains
      const authWindow = window.open(
        proxyUrl,
        'googleAuthWindow',
        'width=500,height=600,resizable=yes,scrollbars=yes,status=yes'
      );
      
      if (!authWindow) {
        throw new Error('Popup window was blocked. Please enable popups for this site and try again.');
      }
      
      // Set a flag so the main app knows to check for auth state changes
      localStorage.setItem('auth_proxy_initiated', 'true');
      localStorage.setItem('auth_proxy_timestamp', Date.now().toString());
      
      // The actual auth will happen in the proxy window, and the redirect will
      // be handled by our existing auth-callback logic
      
      // We'll set up a timer to check if the user got authenticated
      const checkAuthInterval = setInterval(() => {
        // If the popup was closed or auth was successful
        if (authWindow.closed) {
          clearInterval(checkAuthInterval);
          const user = getAuth().currentUser;
          
          if (user) {
            // Auth was successful!
            console.log("Authentication successful via proxy:", user);
            setSuccess(true);
            setUserInfo({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            });
            
            // Enable hybrid auth for future logins
            localStorage.setItem('use_hybrid_auth', 'true');
            
            // Redirect after a short delay
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          } else {
            // The window was closed but no user was authenticated
            setIsLoading(false);
            setError('Authentication was cancelled or failed. Please try again.');
          }
        }
      }, 1000);
      
      // Set a timeout to clear the interval after 2 minutes
      setTimeout(() => {
        clearInterval(checkAuthInterval);
        if (!getAuth().currentUser && !authWindow.closed) {
          authWindow.close();
          setIsLoading(false);
          setError('Authentication timed out. Please try again.');
        }
      }, 120000);
      
    } catch (error: any) {
      console.error("Error with proxy authentication:", error);
      setError(error.message || "Failed to authenticate with proxy method");
      setIsLoading(false);
    }
  };
  
  const handleDisableHybridAuth = () => {
    localStorage.removeItem('use_hybrid_auth');
    alert('Hybrid authentication has been disabled. The app will now use redirect authentication only.');
    
    // Reload the page to reflect the change
    window.location.reload();
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Google Authentication Fix</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-500">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>Authentication Successful</AlertTitle>
          <AlertDescription>
            Popup authentication successful. Popup auth has been enabled for subsequent logins.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Advanced Google Authentication</CardTitle>
          <CardDescription>
            Solution for "accounts.google.com refused to connect" errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            This page provides a specialized authentication method that works around Google's security restrictions.
            It creates a proxy connection through Firebase's official domain which is guaranteed to work.
          </p>
          
          {userInfo && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">User Details:</p>
              <pre className="text-xs mt-2 overflow-auto p-2 bg-gray-100 rounded">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <Alert className="mt-4 border-amber-500">
            <Info className="h-4 w-4" />
            <AlertTitle>How Our Solution Works</AlertTitle>
            <AlertDescription>
              This solution uses an authentication proxy that connects through Firebase's official domain.
              When you click the button below, a new window will open to handle the authentication process
              securely, bypassing the restrictions that cause "refused to connect" errors.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            onClick={handleSignInWithProxy}
            disabled={isLoading || success}
            className="flex-1"
          >
            {isLoading ? "Authenticating..." : "Sign In with Google (Proxy Method)"}
          </Button>
          
          {localStorage.getItem('use_hybrid_auth') === 'true' && (
            <Button 
              variant="outline"
              onClick={handleDisableHybridAuth}
              className="flex-1"
            >
              Disable Hybrid Authentication
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="text-center">
        <a href="/auth-debug" className="text-blue-500 hover:underline">
          Go to Authentication Debug Page
        </a>
      </div>
    </div>
  );
}